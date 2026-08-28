import { describe, expect, it } from 'vitest';
import { createZIPFramePath, createZIPManifest, encodeZIPManifest } from './ZIPManifest';

describe('ZIP manifest policy', () => {
	it('builds the versioned manifest and stable one-based frame paths', () => {
		const manifest = createZIPManifest({
			createdAt: new Date('2026-08-28T12:00:00.000Z'),
			format: 'png',
			frameCount: 120,
			frameRate: 30,
			extension: '.png',
		});
		expect(manifest).toMatchObject({
			schema: 'textmode.frame-sequence',
			schemaVersion: '1.0.0',
			createdAt: '2026-08-28T12:00:00.000Z',
			format: 'png',
			frameCount: 120,
			frameRate: 30,
			indexBase: 1,
			filePattern: 'frames/frame-%06d.png',
		});
		expect(createZIPFramePath('orbit', 0, '.png')).toBe('orbit/frames/frame-000001.png');
		expect(createZIPFramePath('orbit', 119, '.png')).toBe('orbit/frames/frame-000120.png');
		expect(new TextDecoder().decode(encodeZIPManifest(manifest))).toBe(`${JSON.stringify(manifest, null, 2)}\n`);
	});
});
