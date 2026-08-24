import {
	BufferTarget,
	CanvasSource,
	canEncodeVideo,
	Mp4OutputFormat,
	Output,
	Quality,
	StreamTarget,
	WebMOutputFormat,
	type StreamTargetChunk,
	type VideoCodec as MediabunnyVideoCodec,
} from 'mediabunny';
import { VideoExportError, createAbortError } from './errors';
import { createVideoEncodingPlan } from './VideoEncodingPolicy';
import { videoFrameTiming } from './VideoFrameSchedule';
import type { VideoEncodingPlan, VideoExportProgress, VideoFrameDriverLike, VideoGenerationOptions } from './types';
import { withAbortableTimeout } from './withAbortableTimeout';

const WEBM_CODEC_PREFERENCES: MediabunnyVideoCodec[] = ['vp9', 'vp8'];
const MP4_CODEC_PREFERENCES: MediabunnyVideoCodec[] = ['avc'];
const VIDEO_OUTPUT_START_TIMEOUT_MS = 30_000;
const VIDEO_OUTPUT_FINALIZE_TIMEOUT_MS = 30_000;

export type VideoOutputDestination =
	| { kind: 'blob' }
	| {
			kind: 'stream';
			writable: WritableStream<StreamTargetChunk>;
			/** Releases a destination selected before encoder probing starts. */
			abort?: (reason?: unknown) => Promise<void>;
	  };

/** Records deterministic textmode frames through WebCodecs and muxes them with Mediabunny. */
export class VideoRecorder {
	public async $record(
		options: VideoGenerationOptions,
		frameDriver: VideoFrameDriverLike,
		onProgress?: (progress: VideoExportProgress) => void,
		destination: VideoOutputDestination = { kind: 'blob' }
	): Promise<Blob | undefined> {
		this._throwIfAborted(options.signal);
		this._assertWebCodecsAvailable();

		const plan = await this._createEncodingPlan(options);
		this._log(options, 'video export plan', plan);
		this._emitProgress(onProgress, 'recording', 'probing', 0, plan.frameCount, plan);

		const format = plan.format === 'mp4' ? new Mp4OutputFormat() : new WebMOutputFormat();
		const target =
			destination.kind === 'stream'
				? new StreamTarget(destination.writable, { chunked: true })
				: new BufferTarget();
		const output = new Output({ format, target });
		const source = new CanvasSource(frameDriver.canvas, {
			codec: plan.codec as MediabunnyVideoCodec,
			quality: this._createQuality(plan),
			alpha: plan.transparent ? 'keep' : 'discard',
			latencyMode: 'quality',
			hardwareAcceleration: plan.hardwareAcceleration,
			keyFrameInterval: plan.keyFrameInterval,
			sizeChangeBehavior: 'deny',
			contentHint: 'text',
			onEncoderConfig: (config) => this._log(options, 'video encoder config', config),
		});
		output.addVideoTrack(source, { frameRate: plan.frameRate });

		let sourceClosed = false;
		let outputCanceled = false;
		const closeSource = () => {
			if (sourceClosed) return;
			sourceClosed = true;
			source.close();
		};
		const cancelOutput = async () => {
			if (outputCanceled) return;
			outputCanceled = true;
			try {
				await output.cancel();
			} catch {
				// Best-effort cleanup only; the original export error is more useful.
			}
		};

		try {
			await withAbortableTimeout(
				output.start(),
				`Video output did not start within ${VIDEO_OUTPUT_START_TIMEOUT_MS}ms.`,
				options.signal,
				VIDEO_OUTPUT_START_TIMEOUT_MS
			);

			await frameDriver.$render({
				frameCount: plan.frameCount,
				frameRate: plan.frameRate,
				signal: options.signal,
				prepareFrame: options.prepareFrame,
				onFrame: async ({ frameIndex }) => {
					this._throwIfAborted(options.signal);
					const timing = videoFrameTiming(frameIndex, plan.frameRate);
					await this._awaitWithAbort(source.add(timing.startSeconds, timing.durationSeconds), options.signal);
					this._emitProgress(onProgress, 'recording', 'capturing', frameIndex + 1, plan.frameCount, plan);
				},
			});

			this._throwIfAborted(options.signal);
			closeSource();
			this._emitProgress(
				onProgress,
				'encoding',
				destination.kind === 'stream' ? 'writing' : 'finalizing',
				plan.frameCount,
				plan.frameCount,
				plan
			);
			await withAbortableTimeout(
				output.finalize(),
				`Video output did not finalize within ${VIDEO_OUTPUT_FINALIZE_TIMEOUT_MS}ms.`,
				options.signal,
				VIDEO_OUTPUT_FINALIZE_TIMEOUT_MS
			);

			this._emitProgress(
				onProgress,
				'completed',
				destination.kind === 'stream' ? 'writing' : 'finalizing',
				plan.frameCount,
				plan.frameCount,
				plan
			);
			if (destination.kind === 'stream') return undefined;
			const bufferTarget = target as BufferTarget;
			if (!bufferTarget.buffer)
				throw new VideoExportError('VIDEO_EXPORT_FAILED', 'Video encoder finalized without producing data.');
			return new Blob([bufferTarget.buffer], { type: plan.mimeType });
		} catch (error) {
			closeSource();
			await cancelOutput();
			const exportError = this._normalizeError(error);
			onProgress?.({ state: 'error', message: exportError.message });
			throw exportError;
		}
	}

	private async _createEncodingPlan(options: VideoGenerationOptions): Promise<VideoEncodingPlan> {
		const preliminaryPlan = createVideoEncodingPlan(options);
		const format = options.format === 'mp4' ? new Mp4OutputFormat() : new WebMOutputFormat();
		const codecPreferences = options.format === 'mp4' ? MP4_CODEC_PREFERENCES : WEBM_CODEC_PREFERENCES;
		const supportedCodecs = format.getSupportedVideoCodecs().filter((codec) => codecPreferences.includes(codec));
		for (const candidate of supportedCodecs) {
			const supported = await canEncodeVideo(candidate, {
				width: preliminaryPlan.width,
				height: preliminaryPlan.height,
				quality: this._createQuality(preliminaryPlan),
				alpha: preliminaryPlan.transparent ? 'keep' : 'discard',
				latencyMode: 'quality',
				hardwareAcceleration: preliminaryPlan.hardwareAcceleration,
				contentHint: 'text',
			});
			if (supported) return createVideoEncodingPlan(options, candidate);
		}

		const requested = codecPreferences.join(' or ');
		throw new VideoExportError(
			'VIDEO_CODEC_UNSUPPORTED',
			`This browser cannot encode ${requested} video at ${preliminaryPlan.width}x${preliminaryPlan.height}. Try another format, lower the export dimensions, or change the encoder preference.`
		);
	}

	private _createQuality(plan: VideoEncodingPlan): Quality {
		return new Quality(plan.quality);
	}

	private _assertWebCodecsAvailable(): void {
		const host = globalThis as typeof globalThis & { VideoEncoder?: unknown; VideoFrame?: unknown };
		if (typeof host.VideoEncoder !== 'function' || typeof host.VideoFrame !== 'function') {
			throw new VideoExportError(
				'VIDEO_EXPORT_UNSUPPORTED',
				'Video export requires native WebCodecs VideoEncoder and VideoFrame support. This browser cannot produce deterministic video exports without a native encoder.'
			);
		}
	}

	private _awaitWithAbort<T>(promise: Promise<T>, signal?: AbortSignal): Promise<T> {
		if (!signal) return promise;
		return new Promise<T>((resolve, reject) => {
			if (signal.aborted) {
				reject(createAbortError());
				return;
			}
			const abort = () => reject(createAbortError());
			signal.addEventListener('abort', abort, { once: true });
			promise.then(
				(value) => {
					signal.removeEventListener('abort', abort);
					resolve(value);
				},
				(error) => {
					signal.removeEventListener('abort', abort);
					reject(error);
				}
			);
		});
	}

	private _throwIfAborted(signal?: AbortSignal): void {
		if (signal?.aborted) throw createAbortError();
	}

	private _emitProgress(
		onProgress: ((progress: VideoExportProgress) => void) | undefined,
		state: VideoExportProgress['state'],
		phase: VideoExportProgress['phase'],
		frameIndex: number,
		totalFrames: number,
		plan: VideoEncodingPlan
	): void {
		onProgress?.({
			state,
			phase,
			frameIndex,
			frame: frameIndex,
			totalFrames,
			progress: totalFrames > 0 ? frameIndex / totalFrames : 0,
			codec: plan.codec,
			codedWidth: plan.width,
			codedHeight: plan.height,
			frameRate: plan.frameRate,
		});
	}

	private _normalizeError(error: unknown): VideoExportError {
		if (error instanceof VideoExportError) return error;
		return new VideoExportError(
			'VIDEO_EXPORT_FAILED',
			error instanceof Error ? error.message : 'Video export failed.',
			error
		);
	}

	private _log(options: VideoGenerationOptions, ...args: unknown[]): void {
		if (options.debugLogging) console.debug('[textmode-export]', ...args);
	}
}
