import type { PrepareExportFrame } from '../base';

/**
 * High-level lifecycle state reported while a video export is captured, encoded, or completed.
 *
 * @category Video export
 *
 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/VideoRecordingState | VideoRecordingState API reference}
 */
export type VideoRecordingState = 'idle' | 'recording' | 'encoding' | 'completed' | 'error';

/**
 * Detailed phase information for progress UIs that distinguish capability probing, frame capture, and output.
 *
 * Current exports emit `probing`, `capturing`, and either `writing` for streamed file-system output or `finalizing`
 * for buffered output. `rendering`, `encoding`, and `draining` remain available for compatibility with older progress
 * producers.
 *
 * @category Video export
 *
 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/VideoExportPhase | VideoExportPhase API reference}
 */
export type VideoExportPhase =
	'probing' | 'rendering' | 'capturing' | 'encoding' | 'draining' | 'writing' | 'finalizing';

export type VideoCodec = 'vp8' | 'vp9' | 'avc' | (string & {});

/**
 * Qualitative video quality level matching Mediabunny's five native levels.
 *
 * Higher levels generally preserve more detail and produce larger, content-dependent files. Mediabunny may use
 * quantizer-based encoding or a codec-adjusted bitrate, depending on codec and browser support.
 *
 * @category Video export
 *
 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/VideoQualityLevel | VideoQualityLevel API reference}
 */
export type VideoQualityLevel = 'very-low' | 'low' | 'medium' | 'high' | 'very-high';

/**
 * Video compression policy passed to Mediabunny.
 *
 * Use a named {@link VideoQualityLevel} for content-dependent qualitative encoding. Use the object form to request a
 * positive target bitrate in bits per second and, optionally, constant or variable allocation. When `bitrateMode` is
 * omitted, Mediabunny defaults bitrate-based encoding to `'variable'`. A target bitrate guides the encoder but does
 * not guarantee an exact final file size.
 *
 * @example Named qualitative quality
 * ```ts
 * await t.saveVideo({ quality: 'very-high' });
 * ```
 *
 * @example Target bitrate with constant allocation
 * ```ts
 * await t.saveVideo({ quality: { bitrate: 8_000_000, bitrateMode: 'constant' } });
 * ```
 *
 * @category Video export
 *
 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/VideoQuality | VideoQuality API reference}
 */
export type VideoQuality = VideoQualityLevel | { bitrate: number; bitrateMode?: VideoBitrateMode };

/**
 * Destination policy used by `saveVideo()`.
 *
 * - `'download'` is the default. The complete video is buffered in memory before a browser download begins.
 * - `'file-system'` opens the browser's save picker and streams encoded chunks directly to the selected file. It
 *   requires the File System Access API and rejects with `VIDEO_EXPORT_UNSUPPORTED` when that API is unavailable.
 *
 * This setting does not affect `toVideoBlob()`, which always returns an in-memory `Blob`.
 *
 * @category Video export
 *
 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/VideoSaveDestination | VideoSaveDestination API reference}
 */
export type VideoSaveDestination = 'download' | 'file-system';

/**
 * Video container format produced by `saveVideo()` and `toVideoBlob()`.
 *
 * MP4 uses AVC/H.264 and requires even coded dimensions. WebM selects VP9 when available and falls back to VP8; it
 * is the only format that can be requested with transparency.
 *
 * @category Video export
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
 * If omitted for an explicit target bitrate, Mediabunny uses `'variable'`.
 *
 * @category Video export
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
 * @category Video export
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
 * Progress information emitted while a deterministic video is probed, captured, and written.
 *
 * @category Video export
 *
 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/VideoExportProgress | VideoExportProgress API reference}
 */
export type VideoExportProgress = {
	/**
	 * Current high-level export state.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/VideoExportProgress#state | VideoExportProgress.state API reference}
	 */
	state: VideoRecordingState;
	/**
	 * Current detailed phase. See {@link VideoExportPhase} for current and compatibility-only values.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/VideoExportProgress#phase | VideoExportProgress.phase API reference}
	 */
	phase?: VideoExportPhase;
	/**
	 * Number of frames captured so far.
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
	 * Normalized frame-capture completion ratio between `0` and `1`.
	 *
	 * Final writing or muxing may still be in progress when this value reaches `1`.
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
	 * Effective codec family selected after capability probing (`avc`, `vp9`, or `vp8`).
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/VideoExportProgress#codec | VideoExportProgress.codec API reference}
	 */
	codec?: VideoCodec;
	/**
	 * Effective coded width in pixels.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/VideoExportProgress#codedwidth | VideoExportProgress.codedWidth API reference}
	 */
	codedWidth?: number;
	/**
	 * Effective coded height in pixels.
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
 * Options for capturing deterministic textmode frames as MP4 or WebM video.
 *
 * @category Video export
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
	 * Named levels map one-to-one to Mediabunny's qualitative levels and produce content-dependent file sizes. Use the
	 * object form to request a positive target bitrate in bits per second and an optional bitrate mode.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/VideoExportOptions#quality | VideoExportOptions.quality API reference}
	 */
	quality?: VideoQuality;
	/**
	 * Save destination used by `saveVideo()`. Defaults to `'download'`.
	 *
	 * `'file-system'` opens a save picker and streams directly to the selected file when the File System Access API is
	 * available. `toVideoBlob()` always returns an in-memory blob and does not use this setting.
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
	 * When `true`, attempts to preserve alpha data in WebM recordings. MP4 exports reject this option.
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
