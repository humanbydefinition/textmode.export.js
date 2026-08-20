import { VideoExportError } from './errors';
import type {
	VideoBitrateMode,
	VideoBitratePreset,
	VideoCodec,
	VideoContentHint,
	VideoEncodingPlan,
	VideoGenerationOptions,
} from './types';

export const MAX_SAFE_IN_MEMORY_VIDEO_BYTES = 100_000_000;
export const ULTRA_FALLBACK_BITS_PER_PIXEL_PER_FRAME = 0.5;

const MIN_VIDEO_BITRATE = 250_000;
const CONTAINER_OVERHEAD_BYTES = 1_000_000;
const ESTIMATE_SAFETY_FACTOR = 1.1;

const QUALITY_LEVELS: Record<Exclude<VideoBitratePreset, 'ultra'>, 'medium' | 'high' | 'very-high'> = {
	low: 'medium',
	medium: 'high',
	high: 'very-high',
};

const VIDEO_BITRATE_PRESETS: VideoBitratePreset[] = ['low', 'medium', 'high', 'ultra'];

const QUALITY_FACTORS: Record<'medium' | 'high' | 'very-high', number> = {
	medium: 0.3 * Math.exp(2.5538 * 0.5),
	high: 0.3 * Math.exp(2.5538 * 0.75),
	'very-high': 0.3 * Math.exp(2.5538),
};

const CODEC_EFFICIENCY: Partial<Record<VideoCodec, number>> = {
	avc: 1,
	vp9: 0.6,
	vp8: 1.2,
};

export type VideoQualityDescriptor =
	| { kind: 'named'; level: 'medium' | 'high' | 'very-high' }
	| { kind: 'bitrate'; bitrate: number; bitrateMode: VideoBitrateMode }
	| { kind: 'ultra'; bitrate: number };

export function resolveUltraFallbackBitrate(width: number, height: number, frameRate: number): number {
	return Math.max(1_000_000, Math.round(width * height * frameRate * ULTRA_FALLBACK_BITS_PER_PIXEL_PER_FRAME));
}

export function estimateVideoOutputBytes(bitrate: number, frameCount: number, frameRate: number): number {
	const duration = frameCount / frameRate;
	return Math.ceil((bitrate * duration * ESTIMATE_SAFETY_FACTOR) / 8 + CONTAINER_OVERHEAD_BYTES);
}

export function getVideoQualityDescriptor(plan: VideoEncodingPlan): VideoQualityDescriptor {
	if (plan.rateControlIntent === 'ultra') {
		return { kind: 'ultra', bitrate: plan.bitrate };
	}
	if (plan.qualityLevel) {
		return { kind: 'named', level: plan.qualityLevel };
	}
	return { kind: 'bitrate', bitrate: plan.bitrate, bitrateMode: plan.bitrateMode };
}

export function normalizeVideoContentHint(value: VideoContentHint | undefined): VideoContentHint {
	return value === '' || value === 'motion' || value === 'detail' || value === 'text' ? value : 'text';
}

export function createVideoEncodingPlan(options: VideoGenerationOptions, codec: VideoCodec = 'avc'): VideoEncodingPlan {
	if (options.format === 'mp4' && options.transparent) {
		throw new VideoExportError(
			'VIDEO_TRANSPARENCY_UNSUPPORTED',
			"MP4/H.264 export does not support portable alpha. Use saveVideo({ format: 'webm', transparent: true }) instead."
		);
	}

	const width = Math.max(1, Math.round(options.width));
	const height = Math.max(1, Math.round(options.height));
	if (options.format === 'mp4' && (width % 2 !== 0 || height % 2 !== 0)) {
		throw new VideoExportError(
			'VIDEO_DIMENSIONS_UNSUPPORTED',
			`MP4/H.264 requires even dimensions; received ${width}x${height}. Increase pixel density or choose WebM.`
		);
	}

	const bitrateValue = options.bitrate;
	const qualityPreset =
		typeof bitrateValue === 'string' && VIDEO_BITRATE_PRESETS.includes(bitrateValue as VideoBitratePreset)
			? (bitrateValue as VideoBitratePreset)
			: null;
	const rateControlIntent = qualityPreset === 'ultra' ? 'ultra' : qualityPreset ? 'constant-quality' : 'bitrate';
	const bitrate =
		typeof bitrateValue === 'number' && Number.isFinite(bitrateValue) && bitrateValue > 0
			? Math.round(bitrateValue)
			: qualityPreset === 'ultra'
				? resolveUltraFallbackBitrate(width, height, options.frameRate)
				: resolvePresetBitrate(qualityPreset ?? 'medium', codec, width, height);
	const qualityLevel = qualityPreset && qualityPreset !== 'ultra' ? QUALITY_LEVELS[qualityPreset] : undefined;

	return {
		format: options.format,
		extension: options.format === 'mp4' ? '.mp4' : '.webm',
		mimeType: options.format === 'mp4' ? 'video/mp4' : 'video/webm',
		codec,
		bitrate,
		bitrateMode: options.bitrateMode,
		qualityPreset,
		rateControlIntent,
		qualityLevel,
		contentHint: normalizeVideoContentHint(options.contentHint),
		estimatedBytes: estimateVideoOutputBytes(bitrate, options.frameCount, options.frameRate),
		latencyMode: options.latencyMode,
		hardwareAcceleration: options.hardwareAcceleration,
		keyFrameInterval: options.keyFrameInterval,
		frameRate: options.frameRate,
		frameCount: options.frameCount,
		width,
		height,
		transparent: options.transparent,
	};
}

function resolvePresetBitrate(
	preset: Exclude<VideoBitratePreset, 'ultra'>,
	codec: VideoCodec,
	width: number,
	height: number
): number {
	const pixels = width * height;
	const baseBitrate = 3_000_000 * Math.pow(pixels / (1920 * 1080), 0.95);
	const codecFactor = CODEC_EFFICIENCY[codec] ?? 1;
	return Math.max(
		MIN_VIDEO_BITRATE,
		Math.ceil((baseBitrate * codecFactor * QUALITY_FACTORS[QUALITY_LEVELS[preset]]) / 1000) * 1000
	);
}

export function assertVideoOutputFitsMemory(plan: VideoEncodingPlan, allowLargeInMemory: boolean): void {
	if (allowLargeInMemory || plan.estimatedBytes <= MAX_SAFE_IN_MEMORY_VIDEO_BYTES) return;
	throw new VideoExportError(
		'VIDEO_OUTPUT_TOO_LARGE',
		`The estimated ${formatBytes(plan.estimatedBytes)} video is too large for an in-memory export. ` +
			'Lower the resolution, duration, or quality, or pass allowLargeInMemory: true to toVideoBlob().'
	);
}

function formatBytes(bytes: number): string {
	if (bytes >= 1_000_000_000) return `${(bytes / 1_000_000_000).toFixed(1)} GB`;
	return `${Math.round(bytes / 1_000_000)} MB`;
}
