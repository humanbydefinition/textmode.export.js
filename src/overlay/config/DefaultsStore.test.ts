// @vitest-environment jsdom

import { describe, expect, it } from 'vitest';
import { DefaultsStore } from './DefaultsStore';

describe('DefaultsStore', () => {
	it('starts with the curated defaults', () => {
		const store = new DefaultsStore();
		expect(store.current.txt).toMatchObject({ preserveTrailingSpaces: false, emptyCharacter: ' ' });
		expect(store.current.json).toMatchObject({ target: 'selected', pretty: true, includeMetadata: true });
		expect(store.current.image).toMatchObject({ format: 'png', scale: 1 });
		expect(store.current.svg).toMatchObject({
			includeBackgroundRectangles: true,
			drawMode: 'fill',
			strokeWidth: 1,
		});
		expect(store.current.gif).toMatchObject({ frameCount: 300, frameRate: 60, scale: 1, repeat: 0 });
		expect(store.current.video).toMatchObject({
			format: 'mp4',
			frameCount: 480,
			frameRate: 60,
			bitrate: 'medium',
		});
	});

	it('merges a partial patch', () => {
		const store = new DefaultsStore();
		store.merge({ image: { scale: 2 }, gif: { frameRate: 30 } });

		expect(store.current.image.scale).toBe(2);
		expect(store.current.gif.frameRate).toBe(30);
		// Unchanged fields keep their curated values
		expect(store.current.image.format).toBe('png');
		expect(store.current.gif.frameCount).toBe(300);
	});

	it('returns cloned snapshots from current and snapshot', () => {
		const store = new DefaultsStore();
		const current = store.current;
		const snapshot = store.snapshot();

		current.image.scale = 8;
		snapshot.gif.frameRate = 12;

		expect(store.get('image').scale).toBe(1);
		expect(store.get('gif').frameRate).toBe(60);
		expect(store.current.image).not.toBe(store.current.image);
	});

	it('resets a single format to curated defaults', () => {
		const store = new DefaultsStore();
		const imageDefaults = store.get('image');
		store.merge({ image: { scale: 4 }, gif: { frameRate: 15 } });
		store.reset('image');

		expect(store.get('image')).toBe(imageDefaults);
		expect(store.current.image.scale).toBe(1); // Restored to curated
		expect(store.current.gif.frameRate).toBe(15); // Unchanged
	});

	it('resets all formats to curated defaults', () => {
		const store = new DefaultsStore();
		const imageDefaults = store.get('image');
		(store.get('image') as Record<string, unknown>).filename = 'custom';
		store.merge({ image: { scale: 4 }, gif: { frameRate: 15 } });
		store.reset();

		expect(store.get('image')).toBe(imageDefaults);
		expect(store.current.image.scale).toBe(1);
		expect(store.current.gif.frameRate).toBe(60);
		expect((store.current.image as Record<string, unknown>).filename).toBeUndefined();
	});

	it('returns current effective defaults for a single format', () => {
		const store = new DefaultsStore();
		expect(store.get('image')).toMatchObject({ format: 'png', scale: 1 });
	});
});
