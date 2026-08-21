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
import { assertVideoOutputFitsMemory, createVideoEncodingPlan, getVideoQualityDescriptor } from './VideoEncodingPolicy';
import type { VideoEncodingPlan, VideoExportProgress, VideoFrameDriverLike, VideoGenerationOptions } from './types';
import { withAbortableTimeout } from './withAbortableTimeout';

const WEBM_CODEC_PREFERENCES: MediabunnyVideoCodec[] = ['vp9', 'vp8'];
const MP4_CODEC_PREFERENCES: MediabunnyVideoCodec[] = ['avc'];
const VIDEO_OUTPUT_START_TIMEOUT_MS = 30_000;
const VIDEO_OUTPUT_FINALIZE_TIMEOUT_MS = 30_000;

export type VideoOutputDestination =
	{ kind: 'blob'; allowLargeInMemory: boolean } | { kind: 'stream'; writable: WritableStream<StreamTargetChunk> };

/** Records deterministic textmode frames through WebCodecs and muxes them with Mediabunny. */
export class VideoRecorder {
	public async $record(
		options: VideoGenerationOptions,
		frameDriver: VideoFrameDriverLike,
		onProgress?: (progress: VideoExportProgress) => void,
		destination: VideoOutputDestination = { kind: 'blob', allowLargeInMemory: options.allowLargeInMemory ?? false }
	): Promise<Blob | undefined> {
		this._throwIfAborted(options.signal);
		this._assertWebCodecsAvailable();

		const plan = await this._createEncodingPlan(options);
		this._log(options, 'video export plan', plan);
		if (destination.kind === 'blob') assertVideoOutputFitsMemory(plan, destination.allowLargeInMemory);
		this._emitProgress(onProgress, 'recording', 'probing', 0, plan.frameCount, plan);

		const format = plan.format === 'mp4' ? new Mp4OutputFormat() : new WebMOutputFormat();
		const target =
			destination.kind === 'stream'
				? new StreamTarget(destination.writable, { chunked: true })
				: new BufferTarget();
		const output = new Output({ format, target });
		const quality = this._createQuality(plan);
		let selectedRateControl: VideoExportProgress['rateControl'];
		const source = new CanvasSource(frameDriver.canvas, {
			codec: plan.codec as MediabunnyVideoCodec,
			quality,
			alpha: plan.transparent ? 'keep' : 'discard',
			latencyMode: plan.latencyMode,
			hardwareAcceleration: plan.hardwareAcceleration,
			keyFrameInterval: plan.keyFrameInterval,
			sizeChangeBehavior: 'deny',
			contentHint: plan.contentHint,
			onEncoderConfig: (config) => {
				const mode = (config as VideoEncoderConfig & { bitrateMode?: string }).bitrateMode;
				selectedRateControl =
					mode === 'quantizer'
						? 'quantizer'
						: plan.rateControlIntent === 'ultra'
							? 'bitrate-fallback'
							: 'bitrate';
				this._log(options, 'video encoder config', config, { rateControl: selectedRateControl });
			},
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
			this._emitProgress(onProgress, 'recording', 'probing', 0, plan.frameCount, plan, selectedRateControl);

			await frameDriver.$render({
				frameCount: plan.frameCount,
				frameRate: plan.frameRate,
				signal: options.signal,
				prepareFrame: options.prepareFrame,
				onFrame: async ({ frameIndex }) => {
					this._throwIfAborted(options.signal);
					await this._awaitWithAbort(
						source.add(frameIndex / plan.frameRate, 1 / plan.frameRate),
						options.signal
					);
					this._emitProgress(
						onProgress,
						'recording',
						'capturing',
						frameIndex + 1,
						plan.frameCount,
						plan,
						selectedRateControl
					);
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
				plan,
				selectedRateControl
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
				plan,
				selectedRateControl
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
			onProgress?.({ state: 'error', message: exportError.message, estimatedBytes: plan.estimatedBytes });
			throw exportError;
		}
	}

	private async _createEncodingPlan(options: VideoGenerationOptions): Promise<VideoEncodingPlan> {
		const preliminaryPlan = createVideoEncodingPlan(options);
		const format = options.format === 'mp4' ? new Mp4OutputFormat() : new WebMOutputFormat();
		const codecPreferences = options.format === 'mp4' ? MP4_CODEC_PREFERENCES : WEBM_CODEC_PREFERENCES;
		const supportedCodecs = format.getSupportedVideoCodecs().filter((codec) => codecPreferences.includes(codec));
		const quality = this._createQuality(preliminaryPlan);
		let codec: MediabunnyVideoCodec | null = null;
		for (const candidate of supportedCodecs) {
			if (
				await canEncodeVideo(candidate, {
					width: preliminaryPlan.width,
					height: preliminaryPlan.height,
					quality,
					latencyMode: preliminaryPlan.latencyMode,
					hardwareAcceleration: preliminaryPlan.hardwareAcceleration,
					contentHint: preliminaryPlan.contentHint,
				})
			) {
				codec = candidate;
				break;
			}
		}

		if (!codec) {
			const requested = codecPreferences.join(' or ');
			throw new VideoExportError(
				'VIDEO_CODEC_UNSUPPORTED',
				`This browser cannot encode ${requested} at ${preliminaryPlan.width}x${preliminaryPlan.height}. Try a browser/device with native WebCodecs encoding support or reduce the export dimensions.`
			);
		}
		return createVideoEncodingPlan(options, codec);
	}

	private _createQuality(plan: VideoEncodingPlan): Quality {
		const descriptor = getVideoQualityDescriptor(plan);
		if (descriptor.kind === 'named') return new Quality(descriptor.level);
		if (descriptor.kind === 'ultra')
			return new Quality({ bitrate: descriptor.bitrate, bitrateMode: 'variable', quantizer: 0 });
		return new Quality({ bitrate: descriptor.bitrate, bitrateMode: descriptor.bitrateMode });
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
		plan: VideoEncodingPlan,
		rateControl?: VideoExportProgress['rateControl']
	): void {
		onProgress?.({
			state,
			phase,
			frameIndex,
			frame: frameIndex,
			totalFrames,
			progress: totalFrames > 0 ? frameIndex / totalFrames : 0,
			rateControl,
			estimatedBytes: plan.estimatedBytes,
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
