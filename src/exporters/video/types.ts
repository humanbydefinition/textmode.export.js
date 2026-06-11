/**
 * Lifecycle state reported while a video export is being prepared, recorded, encoded, or completed.
 */
export type VideoRecordingState = 'idle' | 'recording' | 'encoding' | 'completed' | 'error';

/**
 * More granular phase information for progress UIs that need to distinguish setup, rendering, and finalization.
 *
 * `rendering` is retained for 1.5.x compatibility. Current deterministic video capture emits `capturing`.
 */
export type VideoExportPhase = 'probing' | 'rendering' | 'capturing' | 'encoding' | 'draining' | 'finalizing';

export type VideoCodec = 'vp8' | 'vp9' | 'avc' | (string & {});

/**
 * Subjective bitrate preset used when an exact bits-per-second value is not supplied.
 *
 * Higher presets produce larger files with more detail. For exact control, pass a numeric
 * `bitrate` value in bits per second instead.
 */
export type VideoBitratePreset = 'low' | 'medium' | 'high';

/**
 * Video container format written by `saveVideo`.
 */
export type VideoExportFormat = 'webm' | 'mp4';

/**
 * Bitrate allocation strategy for the native encoder.
 *
 * - `'variable'`: lets the encoder spend more bits on visually complex frames and fewer bits on simple frames.
 *   This is usually the best default for generative animations.
 * - `'constant'`: asks the encoder to keep the bitrate steadier throughout the export. This can make file size
 *   more predictable, but may waste bits on simple frames or reduce detail on complex frames.
 */
export type VideoBitrateMode = 'variable' | 'constant';

/**
 * Encoder scheduling mode.
 *
 * - `'quality'`: prioritizes complete, stable export output. Mediabunny notes that this mode prevents dropped frames.
 * - `'realtime'`: prioritizes low-latency encoding. It is intended for live streams and may drop frames when overloaded,
 *   so it is usually not recommended for frame-perfect exports.
 */
export type VideoLatencyMode = 'quality' | 'realtime';

/**
 * WebCodecs hardware acceleration preference.
 *
 * This is a browser hint rather than a guarantee:
 * - `'no-preference'`: let the browser choose the best available encoder.
 * - `'prefer-hardware'`: prefer GPU/ASIC encoding when available, often faster and more power-efficient, but codec
 *   availability and output characteristics vary by device.
 * - `'prefer-software'`: prefer CPU encoding, often more consistent across machines, but usually slower.
 */
export type VideoHardwareAcceleration = 'no-preference' | 'prefer-hardware' | 'prefer-software';

export type VideoExportErrorCode =
	| 'VIDEO_EXPORT_UNSUPPORTED'
	| 'VIDEO_CODEC_UNSUPPORTED'
	| 'VIDEO_EXPORT_ABORTED'
	| 'VIDEO_EXPORT_TIMEOUT'
	| 'VIDEO_EXPORT_FAILED'
	| 'VIDEO_TRANSPARENCY_UNSUPPORTED';

/**
 * Progress information emitted during the video export process.
 */
export type VideoExportProgress = {
	/**
	 * Current state of the recording process.
	 */
	state: VideoRecordingState;
	/**
	 * Current export phase for newer progress UIs.
	 */
	phase?: VideoExportPhase;
	/**
	 * Number of frames that have been recorded so far.
	 */
	frameIndex?: number;
	/**
	 * Alias for {@link frameIndex}. Prefer this field in new code.
	 */
	frame?: number;
	/**
	 * Total number of frames planned for the recording.
	 */
	totalFrames?: number;
	/**
	 * Export completion ratio between `0` and `1`.
	 */
	progress?: number;
	/**
	 * Optional status message for UI consumption.
	 */
	message?: string;
};

/**
 * Options for exporting the textmode content to video format.
 */
export type VideoExportOptions = {
	/**
	 * Target filename without extension. Defaults to an auto-generated value.
	 */
	filename?: string;
	/**
	 * Video container format. Defaults to `'mp4'`.
	 */
	format?: VideoExportFormat;
	/**
	 * Desired total number of frames to capture. Defaults to `300`.
	 */
	frameCount?: number;
	/**
	 * Target frame rate for the export, in frames per second. Defaults to `60`.
	 */
	frameRate?: number;
	/**
	 * Target bitrate in bits per second or a bitrate preset. Defaults to `'medium'`.
	 *
	 * Bitrate controls how much encoded data is available per second of video. Higher values can preserve more detail
	 * in noisy or fast-changing sketches, but create larger files. Presets are resolved from the export dimensions and
	 * frame rate; numeric values are passed directly to the encoder.
	 */
	bitrate?: number | VideoBitratePreset;
	/**
	 * Encoder bitrate allocation mode. Defaults to `'variable'`.
	 *
	 * Use `'variable'` for most exports so simple frames can compress efficiently and complex frames can receive more
	 * bits. Use `'constant'` only when a steadier data rate is more important than compression efficiency.
	 */
	bitrateMode?: VideoBitrateMode;
	/**
	 * Encoder latency mode. Defaults to `'quality'`.
	 *
	 * Use `'quality'` for deterministic exports; it prioritizes completed output and avoids dropped frames. Use
	 * `'realtime'` only for low-latency use cases where dropped frames are acceptable.
	 */
	latencyMode?: VideoLatencyMode;
	/**
	 * WebCodecs hardware acceleration hint. Defaults to `'no-preference'`.
	 *
	 * Browsers may ignore this hint. `'prefer-hardware'` can be faster on supported devices; `'prefer-software'` can be
	 * more predictable but slower. `'no-preference'` lets the browser choose.
	 */
	hardwareAcceleration?: VideoHardwareAcceleration;
	/**
	 * Key frame interval in seconds. Defaults to `2`.
	 *
	 * Key frames are independently decodable frames used for seeking and recovery. Shorter intervals improve seeking
	 * responsiveness but increase file size. Longer intervals can shrink files but make seeking less precise.
	 * Use `0` to request every frame as a key frame.
	 */
	keyFrameInterval?: number;
	/**
	 * Pixel density used during export. Defaults to `1` so video dimensions match the live canvas.
	 */
	pixelDensity?: number;
	/**
	 * Abort signal for cancelling an in-progress export.
	 */
	signal?: AbortSignal;
	/**
	 * When true, attempts to preserve alpha data in WebM recordings. MP4 exports reject this option.
	 */
	transparent?: boolean;
	/**
	 * Progress callback invoked throughout the recording lifecycle.
	 */
	onProgress?: (progress: VideoExportProgress) => void;
	/**
	 * Enables verbose logging. Defaults to `false`.
	 */
	debugLogging?: boolean;
};

export interface VideoGenerationOptions {
	filename?: string;
	format: VideoExportFormat;
	frameRate: number;
	frameCount: number;
	bitrate: number | VideoBitratePreset;
	bitrateMode: VideoBitrateMode;
	latencyMode: VideoLatencyMode;
	hardwareAcceleration: VideoHardwareAcceleration;
	keyFrameInterval: number;
	pixelDensity: number;
	width: number;
	height: number;
	transparent: boolean;
	debugLogging: boolean;
	signal?: AbortSignal;
}

export interface VideoEncodingPlan {
	format: VideoExportFormat;
	extension: '.webm' | '.mp4';
	mimeType: string;
	codec: VideoCodec;
	bitrate: number;
	bitrateMode: VideoBitrateMode;
	latencyMode: VideoLatencyMode;
	hardwareAcceleration: VideoHardwareAcceleration;
	keyFrameInterval: number;
	frameRate: number;
	frameCount: number;
	width: number;
	height: number;
	transparent: boolean;
}

export interface VideoRenderFrameOptions {
	frameCount: number;
	frameRate: number;
	signal?: AbortSignal;
	onFrame(frame: { frameIndex: number; canvas: HTMLCanvasElement }): Promise<void> | void;
}

export interface VideoFrameDriverLike {
	readonly canvas: HTMLCanvasElement;
	$render(options: VideoRenderFrameOptions): Promise<void>;
}
