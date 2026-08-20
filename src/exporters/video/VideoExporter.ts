import type { Textmodifier } from 'textmode.js';
import { FileHandler } from '../base';
import { VideoFrameDriver, type PostDrawSubscription } from './VideoFrameDriver';
import { VideoRecorder, type VideoOutputDestination } from './VideoRecorder';
import { VideoExportError } from './errors';
import { assertVideoOutputFitsMemory, createVideoEncodingPlan } from './VideoEncodingPolicy';
import type {
	VideoBitrateMode,
	VideoBitratePreset,
	VideoContentHint,
	VideoExportFormat,
	VideoExportOptions,
	VideoGenerationOptions,
	VideoHardwareAcceleration,
	VideoLatencyMode,
} from './types';

const DEFAULT_FRAME_RATE = 60;
const DEFAULT_FRAME_COUNT = 300;
const DEFAULT_PIXEL_DENSITY = 1;
const DEFAULT_BITRATE: VideoBitratePreset = 'medium';
const DEFAULT_BITRATE_MODE: VideoBitrateMode = 'variable';
const DEFAULT_CONTENT_HINT: VideoContentHint = 'text';
const DEFAULT_LATENCY_MODE: VideoLatencyMode = 'quality';
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
		const preflightPlan = createVideoEncodingPlan(generationOptions);
		assertVideoOutputFitsMemory(preflightPlan, false);
		const blob = await this._record(
			generationOptions,
			{ kind: 'blob', allowLargeInMemory: false },
			options.onProgress
		);
		if (!blob)
			throw new VideoExportError('VIDEO_EXPORT_FAILED', 'Video export did not produce a downloadable file.');
		new FileHandler().$downloadFile(blob, this._withExtension(options.filename, `.${format}`));
	}

	/** Generates a deterministic video without initiating a download. */
	public async $generateVideoBlob(options: VideoExportOptions = {}): Promise<Blob> {
		const format = options.format ?? 'mp4';
		const generationOptions = this._applyDefaultOptions(format, options);
		createVideoEncodingPlan(generationOptions);
		const blob = await this._record(
			generationOptions,
			{ kind: 'blob', allowLargeInMemory: Boolean(options.allowLargeInMemory) },
			options.onProgress
		);
		if (!blob) throw new VideoExportError('VIDEO_EXPORT_FAILED', 'Video export did not produce an in-memory file.');
		return blob;
	}

	private async _record(
		generationOptions: VideoGenerationOptions,
		destination: VideoOutputDestination,
		onProgress?: VideoExportOptions['onProgress']
	): Promise<Blob | undefined> {
		const frameDriver = new VideoFrameDriver(
			this._textmodifier,
			this._registerPostDrawHook,
			generationOptions.width,
			generationOptions.height
		);
		try {
			return await this._recorder.$record(generationOptions, frameDriver, onProgress, destination);
		} catch (error) {
			onProgress?.({
				state: 'error',
				message:
					error instanceof Error ? error.message : `${generationOptions.format.toUpperCase()} export failed`,
			});
			throw error;
		}
	}

	private _applyDefaultOptions(format: VideoExportFormat, options: VideoExportOptions): VideoGenerationOptions {
		const frameRate = this._positiveInteger(options.frameRate, DEFAULT_FRAME_RATE);
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
			bitrate: this._bitrate(options.bitrate),
			bitrateMode: this._bitrateMode(options.bitrateMode),
			contentHint: this._contentHint(options.contentHint),
			latencyMode: this._latencyMode(options.latencyMode),
			hardwareAcceleration: this._hardwareAcceleration(options.hardwareAcceleration),
			keyFrameInterval: this._keyFrameInterval(options.keyFrameInterval),
			pixelDensity,
			width,
			height,
			transparent: Boolean(options.transparent),
			debugLogging: Boolean(options.debugLogging),
			allowLargeInMemory: Boolean(options.allowLargeInMemory),
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

	private _bitrate(value: number | VideoBitratePreset | undefined): number | VideoBitratePreset {
		if (typeof value === 'number' && Number.isFinite(value) && value > 0) return value;
		if (value === 'low' || value === 'medium' || value === 'high' || value === 'ultra') return value;
		return DEFAULT_BITRATE;
	}

	private _bitrateMode(value: VideoBitrateMode | undefined): VideoBitrateMode {
		return value === 'constant' || value === 'variable' ? value : DEFAULT_BITRATE_MODE;
	}

	private _contentHint(value: VideoContentHint | undefined): VideoContentHint {
		return value === '' || value === 'motion' || value === 'detail' || value === 'text'
			? value
			: DEFAULT_CONTENT_HINT;
	}

	private _latencyMode(value: VideoLatencyMode | undefined): VideoLatencyMode {
		return value === 'quality' || value === 'realtime' ? value : DEFAULT_LATENCY_MODE;
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

	private _withExtension(filename: string | undefined, extension: `.${VideoExportFormat}`): string | undefined {
		if (!filename) return undefined;
		const trimmed = filename.trim();
		if (!trimmed) return undefined;
		return trimmed.toLowerCase().endsWith(extension) ? trimmed : `${trimmed}${extension}`;
	}
}
