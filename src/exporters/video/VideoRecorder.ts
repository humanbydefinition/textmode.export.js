import {
	BufferTarget,
	CanvasSource,
	Mp4OutputFormat,
	Output,
	WebMOutputFormat,
	getFirstEncodableVideoCodec,
	type VideoCodec,
} from 'mediabunny';
import { VideoExportError, createAbortError } from './errors';
import type {
	VideoBitratePreset,
	VideoEncodingPlan,
	VideoExportProgress,
	VideoFrameDriverLike,
	VideoGenerationOptions,
} from './types';

const WEBM_CODEC_PREFERENCES: VideoCodec[] = ['vp9', 'vp8'];
const MP4_CODEC_PREFERENCES: VideoCodec[] = ['avc'];

/**
 * Records deterministic textmode frames through WebCodecs and muxes them with Mediabunny.
 */
export class VideoRecorder {
	public async $record(
		options: VideoGenerationOptions,
		frameDriver: VideoFrameDriverLike,
		onProgress?: (progress: VideoExportProgress) => void
	): Promise<Blob> {
		this._throwIfAborted(options.signal);
		this._assertWebCodecsAvailable();

		const plan = await this._createEncodingPlan(options);
		this._log(options, 'video export plan', plan);
		this._emitProgress(onProgress, 'recording', 'probing', 0, plan.frameCount);

		const format = plan.format === 'mp4' ? new Mp4OutputFormat() : new WebMOutputFormat();
		const target = new BufferTarget();
		const output = new Output({ format, target });
		const source = new CanvasSource(frameDriver.canvas, {
			codec: plan.codec,
			bitrate: plan.bitrate,
			alpha: plan.transparent ? 'keep' : 'discard',
			bitrateMode: plan.bitrateMode,
			latencyMode: plan.latencyMode,
			hardwareAcceleration: plan.hardwareAcceleration,
			keyFrameInterval: plan.keyFrameInterval,
			sizeChangeBehavior: 'deny',
		});

		output.addVideoTrack(source);

		try {
			await output.start();

			await frameDriver.$render({
				frameCount: plan.frameCount,
				frameRate: plan.frameRate,
				signal: options.signal,
				onFrame: async ({ frameIndex }) => {
					this._throwIfAborted(options.signal);
					await source.add(frameIndex / plan.frameRate, 1 / plan.frameRate);
					this._emitProgress(onProgress, 'recording', 'rendering', frameIndex + 1, plan.frameCount);
				},
			});

			this._throwIfAborted(options.signal);
			this._emitProgress(onProgress, 'encoding', 'finalizing', plan.frameCount, plan.frameCount);
			await output.finalize();

			this._emitProgress(onProgress, 'completed', 'finalizing', plan.frameCount, plan.frameCount);
			if (!target.buffer) {
				throw new VideoExportError('VIDEO_EXPORT_FAILED', 'Video encoder finalized without producing data.');
			}
			return new Blob([target.buffer], { type: plan.mimeType });
		} catch (error) {
			const exportError = this._normalizeError(error);
			onProgress?.({ state: 'error', message: exportError.message });
			throw exportError;
		}
	}

	private async _createEncodingPlan(options: VideoGenerationOptions): Promise<VideoEncodingPlan> {
		if (options.format === 'mp4' && options.transparent) {
			throw new VideoExportError(
				'VIDEO_TRANSPARENCY_UNSUPPORTED',
				"MP4/H.264 export does not support portable alpha. Use saveVideo({ format: 'webm', transparent: true }) instead."
			);
		}

		const width = Math.max(1, Math.round(options.width));
		const height = Math.max(1, Math.round(options.height));
		const bitrate = this._resolveBitrate(options.bitrate, width, height, options.frameRate);
		const format = options.format === 'mp4' ? new Mp4OutputFormat() : new WebMOutputFormat();
		const codecPreferences = options.format === 'mp4' ? MP4_CODEC_PREFERENCES : WEBM_CODEC_PREFERENCES;
		const containableCodecs = format
			.getSupportedVideoCodecs()
			.filter((codec): codec is VideoCodec => codecPreferences.includes(codec as VideoCodec));
		const codec = await getFirstEncodableVideoCodec(containableCodecs, {
			width,
			height,
			bitrate,
		});

		if (!codec) {
			const requested = codecPreferences.join(' or ');
			throw new VideoExportError(
				'VIDEO_CODEC_UNSUPPORTED',
				`This browser cannot encode ${requested} at ${width}x${height}. Try a browser/device with native WebCodecs encoding support or reduce the export dimensions.`
			);
		}

		return {
			format: options.format,
			extension: options.format === 'mp4' ? '.mp4' : '.webm',
			mimeType: format.mimeType,
			codec,
			bitrate,
			bitrateMode: options.bitrateMode,
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

	private _assertWebCodecsAvailable(): void {
		const host = globalThis as typeof globalThis & {
			VideoEncoder?: unknown;
			VideoFrame?: unknown;
		};

		if (typeof host.VideoEncoder !== 'function' || typeof host.VideoFrame !== 'function') {
			throw new VideoExportError(
				'VIDEO_EXPORT_UNSUPPORTED',
				'Video export requires native WebCodecs VideoEncoder and VideoFrame support. This browser cannot produce deterministic video exports without a native encoder.'
			);
		}
	}

	private _resolveBitrate(
		bitrate: number | VideoBitratePreset,
		width: number,
		height: number,
		frameRate: number
	): number {
		if (typeof bitrate === 'number' && Number.isFinite(bitrate) && bitrate > 0) {
			return Math.round(bitrate);
		}

		const preset = typeof bitrate === 'string' ? bitrate : 'medium';
		const pixels = width * height;
		const rateFactor = Math.max(0.5, frameRate / 60);
		const bitsPerPixel = preset === 'high' ? 6 : preset === 'low' ? 1.5 : 3;

		return Math.max(250_000, Math.round(pixels * rateFactor * bitsPerPixel));
	}

	private _throwIfAborted(signal?: AbortSignal): void {
		if (signal?.aborted) {
			throw createAbortError();
		}
	}

	private _emitProgress(
		onProgress: ((progress: VideoExportProgress) => void) | undefined,
		state: VideoExportProgress['state'],
		phase: VideoExportProgress['phase'],
		frameIndex: number,
		totalFrames: number
	): void {
		onProgress?.({
			state,
			phase,
			frameIndex,
			frame: frameIndex,
			totalFrames,
			progress: totalFrames > 0 ? frameIndex / totalFrames : 0,
		});
	}

	private _normalizeError(error: unknown): VideoExportError {
		if (error instanceof VideoExportError) {
			return error;
		}
		return new VideoExportError(
			'VIDEO_EXPORT_FAILED',
			error instanceof Error ? error.message : 'Video export failed.',
			error
		);
	}

	private _log(options: VideoGenerationOptions, ...args: unknown[]): void {
		if (options.debugLogging) {
			console.debug('[textmode-export]', ...args);
		}
	}
}
