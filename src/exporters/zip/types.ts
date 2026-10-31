import type { PrepareExportFrame } from '../base';
import type { ImageExportOptions } from '../image';
import type { SVGExportOptions } from '../svg';
import type { TXTExportOptions } from '../txt';

/**
 * File format used for every frame in a ZIP frame-sequence export.
 *
 * @category ZIP frame-sequence export
 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/ZIPFrameFormat | ZIPFrameFormat API reference}
 */
export type ZIPFrameFormat = 'png' | 'jpg' | 'webp' | 'svg' | 'txt';

/**
 * Lifecycle state reported by a ZIP frame-sequence export.
 *
 * @category ZIP frame-sequence export
 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/ZIPExportState | ZIPExportState API reference}
 */
export type ZIPExportState = 'capturing' | 'finalizing' | 'completed' | 'error';

/**
 * Machine-readable ZIP export failure category.
 *
 * @category ZIP frame-sequence export
 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/ZIPExportErrorCode | ZIPExportErrorCode API reference}
 */
export type ZIPExportErrorCode =
	| 'ZIP_EXPORT_INVALID_OPTIONS'
	| 'ZIP_EXPORT_ENCODING_UNSUPPORTED'
	| 'ZIP_EXPORT_TOO_LARGE'
	| 'ZIP_EXPORT_ABORTED'
	| 'ZIP_EXPORT_TIMEOUT'
	| 'ZIP_EXPORT_BUSY'
	| 'ZIP_EXPORT_DISPOSED'
	| 'ZIP_EXPORT_FAILED';

/**
 * Progress information emitted while ZIP frames are captured and archived.
 *
 * @category ZIP frame-sequence export
 * @see {@link https://code.textmode.art/api/textmode.export.js/interfaces/ZIPExportProgress | ZIPExportProgress API reference}
 */
export interface ZIPExportProgress {
	/**
	 * Current ZIP export state.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/interfaces/ZIPExportProgress#state | ZIPExportProgress.state API reference}
	 */
	state: ZIPExportState;
	/**
	 * Number of completed frame entries.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/interfaces/ZIPExportProgress#frameindex | ZIPExportProgress.frameIndex API reference}
	 */
	frameIndex: number;
	/**
	 * Total number of frame entries planned for the archive.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/interfaces/ZIPExportProgress#totalframes | ZIPExportProgress.totalFrames API reference}
	 */
	totalFrames: number;
	/**
	 * Normalized completed-frame ratio from `0` through `1`.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/interfaces/ZIPExportProgress#progress | ZIPExportProgress.progress API reference}
	 */
	progress: number;
	/**
	 * Optional failure message for an `error` event.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/interfaces/ZIPExportProgress#message | ZIPExportProgress.message API reference}
	 */
	message?: string;
}

/**
 * Options shared by all ZIP frame formats.
 *
 * Set these alongside the required `format` in {@link ZIPExportOptions}.
 * For example, `frameCount: 120` and `frameRate: 30` capture four seconds.
 *
 * @category ZIP frame-sequence export
 * @see {@link https://code.textmode.art/api/textmode.export.js/interfaces/ZIPCaptureOptions | ZIPCaptureOptions API reference}
 */
export interface ZIPCaptureOptions {
	/**
	 * Target archive filename, with or without `.zip`.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/interfaces/ZIPCaptureOptions#filename | ZIPCaptureOptions.filename API reference}
	 */
	filename?: string;
	/**
	 * Number of frames to capture, from 1 through 65,534. Defaults to `300`.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/interfaces/ZIPCaptureOptions#framecount | ZIPCaptureOptions.frameCount API reference}
	 */
	frameCount?: number;
	/**
	 * Number of frames to capture per second. Must be greater than zero and finite. Defaults to `60`.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/interfaces/ZIPCaptureOptions#framerate | ZIPCaptureOptions.frameRate API reference}
	 */
	frameRate?: number;
	/**
	 * Updates external state before each frame is drawn. The callback receives `frameIndex` (starting at zero),
	 * `frameCount`, `frameRate`, `startSeconds`, `centerSeconds`, `endSeconds`, and an optional abort `signal`.
	 * Use `centerSeconds` to sample external media. Capture waits for a returned promise before drawing.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/interfaces/ZIPCaptureOptions#prepareframe | ZIPCaptureOptions.prepareFrame API reference}
	 */
	prepareFrame?: PrepareExportFrame;
	/**
	 * Cancels capture, serialization, or archive finalization.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/interfaces/ZIPCaptureOptions#signal | ZIPCaptureOptions.signal API reference}
	 */
	signal?: AbortSignal;
	/**
	 * Receives capture and archive lifecycle updates.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/interfaces/ZIPCaptureOptions#onprogress | ZIPCaptureOptions.onProgress API reference}
	 */
	onProgress?: (progress: ZIPExportProgress) => void;
}

/**
 * Options accepted by `frameOptions` for each ZIP frame format.
 *
 * Choose the frame format with {@link ZIPExportOptions}. Set the archive filename
 * on {@link ZIPCaptureOptions}, not inside `frameOptions`. For image frames,
 * the outer `format` also selects the image format.
 *
 * @category ZIP frame-sequence export
 * @see {@link https://code.textmode.art/api/textmode.export.js/interfaces/ZIPFrameOptionsMap | ZIPFrameOptionsMap API reference}
 */
export interface ZIPFrameOptionsMap {
	/**
	 * PNG image settings, such as `scale`. See {@link ImageExportOptions}.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/interfaces/ZIPFrameOptionsMap#property-png | ZIPFrameOptionsMap.png API reference}
	 */
	png: Omit<ImageExportOptions, 'filename' | 'format'>;
	/**
	 * JPEG image settings, such as `scale`. See {@link ImageExportOptions}.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/interfaces/ZIPFrameOptionsMap#property-jpg | ZIPFrameOptionsMap.jpg API reference}
	 */
	jpg: Omit<ImageExportOptions, 'filename' | 'format'>;
	/**
	 * WebP image settings, such as `scale`. See {@link ImageExportOptions}.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/interfaces/ZIPFrameOptionsMap#property-webp | ZIPFrameOptionsMap.webp API reference}
	 */
	webp: Omit<ImageExportOptions, 'filename' | 'format'>;
	/**
	 * SVG layer settings, such as `drawMode`. See {@link SVGExportOptions}.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/interfaces/ZIPFrameOptionsMap#property-svg | ZIPFrameOptionsMap.svg API reference}
	 */
	svg: Omit<SVGExportOptions, 'filename'>;
	/**
	 * Text layer settings, such as `preserveTrailingSpaces`. See {@link TXTExportOptions}.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/interfaces/ZIPFrameOptionsMap#property-txt | ZIPFrameOptionsMap.txt API reference}
	 */
	txt: Omit<TXTExportOptions, 'filename'>;
}

/**
 * Options for capturing a frame sequence as a ZIP archive.
 *
 * Set the required `format` to `png`, `jpg`, `webp`, `svg`, or `txt`.
 * Add shared capture settings such as `frameCount`, `frameRate`, and `filename`
 * from {@link ZIPCaptureOptions}. Use `frameOptions` for settings specific to
 * the selected format; {@link ZIPFrameOptionsMap} lists the available options.
 * Set the archive filename and image format on the outer options, not in `frameOptions`.
 *
 * @example
 * Capture 120 PNG frames at 30 frames per second, scaled to double size:
 * ```ts
 * await t.saveZip({
 *     format: 'png',
 *     filename: 'animation',
 *     frameCount: 120,
 *     frameRate: 30,
 *     frameOptions: { scale: 2 },
 * });
 * ```
 *
 * @example
 * Capture SVG frames with outlined characters:
 * ```ts
 * const archive = await t.toZipBlob({
 *     format: 'svg',
 *     frameCount: 60,
 *     frameRate: 30,
 *     frameOptions: { drawMode: 'stroke', strokeWidth: 1.5 },
 * });
 * ```
 *
 * @category ZIP frame-sequence export
 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/ZIPExportOptions | ZIPExportOptions API reference}
 */
export type ZIPExportOptions = {
	[F in ZIPFrameFormat]: ZIPCaptureOptions & {
		format: F;
		frameOptions?: ZIPFrameOptionsMap[F];
	};
}[ZIPFrameFormat];

export interface ZIPGenerationOptions {
	format: ZIPFrameFormat;
	filename?: string;
	frameCount: number;
	frameRate: number;
	frameOptions: unknown;
	prepareFrame?: PrepareExportFrame;
	signal?: AbortSignal;
	onProgress?: (progress: ZIPExportProgress) => void;
}

export type ZIPEntryCompression = 'store' | 'deflate';

export interface ZIPFrameSerializer {
	readonly extension: `.${ZIPFrameFormat}`;
	readonly compression: ZIPEntryCompression;
	getDimensions(context: { canvas: HTMLCanvasElement; frameOptions: unknown }): {
		width: number;
		height: number;
	};
	serialize(context: { canvas: HTMLCanvasElement; frameOptions: unknown; createdAt: Date }): Promise<Uint8Array>;
}

export interface ZIPFrameSequenceManifest {
	schema: 'textmode.frame-sequence';
	schemaVersion: '1.0.0';
	generator: {
		name: 'textmode.export.js';
		version: string;
	};
	createdAt: string;
	format: ZIPFrameFormat;
	frameCount: number;
	frameRate: number;
	width: number;
	height: number;
	indexBase: 1;
	filePattern: string;
}
