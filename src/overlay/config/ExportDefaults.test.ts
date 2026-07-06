// @vitest-environment jsdom

import { describe, expect, it } from 'vitest';
import { CURATED_DEFAULTS } from './ExportDefaults';

describe('CURATED_DEFAULTS', () => {
	it('defines the default selected export format', () => {
		expect(CURATED_DEFAULTS.defaultFormat).toBe('txt');
	});

	it('defines values for txt', () => {
		expect(CURATED_DEFAULTS.txt).toEqual({
			preserveTrailingSpaces: false,
			emptyCharacter: ' ',
		});
	});

	it('defines values for json', () => {
		expect(CURATED_DEFAULTS.json).toEqual({
			target: 'selected',
			pretty: true,
			includeMetadata: true,
			colorMode: 'hex',
		});
	});

	it('defines values for image', () => {
		expect(CURATED_DEFAULTS.image).toEqual({
			format: 'png',
			scale: 1,
		});
	});

	it('defines values for svg', () => {
		expect(CURATED_DEFAULTS.svg).toEqual({
			includeBackgroundRectangles: true,
			drawMode: 'fill',
			strokeWidth: 1,
		});
	});

	it('defines values for gif', () => {
		expect(CURATED_DEFAULTS.gif).toEqual({
			frameCount: 300,
			frameRate: 60,
			scale: 1,
			repeat: 0,
		});
	});

	it('defines values for video', () => {
		expect(CURATED_DEFAULTS.video).toEqual({
			format: 'mp4',
			frameCount: 480,
			frameRate: 60,
			bitrate: 'medium',
			bitrateMode: 'variable',
			latencyMode: 'quality',
			hardwareAcceleration: 'no-preference',
			keyFrameInterval: 2,
			transparent: false,
		});
	});

	it('deep-freezes every entry', () => {
		expect(Object.isFrozen(CURATED_DEFAULTS)).toBe(true);
		expect(Object.isFrozen(CURATED_DEFAULTS.image)).toBe(true);
	});
});
