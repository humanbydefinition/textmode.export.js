import { describe, expect, it } from 'vitest';
import {
	MAX_SAFE_IN_MEMORY_VIDEO_BYTES,
	assertVideoOutputFitsMemory,
	createVideoEncodingPlan,
	resolveUltraFallbackBitrate,
} from './VideoEncodingPolicy';
import type { VideoGenerationOptions } from './types';

function createOptions(overrides: Partial<VideoGenerationOptions> = {}): VideoGenerationOptions {
	return {
		format: 'mp4',
		frameRate: 60,
		frameCount: 120,
		bitrate: 'medium',
		bitrateMode: 'variable',
		latencyMode: 'quality',
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
	it('maps public named presets to the intended Mediabunny quality levels', () => {
		expect(createVideoEncodingPlan(createOptions({ bitrate: 'low' })).qualityLevel).toBe('medium');
		expect(createVideoEncodingPlan(createOptions({ bitrate: 'medium' })).qualityLevel).toBe('high');
		expect(createVideoEncodingPlan(createOptions({ bitrate: 'high' })).qualityLevel).toBe('very-high');
	});

	it('maps ultra to quantizer intent and scales its fallback with frame rate', () => {
		const thirty = createVideoEncodingPlan(createOptions({ bitrate: 'ultra', frameRate: 30 }));
		const sixty = createVideoEncodingPlan(createOptions({ bitrate: 'ultra', frameRate: 60 }));
		expect(thirty.rateControlIntent).toBe('ultra');
		expect(sixty.bitrate).toBe(thirty.bitrate * 2);
		expect(resolveUltraFallbackBitrate(640, 360, 30)).toBe(3_456_000);
	});

	it('keeps numeric bitrate values exact after integer normalization', () => {
		const plan = createVideoEncodingPlan(createOptions({ bitrate: 1_500_000.8, bitrateMode: 'constant' }));
		expect(plan.bitrate).toBe(1_500_001);
		expect(plan.rateControlIntent).toBe('bitrate');
	});

	it('rejects odd MP4 dimensions before capture', () => {
		expect(() => createVideoEncodingPlan(createOptions({ width: 641 }))).toThrowError(/even dimensions/);
	});

	it('blocks unsafe in-memory output unless explicitly allowed', () => {
		const plan = createVideoEncodingPlan(createOptions({ bitrate: 100_000_000, frameCount: 600 }));
		expect(plan.estimatedBytes).toBeGreaterThan(MAX_SAFE_IN_MEMORY_VIDEO_BYTES);
		expect(() => assertVideoOutputFitsMemory(plan, false)).toThrowError(/too large/);
		expect(() => assertVideoOutputFitsMemory(plan, true)).not.toThrow();
	});
});
