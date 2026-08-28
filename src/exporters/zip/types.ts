import type { PrepareExportFrame } from '../base';
import type { ImageExportOptions } from '../image';
import type { JSONExportOptions } from '../json';
import type { SVGExportOptions } from '../svg';
import type { TXTExportOptions } from '../txt';

/**
 * File format used for every frame in a ZIP frame-sequence export.
 *
 * @category ZIP frame-sequence export
 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/ZIPFrameFormat | ZIPFrameFormat API reference}
 */
export type ZIPFrameFormat = 'png' | 'jpg' | 'webp' | 'svg' | 'json' | 'txt';

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
	 * Number of frames to capture. Defaults to `300`.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/interfaces/ZIPCaptureOptions#framecount | ZIPCaptureOptions.frameCount API reference}
	 */
	frameCount?: number;
	/**
	 * Deterministic sampling rate. Defaults to `60`.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/interfaces/ZIPCaptureOptions#framerate | ZIPCaptureOptions.frameRate API reference}
	 */
	frameRate?: number;
	/**
	 * Prepares external state before each deterministic redraw.
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
 * Format-specific options forwarded to each existing still exporter.
 *
 * @category ZIP frame-sequence export
 * @see {@link https://code.textmode.art/api/textmode.export.js/interfaces/ZIPFrameOptionsMap | ZIPFrameOptionsMap API reference}
 */
export interface ZIPFrameOptionsMap {
	png: Omit<ImageExportOptions, 'filename' | 'format'>;
	jpg: Omit<ImageExportOptions, 'filename' | 'format'>;
	webp: Omit<ImageExportOptions, 'filename' | 'format'>;
	svg: Omit<SVGExportOptions, 'filename'>;
	json: Omit<JSONExportOptions, 'filename'>;
	txt: Omit<TXTExportOptions, 'filename'>;
}

/**
 * Discriminated options for a deterministic ZIP frame-sequence export.
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
