import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';
import {
	decodeTextmodeDocument,
	parseJSON,
	parseTextmodeDocumentJSON,
	TEXTMODE_DOCUMENT_FORMAT,
	TEXTMODE_DOCUMENT_FORMAT_VERSION,
} from './index';

type MutableCellFixture = {
	x: number;
	y: number;
	character: string;
	foreground: unknown;
	background: unknown;
	transform: Record<string, unknown>;
	futureHint?: unknown;
};

type MutableSelectedFixture = Record<string, unknown> & {
	format: string;
	formatVersion: string;
	target: string;
	canvas: { width: number; height: number };
	layer: {
		cells: {
			encoding: string;
			rows: MutableCellFixture[][];
		};
	};
};

function readFixture(name: string): unknown {
	const fixturePath = path.resolve(import.meta.dirname, '../../fixtures', name);
	return JSON.parse(readFileSync(fixturePath, 'utf8')) as unknown;
}

function selectedFixture(): MutableSelectedFixture {
	return readFixture('textmode-document-selected-v2.json') as MutableSelectedFixture;
}

describe('textmode document codec', () => {
	it('parses JSON syntax separately from semantic decoding', () => {
		expect(parseJSON('{"format":"textmode.document"}')).toEqual({
			ok: true,
			value: { format: 'textmode.document' },
		});
		expect(parseJSON('{')).toMatchObject({
			ok: false,
			error: { code: 'INVALID_JSON' },
		});
	});

	it('decodes and canonicalizes a selected v2 cell snapshot', () => {
		const result = decodeTextmodeDocument(selectedFixture());
		expect(result.ok).toBe(true);
		if (!result.ok || result.document.target !== 'selected') return;

		expect(result.warnings).toEqual([]);
		expect(result.document.format).toBe(TEXTMODE_DOCUMENT_FORMAT);
		expect(result.document.formatVersion).toBe(TEXTMODE_DOCUMENT_FORMAT_VERSION);
		expect(result.document.layer.cells.rows[0][0].foreground).toEqual({
			r: 255,
			g: 0,
			b: 0,
			a: 255,
		});
		expect(result.document.layer.cells.rows[0][1].character).toBe('😀');
		expect(result.document.layer.cells.rows[0][1].transform.rotation).toBe(0);
	});

	it('decodes all-layer documents without applying editor import policy', () => {
		const result = decodeTextmodeDocument(readFixture('textmode-document-all-v2.json'));
		expect(result.ok).toBe(true);
		if (!result.ok || result.document.target !== 'all') return;

		expect(result.document.layers).toHaveLength(1);
		expect(result.document.layers[0].cells.rows[0][0].transform).toMatchObject({
			invert: true,
			rotation: 270,
		});
	});

	it.each([
		['textmode-layer-selected-v1.json', 'selected'],
		['textmode-layer-all-v1.1.json', 'all'],
	] as const)('migrates the legacy fixture %s', (fixture, target) => {
		const result = decodeTextmodeDocument(readFixture(fixture));
		expect(result.ok).toBe(true);
		if (!result.ok) return;

		expect(result.document.target).toBe(target);
		expect(result.document.format).toBe(TEXTMODE_DOCUMENT_FORMAT);
		expect(result.document.formatVersion).toBe(TEXTMODE_DOCUMENT_FORMAT_VERSION);
		expect(result.warnings).toEqual([expect.objectContaining({ code: 'LEGACY_DOCUMENT_MIGRATED' })]);
	});

	it('can disable legacy migrations', () => {
		const result = decodeTextmodeDocument(readFixture('textmode-layer-selected-v1.json'), {
			acceptLegacy: false,
		});
		expect(result).toMatchObject({
			ok: false,
			error: { code: 'UNSUPPORTED_FORMAT', path: '$.format' },
		});
	});

	it.each([
		['format', 'another.format', 'UNSUPPORTED_FORMAT', '$.format'],
		['formatVersion', '2.1.0', 'UNSUPPORTED_VERSION', '$.formatVersion'],
		['target', 'animation', 'UNSUPPORTED_TARGET', '$.target'],
	] as const)('returns a typed error for unsupported %s', (member, value, code, errorPath) => {
		const document = selectedFixture();
		document[member] = value;
		expect(decodeTextmodeDocument(document)).toMatchObject({
			ok: false,
			error: { code, path: errorPath },
		});
	});

	it('rejects unknown tagged cell encodings', () => {
		const document = selectedFixture();
		document.layer.cells.encoding = 'packed-v2';
		expect(decodeTextmodeDocument(document)).toMatchObject({
			ok: false,
			error: { code: 'UNSUPPORTED_ENCODING', path: '$.layer.cells.encoding' },
		});
	});

	it('rejects row length and redundant coordinate disagreement', () => {
		const shortRow = selectedFixture();
		shortRow.layer.cells.rows[0].pop();
		expect(decodeTextmodeDocument(shortRow)).toMatchObject({
			ok: false,
			error: { code: 'INVALID_DOCUMENT', path: '$.layer.cells.rows[0]' },
		});

		const wrongCoordinate = selectedFixture();
		wrongCoordinate.layer.cells.rows[0][0].x = 1;
		expect(decodeTextmodeDocument(wrongCoordinate)).toMatchObject({
			ok: false,
			error: { code: 'INVALID_DOCUMENT', path: '$.layer.cells.rows[0][0]' },
		});
	});

	it('rejects invalid colors and accepts six-digit RGB', () => {
		const invalid = selectedFixture();
		invalid.layer.cells.rows[0][0].foreground = '#xyz';
		expect(decodeTextmodeDocument(invalid)).toMatchObject({
			ok: false,
			error: { code: 'INVALID_DOCUMENT', path: '$.layer.cells.rows[0][0].foreground' },
		});

		const rgb = selectedFixture();
		rgb.layer.cells.rows[0][0].foreground = '#123456';
		const result = decodeTextmodeDocument(rgb);
		expect(result.ok).toBe(true);
		if (!result.ok || result.document.target !== 'selected') return;
		expect(result.document.layer.cells.rows[0][0].foreground).toEqual({
			r: 18,
			g: 52,
			b: 86,
			a: 255,
		});
	});

	it('enforces caller-supplied resource budgets', () => {
		expect(decodeTextmodeDocument(selectedFixture(), { limits: { maxCells: 3 } })).toMatchObject({
			ok: false,
			error: { code: 'LIMIT_EXCEEDED', path: '$.layer.cells.rows' },
		});

		expect(() => decodeTextmodeDocument(selectedFixture(), { limits: { maxCells: 0 } })).toThrow(TypeError);
	});

	it('enforces the legacy grid-pixel extent meaning of canvas', () => {
		const document = selectedFixture();
		document.canvas.width = 17;
		expect(decodeTextmodeDocument(document)).toMatchObject({
			ok: false,
			error: { code: 'INVALID_DOCUMENT', path: '$.canvas' },
		});
	});

	it.each(['A\u0301', '👩‍💻', 'A\ufe0f'])('preserves a well-formed glyph string %j', (character) => {
		const document = selectedFixture();
		document.layer.cells.rows[0][0].character = character;
		const result = decodeTextmodeDocument(document);
		expect(result.ok).toBe(true);
		if (!result.ok || result.document.target !== 'selected') return;
		expect(result.document.layer.cells.rows[0][0].character).toBe(character);
	});

	it('rejects unpaired surrogates and bounded glyph-string violations', () => {
		const malformed = selectedFixture();
		malformed.layer.cells.rows[0][0].character = '\ud800';
		expect(decodeTextmodeDocument(malformed)).toMatchObject({
			ok: false,
			error: { code: 'INVALID_DOCUMENT', path: '$.layer.cells.rows[0][0].character' },
		});

		const oversized = selectedFixture();
		oversized.layer.cells.rows[0][0].character = 'AB';
		expect(
			decodeTextmodeDocument(oversized, {
				limits: { maxCharacterLength: 1 },
			})
		).toMatchObject({
			ok: false,
			error: { code: 'LIMIT_EXCEEDED', path: '$.layer.cells.rows[0][0].character' },
		});
	});

	it('ignores unknown ordinary properties for the supported version', () => {
		const document = selectedFixture();
		document.futureHint = { enabled: true };
		document.layer.cells.rows[0][0].futureHint = 'ignored';
		expect(decodeTextmodeDocument(document).ok).toBe(true);
	});

	it('provides a parse-and-decode convenience function', () => {
		const json = JSON.stringify(selectedFixture());
		expect(parseTextmodeDocumentJSON(json).ok).toBe(true);
		expect(parseTextmodeDocumentJSON('{')).toMatchObject({
			ok: false,
			error: { code: 'INVALID_JSON' },
		});
	});

	it('keeps the document source tree free of runtime renderer and encoder dependencies', () => {
		const sourceDir = path.resolve(import.meta.dirname);
		for (const file of readdirSync(sourceDir).filter(
			(name) => name.endsWith('.ts') && !name.endsWith('.test.ts')
		)) {
			const source = readFileSync(path.join(sourceDir, file), 'utf8');
			expect(source).not.toMatch(/from ['"]textmode\.js['"]/);
			expect(source).not.toMatch(/exporters\/(?:gif|video|zip|image)/);
			expect(source).not.toMatch(/\b(?:window|document)\s*\./);
			expect(source).not.toMatch(/\b(?:new\s+Blob|HTMLElement)\b/);
		}
	});
});
