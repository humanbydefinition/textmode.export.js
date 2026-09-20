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
});
