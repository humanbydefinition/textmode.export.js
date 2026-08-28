import type { StreamTargetChunk } from 'mediabunny';
import type { Textmodifier } from 'textmode.js';
import {
	FileHandler,
	FilenamePolicy,
	FrameSequenceDriver,
	FrameSequenceError,
	isFrameSequenceAbortError,
	type PostDrawSubscription,
} from '../base';
import { createVideoEncodingPlan } from './VideoEncodingPolicy';
import { VideoRecorder, type VideoOutputDestination } from './VideoRecorder';
import { normalizeVideoExportError, VideoExportError } from './errors';
import type {
	VideoBitrateMode,
	VideoExportFormat,
	VideoExportOptions,
	VideoGenerationOptions,
	VideoHardwareAcceleration,
	VideoQuality,
	VideoQualityLevel,
} from './types';

const DEFAULT_FRAME_RATE = 60;
const DEFAULT_FRAME_COUNT = 300;
const DEFAULT_PIXEL_DENSITY = 1;
const DEFAULT_QUALITY: VideoQualityLevel = 'medium';
const DEFAULT_HARDWARE_ACCELERATION: VideoHardwareAcceleration = 'no-preference';
const DEFAULT_KEYFRAME_INTERVAL = 2;

/** Main video exporter for the textmode.js library. */
export class VideoExporter {
	private readonly _recorder: VideoRecorder;
	private readonly _textmodifier: Textmodifier;
	private readonly _registerPostDrawHook: PostDrawSubscription;

	constructor(textmodifier: Textmodifier, registerPostDrawHook: PostDrawSubscription) {
		this._recorder = new VideoRecorder();
		this._textmodifier = textmodifier;
		this._registerPostDrawHook = registerPostDrawHook;
	}

	/** Captures deterministic frames and saves them as a video file. */
	public async $saveVideo(options: VideoExportOptions = {}): Promise<void> {
		const format = options.format ?? 'mp4';
		const generationOptions = this._applyDefaultOptions(format, options);
		const plan = createVideoEncodingPlan(generationOptions);

		if (options.destination === 'file-system') {
			const destination = await this._createFileSystemDestination(
				new FilenamePolicy().$resolve(options.filename, `.${format}`),
				plan.mimeType
			);
			try {
				await this._record(generationOptions, destination, options.onProgress);
			} catch (error) {
				try {
					await destination.abort?.(error);
				} catch {
					// Preserve the export failure over best-effort destination cleanup.
				}
				throw error;
			}
			return;
		}

		const blob = await this._record(generationOptions, { kind: 'blob' }, options.onProgress);
		if (!blob)
			throw new VideoExportError('VIDEO_EXPORT_FAILED', 'Video export did not produce a downloadable file.');
		new FileHandler().$downloadFile(blob, options.filename, `.${format}`);
	}

	/** Generates a deterministic video without initiating a download. */
	public async $generateVideoBlob(options: VideoExportOptions = {}): Promise<Blob> {
		const format = options.format ?? 'mp4';
		const generationOptions = this._applyDefaultOptions(format, options);
		createVideoEncodingPlan(generationOptions);
		const blob = await this._record(generationOptions, { kind: 'blob' }, options.onProgress);
		if (!blob) throw new VideoExportError('VIDEO_EXPORT_FAILED', 'Video export did not produce an in-memory file.');
		return blob;
	}

	private async _record(
		generationOptions: VideoGenerationOptions,
		destination: VideoOutputDestination,
		onProgress?: VideoExportOptions['onProgress']
	): Promise<Blob | undefined> {
		const frameDriver = new FrameSequenceDriver(this._textmodifier, this._registerPostDrawHook, {
			width: generationOptions.width,
			height: generationOptions.height,
		});
		try {
			return await this._recorder.$record(generationOptions, frameDriver, onProgress, destination);
		} catch (error) {
			onProgress?.({
				state: 'error',
				message:
					error instanceof Error ? error.message : `${generationOptions.format.toUpperCase()} export failed`,
			});
			if (error instanceof FrameSequenceError || isFrameSequenceAbortError(error)) {
				throw normalizeVideoExportError(error);
			}
			throw error;
		}
	}

	private _applyDefaultOptions(format: VideoExportFormat, options: VideoExportOptions): VideoGenerationOptions {
		const frameRate = this._positiveNumber(options.frameRate, DEFAULT_FRAME_RATE);
		const frameCount = this._positiveInteger(options.frameCount, DEFAULT_FRAME_COUNT);
		const pixelDensity = this._positiveNumber(options.pixelDensity, DEFAULT_PIXEL_DENSITY);
		const livePixelDensity = this._currentPixelDensity();
		const width = Math.max(1, Math.round((this._textmodifier.canvas.width / livePixelDensity) * pixelDensity));
		const height = Math.max(1, Math.round((this._textmodifier.canvas.height / livePixelDensity) * pixelDensity));

		return {
			filename: options.filename,
			format,
			frameRate,
			frameCount,
			quality: this._quality(options.quality),
			hardwareAcceleration: this._hardwareAcceleration(options.hardwareAcceleration),
			keyFrameInterval: this._keyFrameInterval(options.keyFrameInterval),
			pixelDensity,
			width,
			height,
			transparent: Boolean(options.transparent),
			debugLogging: Boolean(options.debugLogging),
			signal: options.signal,
			prepareFrame: options.prepareFrame,
		};
	}

	private _positiveInteger(value: number | undefined, fallback: number): number {
		if (!Number.isFinite(value)) return fallback;
		return Math.max(1, Math.round(Math.abs(value as number)));
	}

	private _positiveNumber(value: number | undefined, fallback: number): number {
		if (!Number.isFinite(value)) return fallback;
		return Math.max(Number.EPSILON, Math.abs(value as number));
	}

	private _quality(value: VideoQuality | undefined): VideoQuality {
		if (value === undefined) return DEFAULT_QUALITY;
		if (value === 'very-low' || value === 'low' || value === 'medium' || value === 'high' || value === 'very-high')
			return value;
		if (typeof value !== 'object' || value === null || !Number.isFinite(value.bitrate) || value.bitrate <= 0) {
			throw new TypeError('Video quality must be a Mediabunny quality level or a positive bitrate.');
		}
		if (value.bitrateMode !== undefined && !this._isBitrateMode(value.bitrateMode)) {
			throw new TypeError("Video quality bitrateMode must be 'variable' or 'constant'.");
		}
		return value.bitrateMode
			? { bitrate: value.bitrate, bitrateMode: value.bitrateMode }
			: { bitrate: value.bitrate };
	}

	private _isBitrateMode(value: unknown): value is VideoBitrateMode {
		return value === 'constant' || value === 'variable';
	}

	private _hardwareAcceleration(value: VideoHardwareAcceleration | undefined): VideoHardwareAcceleration {
		return value === 'prefer-hardware' || value === 'prefer-software' || value === 'no-preference'
			? value
			: DEFAULT_HARDWARE_ACCELERATION;
	}

	private _keyFrameInterval(value: number | undefined): number {
		if (!Number.isFinite(value)) return DEFAULT_KEYFRAME_INTERVAL;
		return Math.max(0, Math.abs(value as number));
	}

	private _currentPixelDensity(): number {
		const modifier = this._textmodifier as Textmodifier & { pixelDensity?: () => number };
		const density = modifier.pixelDensity?.();
		return typeof density === 'number' && Number.isFinite(density) && density > 0 ? density : 1;
	}

	private async _createFileSystemDestination(
		filename: string,
		mimeType: string
	): Promise<Extract<VideoOutputDestination, { kind: 'stream' }>> {
		type WritableFile = {
			write(data: StreamTargetChunk): Promise<void>;
			close(): Promise<void>;
			abort(reason?: unknown): Promise<void>;
		};
		type SaveFileHandle = { createWritable(): Promise<WritableFile> };
		const host = globalThis as typeof globalThis & {
			showSaveFilePicker?: (options: {
				suggestedName: string;
				types: Array<{ description: string; accept: Record<string, string[]> }>;
			}) => Promise<SaveFileHandle>;
		};
		if (!host.showSaveFilePicker) {
			throw new VideoExportError(
				'VIDEO_EXPORT_UNSUPPORTED',
				'This browser cannot stream video exports to disk because the File System Access API is unavailable.'
			);
		}
		const handle = await host.showSaveFilePicker({
			suggestedName: filename,
			types: [{ description: 'Video file', accept: { [mimeType]: [filename.slice(filename.lastIndexOf('.'))] } }],
		});
		const file = await handle.createWritable();
		let terminal = false;
		const writable = new WritableStream<StreamTargetChunk>({
			write: (chunk) => file.write(chunk),
			async close() {
				terminal = true;
				await file.close();
			},
			async abort(reason) {
				terminal = true;
				await file.abort(reason);
			},
		});
		return {
			kind: 'stream',
			writable,
			async abort(reason) {
				if (terminal) return;
				terminal = true;
				await file.abort(reason);
			},
		};
	}
}
