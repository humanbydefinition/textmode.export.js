import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';
import { decodeTextmodeDocument } from '../../src/document';

const ROOT = path.resolve(import.meta.dirname, '../..');

function readJSON(relativePath: string): unknown {
	return JSON.parse(readFileSync(path.join(ROOT, relativePath), 'utf8')) as unknown;
}

describe('published textmode document contract', () => {
	it('declares the Draft 2020-12 schema identity', () => {
		const schema = readJSON('schemas/textmode-document-2.0.schema.json') as Record<string, unknown>;
		expect(schema.$schema).toBe('https://json-schema.org/draft/2020-12/schema');
		expect(schema.$id).toBe('https://textmode.art/schemas/textmode-document-2.0.schema.json');
		expect(schema.oneOf).toEqual(expect.any(Array));
	});

	it.each([
		['fixtures/textmode-document-selected-v2.json', 'selected', false],
		['fixtures/textmode-document-create-integration-v2.json', 'selected', false],
		['fixtures/textmode-document-all-v2.json', 'all', false],
		['fixtures/textmode-layer-selected-v1.json', 'selected', true],
		['fixtures/textmode-layer-all-v1.1.json', 'all', true],
	] as const)('decodes the canonical fixture %s', (fixturePath, target, isLegacy) => {
		const result = decodeTextmodeDocument(readJSON(fixturePath));
		expect(result.ok).toBe(true);
		if (!result.ok) return;

		expect(result.document.target).toBe(target);
		expect(result.warnings.length > 0).toBe(isLegacy);
	});

	it('keeps the cross-app fixture’s odd/even grid, alpha, Unicode, transforms, and empty-cell semantics', () => {
		const result = decodeTextmodeDocument(readJSON('fixtures/textmode-document-create-integration-v2.json'));
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
