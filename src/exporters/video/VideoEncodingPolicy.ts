import { VideoExportError } from './errors';
import type { VideoCodec, VideoEncodingPlan, VideoGenerationOptions } from './types';

/** Resolves product-level format constraints independently of encoder probing. */
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

	return {
		format: options.format,
		extension: options.format === 'mp4' ? '.mp4' : '.webm',
		mimeType: options.format === 'mp4' ? 'video/mp4' : 'video/webm',
		codec,
		quality: options.quality,
		hardwareAcceleration: options.hardwareAcceleration,
		keyFrameInterval: options.keyFrameInterval,
		frameRate: options.frameRate,
		frameCount: options.frameCount,
		width,
		height,
		transparent: options.transparent,
	};
}
