import type { PrepareExportFrame } from '../base';

/**
 * Lifecycle state reported while a video export is being prepared, recorded, encoded, or completed.
 *
 * @category Animation export
 *
 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/VideoRecordingState | VideoRecordingState API reference}
 */
export type VideoRecordingState = 'idle' | 'recording' | 'encoding' | 'completed' | 'error';

/**
 * More granular phase information for progress UIs that need to distinguish setup, rendering, and finalization.
 *
 * `rendering` is retained for 1.5.x compatibility. Current deterministic video capture emits `capturing`.
 *
 * @category Animation export
 *
 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/VideoExportPhase | VideoExportPhase API reference}
 */
export type VideoExportPhase =
	'probing' | 'rendering' | 'capturing' | 'encoding' | 'draining' | 'writing' | 'finalizing';

export type VideoCodec = 'vp8' | 'vp9' | 'avc' | (string & {});

/**
 * Subjective video quality level passed directly to Mediabunny.
 *
 * @category Animation export
 *
 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/VideoQualityLevel | VideoQualityLevel API reference}
 */
export type VideoQualityLevel = 'very-low' | 'low' | 'medium' | 'high' | 'very-high';

/**
 * Video compression policy. Named levels map one-to-one to Mediabunny's
 * subjective quality levels. The object form requests an exact bitrate.
 *
 * @category Animation export
 *
 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/VideoQuality | VideoQuality API reference}
 */
export type VideoQuality = VideoQualityLevel | { bitrate: number; bitrateMode?: VideoBitrateMode };

/**
 * Destination policy used by `saveVideo`.
 *
 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/VideoSaveDestination | VideoSaveDestination API reference}
 */
export type VideoSaveDestination = 'download' | 'file-system';

/**
 * Video container format written by `saveVideo`.
 *
 * @category Animation export
 *
 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/VideoExportFormat | VideoExportFormat API reference}
 */
export type VideoExportFormat = 'webm' | 'mp4';

/**
 * Bitrate allocation strategy for the native encoder.
 *
 * - `'variable'`: lets the encoder spend more bits on visually complex frames and fewer bits on simple frames.
 *   This is usually the best default for generative animations.
 * - `'constant'`: asks the encoder to keep the bitrate steadier throughout the export. This can make file size
 *   more predictable, but may waste bits on simple frames or reduce detail on complex frames.
 *
 * @category Animation export
 *
 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/VideoBitrateMode | VideoBitrateMode API reference}
 */
export type VideoBitrateMode = 'variable' | 'constant';

/**
 * WebCodecs hardware acceleration preference.
 *
 * This is a browser hint rather than a guarantee:
 * - `'no-preference'`: let the browser choose the best available encoder.
 * - `'prefer-hardware'`: prefer GPU/ASIC encoding when available, often faster and more power-efficient, but codec
 *   availability and output characteristics vary by device.
 * - `'prefer-software'`: prefer CPU encoding, often more consistent across machines, but usually slower.
 *
 * @category Animation export
 *
 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/VideoHardwareAcceleration | VideoHardwareAcceleration API reference}
 */
export type VideoHardwareAcceleration = 'no-preference' | 'prefer-hardware' | 'prefer-software';

export type VideoExportErrorCode =
	| 'VIDEO_EXPORT_UNSUPPORTED'
	| 'VIDEO_CODEC_UNSUPPORTED'
	| 'VIDEO_EXPORT_ABORTED'
	| 'VIDEO_EXPORT_TIMEOUT'
	| 'VIDEO_EXPORT_FAILED'
	| 'VIDEO_TRANSPARENCY_UNSUPPORTED'
	| 'VIDEO_DIMENSIONS_UNSUPPORTED';

/**
 * Progress information emitted during the video export process.
 *
 * @category Animation export
 *
 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/VideoExportProgress | VideoExportProgress API reference}
 */
export type VideoExportProgress = {
	/**
	 * Current state of the recording process.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/VideoExportProgress#state | VideoExportProgress.state API reference}
	 */
	state: VideoRecordingState;
	/**
	 * Current export phase for newer progress UIs.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/VideoExportProgress#phase | VideoExportProgress.phase API reference}
	 */
	phase?: VideoExportPhase;
	/**
	 * Number of frames that have been recorded so far.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/VideoExportProgress#frameindex | VideoExportProgress.frameIndex API reference}
	 */
	frameIndex?: number;
	/**
	 * Alias for {@link frameIndex}. Prefer this field in new code.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/VideoExportProgress#frame | VideoExportProgress.frame API reference}
	 */
	frame?: number;
	/**
	 * Total number of frames planned for the recording.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/VideoExportProgress#totalframes | VideoExportProgress.totalFrames API reference}
	 */
	totalFrames?: number;
	/**
	 * Export completion ratio between `0` and `1`.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/VideoExportProgress#progress | VideoExportProgress.progress API reference}
	 */
	progress?: number;
	/**
	 * Optional status message for UI consumption.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/VideoExportProgress#message | VideoExportProgress.message API reference}
	 */
	message?: string;
	/**
	 * Effective codec family selected after probing.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/VideoExportProgress#codec | VideoExportProgress.codec API reference}
	 */
	codec?: VideoCodec;
	/**
	 * Effective coded width.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/VideoExportProgress#codedwidth | VideoExportProgress.codedWidth API reference}
	 */
	codedWidth?: number;
	/**
	 * Effective coded height.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/VideoExportProgress#codedheight | VideoExportProgress.codedHeight API reference}
	 */
	codedHeight?: number;
	/**
	 * Exact output frame rate passed to the muxer.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/VideoExportProgress#framerate | VideoExportProgress.frameRate API reference}
	 */
	frameRate?: number;
};

/**
 * Options for exporting the textmode content to video format.
 *
 * @category Animation export
 *
 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/VideoExportOptions | VideoExportOptions API reference}
 */
export type VideoExportOptions = {
	/**
	 * Target filename without extension. Defaults to an auto-generated value.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/VideoExportOptions#filename | VideoExportOptions.filename API reference}
	 */
	filename?: string;
	/**
	 * Video container format. Defaults to `'mp4'`.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/VideoExportOptions#format | VideoExportOptions.format API reference}
	 */
	format?: VideoExportFormat;
	/**
	 * Desired total number of frames to capture. Defaults to `300`.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/VideoExportOptions#framecount | VideoExportOptions.frameCount API reference}
	 */
	frameCount?: number;
	/**
	 * Target frame rate for the export, in frames per second. Defaults to `60`.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/VideoExportOptions#framerate | VideoExportOptions.frameRate API reference}
	 */
	frameRate?: number;
	/**
	 * Video quality policy. Defaults to `'medium'`.
	 *
	 * Named levels are passed directly to Mediabunny and produce content-dependent file sizes. Use the object form to
	 * request an exact bitrate and optional bitrate mode.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/VideoExportOptions#quality | VideoExportOptions.quality API reference}
	 */
	quality?: VideoQuality;
	/**
	 * Save destination. File-system output streams directly to a user-selected file.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/VideoExportOptions#destination | VideoExportOptions.destination API reference}
	 */
	destination?: VideoSaveDestination;
	/**
	 * WebCodecs hardware acceleration hint. Defaults to `'no-preference'`.
	 *
	 * Browsers may ignore this hint. `'prefer-hardware'` can be faster on supported devices; `'prefer-software'` can be
	 * more predictable but slower. `'no-preference'` lets the browser choose.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/VideoExportOptions#hardwareacceleration | VideoExportOptions.hardwareAcceleration API reference}
	 */
	hardwareAcceleration?: VideoHardwareAcceleration;
	/**
	 * Key frame interval in seconds. Defaults to `2`.
	 *
	 * Key frames are independently decodable frames used for seeking and recovery. Shorter intervals improve seeking
	 * responsiveness but increase file size. Longer intervals can shrink files but make seeking less precise.
	 * Use `0` to request every frame as a key frame.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/VideoExportOptions#keyframeinterval | VideoExportOptions.keyFrameInterval API reference}
	 */
	keyFrameInterval?: number;
	/**
	 * Pixel density used during export. Defaults to `1` so video dimensions match the logical canvas size.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/VideoExportOptions#pixeldensity | VideoExportOptions.pixelDensity API reference}
	 */
	pixelDensity?: number;
	/**
	 * Abort signal for cancelling an in-progress export.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/VideoExportOptions#signal | VideoExportOptions.signal API reference}
	 */
	signal?: AbortSignal;
	/**
	 * Prepares external media before each deterministic frame is redrawn.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/VideoExportOptions#prepareframe | VideoExportOptions.prepareFrame API reference}
	 */
	prepareFrame?: PrepareExportFrame;
	/**
	 * When true, attempts to preserve alpha data in WebM recordings. MP4 exports reject this option.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/VideoExportOptions#transparent | VideoExportOptions.transparent API reference}
	 */
	transparent?: boolean;
	/**
	 * Progress callback invoked throughout the recording lifecycle.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/VideoExportOptions#onprogress | VideoExportOptions.onProgress API reference}
	 */
	onProgress?: (progress: VideoExportProgress) => void;
	/**
	 * Enables verbose logging. Defaults to `false`.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/VideoExportOptions#debuglogging | VideoExportOptions.debugLogging API reference}
	 */
	debugLogging?: boolean;
};

export interface VideoGenerationOptions {
	filename?: string;
	format: VideoExportFormat;
	frameRate: number;
	frameCount: number;
	quality: VideoQuality;
	hardwareAcceleration: VideoHardwareAcceleration;
	keyFrameInterval: number;
	pixelDensity: number;
	width: number;
	height: number;
	transparent: boolean;
	debugLogging: boolean;
	signal?: AbortSignal;
	prepareFrame?: PrepareExportFrame;
}

export interface VideoEncodingPlan {
	format: VideoExportFormat;
	extension: '.webm' | '.mp4';
	mimeType: string;
	codec: VideoCodec;
	quality: VideoQuality;
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
	prepareFrame?: PrepareExportFrame;
	onFrame(frame: { frameIndex: number; canvas: HTMLCanvasElement }): Promise<void> | void;
}

export interface VideoFrameDriverLike {
	readonly canvas: HTMLCanvasElement;
	$render(options: VideoRenderFrameOptions): Promise<void>;
}
