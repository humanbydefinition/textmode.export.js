import type { Textmodifier } from 'textmode.js';
import type { TextmodePluginContext } from 'textmode.js';
import { FileHandler } from '../base';
import { VideoFrameDriver } from './VideoFrameDriver';
import { VideoRecorder } from './VideoRecorder';
import type {
	VideoBitrateMode,
	VideoBitratePreset,
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
const DEFAULT_LATENCY_MODE: VideoLatencyMode = 'quality';
const DEFAULT_HARDWARE_ACCELERATION: VideoHardwareAcceleration = 'no-preference';
const DEFAULT_KEYFRAME_INTERVAL = 2;

/**
 * Main video exporter for the textmode.js library.
 */
export class VideoExporter {
	private readonly _recorder: VideoRecorder;
	private readonly _textmodifier: Textmodifier;
	private readonly _registerPostDrawHook: TextmodePluginContext['registerPostDrawHook'];

	constructor(textmodifier: Textmodifier, registerPostDrawHook: TextmodePluginContext['registerPostDrawHook']) {
		this._recorder = new VideoRecorder();
		this._textmodifier = textmodifier;
		this._registerPostDrawHook = registerPostDrawHook;
	}

	/**
	 * Captures deterministic frames and saves them as a video file.
	 *
	 * @param options Export options
	 */
	public async $saveVideo(options: VideoExportOptions = {}): Promise<void> {
		await this._saveVideo(options.format ?? 'mp4', options);
	}

	private async _saveVideo(format: VideoExportFormat, options: VideoExportOptions): Promise<void> {
		const generationOptions = this._applyDefaultOptions(format, options);
		const frameDriver = new VideoFrameDriver(
			this._textmodifier,
			this._registerPostDrawHook,
			generationOptions.width,
			generationOptions.height
		);

		try {
			const blob = await this._recorder.$record(generationOptions, frameDriver, options.onProgress);
			new FileHandler().$downloadFile(blob, this._withExtension(generationOptions.filename, `.${format}`));
		} catch (error) {
			options.onProgress?.({
				state: 'error',
				message: error instanceof Error ? error.message : `${format.toUpperCase()} export failed`,
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
			latencyMode: this._latencyMode(options.latencyMode),
			hardwareAcceleration: this._hardwareAcceleration(options.hardwareAcceleration),
			keyFrameInterval: this._keyFrameInterval(options.keyFrameInterval),
			pixelDensity,
			width,
			height,
			transparent: Boolean(options.transparent),
			debugLogging: Boolean(options.debugLogging),
			signal: options.signal,
		};
	}

	private _positiveInteger(value: number | undefined, fallback: number): number {
		if (!Number.isFinite(value)) {
			return fallback;
		}
		return Math.max(1, Math.round(Math.abs(value as number)));
	}

	private _positiveNumber(value: number | undefined, fallback: number): number {
		if (!Number.isFinite(value)) {
			return fallback;
		}
		return Math.max(Number.EPSILON, Math.abs(value as number));
	}

	private _bitrate(value: number | VideoBitratePreset | undefined): number | VideoBitratePreset {
		if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
			return value;
		}
		if (value === 'low' || value === 'medium' || value === 'high') {
			return value;
		}
		return DEFAULT_BITRATE;
	}

	private _bitrateMode(value: VideoBitrateMode | undefined): VideoBitrateMode {
		return value === 'constant' || value === 'variable' ? value : DEFAULT_BITRATE_MODE;
	}

	private _latencyMode(value: VideoLatencyMode | undefined): VideoLatencyMode {
		return value === 'quality' || value === 'realtime' ? value : DEFAULT_LATENCY_MODE;
	}

	private _hardwareAcceleration(value: VideoHardwareAcceleration | undefined): VideoHardwareAcceleration {
		if (value === 'prefer-hardware' || value === 'prefer-software' || value === 'no-preference') {
			return value;
		}
		return DEFAULT_HARDWARE_ACCELERATION;
	}

	private _keyFrameInterval(value: number | undefined): number {
		if (!Number.isFinite(value)) {
			return DEFAULT_KEYFRAME_INTERVAL;
		}
		return Math.max(0, Math.abs(value as number));
	}

	private _currentPixelDensity(): number {
		const modifier = this._textmodifier as Textmodifier & { pixelDensity?: () => number };
		const density = modifier.pixelDensity?.();
		return typeof density === 'number' && Number.isFinite(density) && density > 0 ? density : 1;
	}

	private _withExtension(filename: string | undefined, extension: `.${VideoExportFormat}`): string | undefined {
		if (!filename) {
			return undefined;
		}
		const trimmed = filename.trim();
		if (!trimmed) {
			return undefined;
		}
		return trimmed.toLowerCase().endsWith(extension) ? trimmed : `${trimmed}${extension}`;
	}
}
