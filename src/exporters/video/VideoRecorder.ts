import {
	BufferTarget,
	CanvasSource,
	Mp4OutputFormat,
	Output,
	WebMOutputFormat,
	getFirstEncodableVideoCodec,
} from 'mediabunny';
import { VideoExportError, createAbortError } from './errors';
import type {
	VideoBitratePreset,
	VideoCodec,
	VideoEncodingPlan,
	VideoExportProgress,
	VideoFrameDriverLike,
	VideoGenerationOptions,
} from './types';
import { withAbortableTimeout } from './withAbortableTimeout';

const WEBM_CODEC_PREFERENCES: VideoCodec[] = ['vp9', 'vp8'];
const MP4_CODEC_PREFERENCES: VideoCodec[] = ['avc'];
const MAX_PENDING_VIDEO_ENCODE_FRAMES = 4;
const VIDEO_CAPTURE_YIELD_FRAME_INTERVAL = 4;
const VIDEO_ENCODE_DRAIN_TIMEOUT_MS = 30_000;
const VIDEO_OUTPUT_START_TIMEOUT_MS = 30_000;
const VIDEO_OUTPUT_FINALIZE_TIMEOUT_MS = 30_000;

type PendingVideoEncode = Promise<void>;
type CancellableOutput = Output & {
	cancel(): Promise<void>;
};

class VideoEncodeQueue {
	private readonly _pending: PendingVideoEncode[] = [];

	constructor(
		private readonly _source: CanvasSource,
		private readonly _plan: VideoEncodingPlan,
		private readonly _timeoutMs: number
	) {}

	public get pendingCount(): number {
		return this._pending.length;
	}

	public enqueue(frameIndex: number): void {
		let promise: Promise<void>;
		try {
			promise = Promise.resolve(this._source.add(frameIndex / this._plan.frameRate, 1 / this._plan.frameRate));
		} catch (error) {
			promise = Promise.reject(error);
		}
		promise.catch(() => undefined);
		this._pending.push(promise);
	}

	public async drainOne(signal?: AbortSignal): Promise<void> {
		if (this._pending.length === 0) return;
		const settled = await withAbortableTimeout(
			Promise.race(
				this._pending.map((promise, index) =>
					promise.then(
						() => ({ index, error: null as unknown | null }),
						(error: unknown) => ({ index, error })
					)
				)
			),
			`Video encoder did not drain within ${this._timeoutMs}ms.`,
			signal,
			this._timeoutMs
		);
		this._pending.splice(settled.index, 1);
		if (settled.error) {
			throw settled.error;
		}
	}

	public async drainAll(signal: AbortSignal | undefined, onDrain: () => void): Promise<void> {
		while (this._pending.length > 0) {
			await this.drainOne(signal);
			onDrain();
		}
	}
}

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
		const cancellableOutput = output as CancellableOutput;
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
		const encodeQueue = new VideoEncodeQueue(source, plan, VIDEO_ENCODE_DRAIN_TIMEOUT_MS);

		output.addVideoTrack(source);

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
				onFrame: async ({ frameIndex }) => {
					this._throwIfAborted(options.signal);
					encodeQueue.enqueue(frameIndex);
					this._emitProgress(onProgress, 'recording', 'capturing', frameIndex + 1, plan.frameCount);
					await this._drainIfNeeded(encodeQueue, onProgress, plan, frameIndex + 1, options.signal);
					if (this._shouldYieldAfterCaptureFrame(frameIndex, plan.frameCount)) {
						await this._yieldToBrowser(options.signal);
					}
				},
			});

			this._throwIfAborted(options.signal);
			await this._drainEncodes(encodeQueue, onProgress, plan, options.signal);
			this._emitProgress(onProgress, 'encoding', 'finalizing', plan.frameCount, plan.frameCount);
			await withAbortableTimeout(
				output.finalize(),
				`Video output did not finalize within ${VIDEO_OUTPUT_FINALIZE_TIMEOUT_MS}ms.`,
				options.signal,
				VIDEO_OUTPUT_FINALIZE_TIMEOUT_MS
			);

			this._emitProgress(onProgress, 'completed', 'finalizing', plan.frameCount, plan.frameCount);
			if (!target.buffer) {
				throw new VideoExportError('VIDEO_EXPORT_FAILED', 'Video encoder finalized without producing data.');
			}
			return new Blob([target.buffer], { type: plan.mimeType });
		} catch (error) {
			try {
				await cancellableOutput.cancel();
			} catch {
				// Best-effort cleanup only; the original export error is more useful.
			}
			const exportError = this._normalizeError(error);
			onProgress?.({ state: 'error', message: exportError.message });
			throw exportError;
		}
	}

	private async _drainIfNeeded(
		encodeQueue: VideoEncodeQueue,
		onProgress: ((progress: VideoExportProgress) => void) | undefined,
		plan: VideoEncodingPlan,
		capturedFrameCount: number,
		signal?: AbortSignal
	): Promise<void> {
		if (encodeQueue.pendingCount < MAX_PENDING_VIDEO_ENCODE_FRAMES) {
			return;
		}
		await encodeQueue.drainOne(signal);
		this._emitProgress(onProgress, 'recording', 'draining', capturedFrameCount, plan.frameCount);
	}

	private async _drainEncodes(
		encodeQueue: VideoEncodeQueue,
		onProgress: ((progress: VideoExportProgress) => void) | undefined,
		plan: VideoEncodingPlan,
		signal?: AbortSignal
	): Promise<void> {
		await encodeQueue.drainAll(signal, () => {
			this._throwIfAborted(signal);
			this._emitProgress(onProgress, 'encoding', 'draining', plan.frameCount, plan.frameCount);
		});
	}

	private _shouldYieldAfterCaptureFrame(frameIndex: number, frameCount: number): boolean {
		const capturedFrameCount = frameIndex + 1;
		return capturedFrameCount < frameCount && capturedFrameCount % VIDEO_CAPTURE_YIELD_FRAME_INTERVAL === 0;
	}

	private _yieldToBrowser(signal?: AbortSignal): Promise<void> {
		return new Promise((resolve, reject) => {
			if (signal?.aborted) {
				reject(createAbortError());
				return;
			}

			let rafId: number | null = null;
			let timeoutId: ReturnType<typeof setTimeout> | null = null;
			let settled = false;

			const cleanup = () => {
				if (rafId !== null && typeof globalThis.cancelAnimationFrame === 'function') {
					globalThis.cancelAnimationFrame(rafId);
				}
				if (timeoutId !== null) {
					clearTimeout(timeoutId);
				}
				signal?.removeEventListener('abort', abort);
			};
			const settle = (callback: () => void) => {
				if (settled) return;
				settled = true;
				cleanup();
				callback();
			};
			const abort = () => settle(() => reject(createAbortError()));
			const finish = () => settle(resolve);

			signal?.addEventListener('abort', abort, { once: true });

			if (typeof globalThis.requestAnimationFrame === 'function') {
				rafId = globalThis.requestAnimationFrame(() => {
					rafId = null;
					timeoutId = setTimeout(finish, 0);
				});
				return;
			}

			timeoutId = setTimeout(finish, 0);
		});
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
