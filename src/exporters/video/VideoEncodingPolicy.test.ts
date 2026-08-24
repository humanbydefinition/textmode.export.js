import { describe, expect, it } from 'vitest';
import { createVideoEncodingPlan } from './VideoEncodingPolicy';
import type { VideoGenerationOptions } from './types';

function createOptions(overrides: Partial<VideoGenerationOptions> = {}): VideoGenerationOptions {
	return {
		format: 'mp4',
		frameRate: 60,
		frameCount: 120,
		quality: 'medium',
		hardwareAcceleration: 'no-preference',
		keyFrameInterval: 2,
		pixelDensity: 1,
		width: 640,
		height: 360,
		transparent: false,
		debugLogging: false,
		...overrides,
	};
}

describe('VideoEncodingPolicy', () => {
	it('preserves named quality levels without remapping them', () => {
		expect(createVideoEncodingPlan(createOptions({ quality: 'very-low' })).quality).toBe('very-low');
		expect(createVideoEncodingPlan(createOptions({ quality: 'very-high' })).quality).toBe('very-high');
	});

	it('preserves explicit bitrate quality', () => {
		const quality = { bitrate: 1_500_001, bitrateMode: 'constant' } as const;
		expect(createVideoEncodingPlan(createOptions({ quality })).quality).toEqual(quality);
	});

	it('rejects odd MP4 dimensions before capture', () => {
		expect(() => createVideoEncodingPlan(createOptions({ width: 641 }))).toThrowError(/even dimensions/);
	});

	it('allows odd WebM dimensions', () => {
		expect(createVideoEncodingPlan(createOptions({ format: 'webm', width: 641 })).width).toBe(641);
	});
});
