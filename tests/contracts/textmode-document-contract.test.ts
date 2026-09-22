import { readFileSync } from 'node:fs';
import path from 'node:path';

import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { describe, expect, it } from 'vitest';
import { decodeTextmodeDocument } from '../../src/document';

const ROOT = path.resolve(import.meta.dirname, '../..');
const FORMAT_ROOT = 'protocol/textmode-document/2.0';
const SCHEMA_PATH = `${FORMAT_ROOT}/textmode-document-2.0.schema.json`;
const FIXTURE_ROOT = `${FORMAT_ROOT}/fixtures`;

const v2Fixtures = [
	'textmode-document-selected-v2.json',
	'textmode-document-create-integration-v2.json',
	'textmode-document-all-v2.json',
] as const;

type MutableSelectedDocument = {
	format: string;
	formatVersion: string;
	target: string;
	metadata: { createdAt: string; generator: { name: string; version: string } };
	layer: { cells: { encoding: string; rows: { x: number }[][] } };
};

function readJSON(relativePath: string): unknown {
	return JSON.parse(readFileSync(path.join(ROOT, relativePath), 'utf8')) as unknown;
}

function readFixture(name: string): unknown {
	return readJSON(`${FIXTURE_ROOT}/${name}`);
}

function selectedFixture(): MutableSelectedDocument {
	return readFixture('textmode-document-selected-v2.json') as MutableSelectedDocument;
}

const ajv = new Ajv2020({ validateFormats: true });
addFormats(ajv, { mode: 'full' });
const validateV2 = ajv.compile(readJSON(SCHEMA_PATH) as object);

describe('published textmode document contract', () => {
	it('declares the Draft 2020-12 schema identity', () => {
		const schema = readJSON(SCHEMA_PATH) as Record<string, unknown>;
		expect(schema.$schema).toBe('https://json-schema.org/draft/2020-12/schema');
		expect(schema.$id).toBe('https://textmode.art/schemas/textmode-document-2.0.schema.json');
		expect(schema.oneOf).toEqual(expect.any(Array));
	});

	it.each(v2Fixtures)('validates the published v2 fixture %s against the schema', (name) => {
		expect(validateV2(readFixture(name)), JSON.stringify(validateV2.errors)).toBe(true);
	});

	it.each([
		['textmode-document-selected-v2.json', 'selected', false],
		['textmode-document-create-integration-v2.json', 'selected', false],
		['textmode-document-all-v2.json', 'all', false],
		['textmode-layer-selected-v1.json', 'selected', true],
		['textmode-layer-all-v1.1.json', 'all', true],
	] as const)('decodes the canonical fixture %s', (fixturePath, target, isLegacy) => {
		const result = decodeTextmodeDocument(readFixture(fixturePath));
		expect(result.ok).toBe(true);
		if (!result.ok) return;

		expect(result.document.target).toBe(target);
		expect(result.warnings.length > 0).toBe(isLegacy);
	});

	it.each([
		'not-a-date',
		'2026-02-30T12:00:00Z',
		'2026-09-21t12:00:00Z',
		'2026-09-21T12:00:00',
		'2026-09-21T12:00:60Z',
	])('rejects invalid timestamp %s in schema and decoder', (timestamp) => {
		const document = selectedFixture();
		document.metadata.createdAt = timestamp;
		expect(validateV2(document)).toBe(false);
		expect(decodeTextmodeDocument(document)).toMatchObject({
			ok: false,
			error: { code: 'INVALID_DOCUMENT', path: '$.metadata.createdAt' },
		});
	});

	it('accepts a valid offset timestamp and another producer', () => {
		const document = selectedFixture();
		document.metadata.createdAt = '2026-02-28T12:34:56+02:00';
		document.metadata.generator.name = 'another.textmode.app';
		expect(validateV2(document)).toBe(true);
		const result = decodeTextmodeDocument(document);
		expect(result.ok).toBe(true);
		if (result.ok) expect(result.document.metadata).toEqual(document.metadata);
	});

	it.each(['format', 'formatVersion', 'target', 'encoding', 'generator'])('rejects invalid %s values', (field) => {
		const document = selectedFixture();
		if (field === 'format') document.format = 'another.format';
		if (field === 'formatVersion') document.formatVersion = '2.1.0';
		if (field === 'target') document.target = 'animation';
		if (field === 'encoding') document.layer.cells.encoding = 'packed-v2';
		if (field === 'generator') document.metadata.generator.name = '';
		expect(validateV2(document)).toBe(false);
		expect(decodeTextmodeDocument(document).ok).toBe(false);
	});

	it('leaves cross-field and budget checks to the decoder', () => {
		const document = readFixture('textmode-document-all-v2.json');
		expect(validateV2(document)).toBe(true);
		expect(decodeTextmodeDocument(document, { limits: { maxCells: 2 } })).toMatchObject({
			ok: false,
			error: { code: 'LIMIT_EXCEEDED' },
		});

		const wrongCoordinate = selectedFixture();
		wrongCoordinate.layer.cells.rows[0][0].x = 1;
		expect(validateV2(wrongCoordinate)).toBe(true);
		expect(decodeTextmodeDocument(wrongCoordinate)).toMatchObject({
			ok: false,
			error: { code: 'INVALID_DOCUMENT', path: '$.layer.cells.rows[0][0]' },
		});
	});

	it('keeps the cross-app fixture’s odd/even grid, alpha, Unicode, transforms, and empty-cell semantics', () => {
		const result = decodeTextmodeDocument(readFixture('textmode-document-create-integration-v2.json'));
		expect(result.ok).toBe(true);
		if (!result.ok || result.document.target !== 'selected') return;

		expect(result.document.grid).toMatchObject({ cols: 3, rows: 2 });
		const cells = result.document.layer.cells.rows.flat();
		expect(cells).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					character: '😀',
					background: { r: 0, g: 0, b: 255, a: 96 },
					transform: expect.objectContaining({ flipX: true, rotation: 0 }),
				}),
				expect.objectContaining({
					character: 'é',
					transform: expect.objectContaining({ flipX: true, flipY: true, rotation: 45 }),
				}),
				expect.objectContaining({
					character: ' ',
					background: { r: 18, g: 52, b: 86, a: 255 },
				}),
				expect.objectContaining({
					character: 'X',
					foreground: { r: 0, g: 0, b: 0, a: 0 },
					background: { r: 0, g: 0, b: 0, a: 0 },
				}),
			])
		);
	});
});
