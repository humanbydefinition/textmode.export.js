import type { LayerExportOptions } from '../base';
import type { TextmodeDocumentCellTransform, TextmodeDocumentRGBAColor } from '@textmode/document';

/**
 * Layer selection for export; never serialized into the document.
 *
 * @category JSON document data
 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/JSONExportTarget | JSONExportTarget API reference}
 */
export type JSONExportTarget = 'selected' | 'all';

/**
 * Color representation written by the JSON exporter: hexadecimal strings or
 * RGBA channel objects.
 *
 * @category JSON document data
 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/JSONExportColorMode | JSONExportColorMode API reference}
 */
export type JSONExportColorMode = 'hex' | 'rgba';

/**
 * Options for exporting textmode content to JSON.
 *
 * @category JSON document data
 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/JSONExportOptions | JSONExportOptions API reference}
 */
export type JSONExportOptions = LayerExportOptions & {
	/**
	 * Export one selected layer or the complete layer stack.
	 * Defaults to `all`. When `selected`, uses the base layer if `layer` is omitted.
	 */
	target?: JSONExportTarget;

	/** Filename used by the download helper. A default name is used when omitted. */
	filename?: string;

	/**
	 * Pretty-print with two spaces when `true`, use the given indentation width
	 * when numeric, or produce compact JSON when `false`. Defaults to `true`.
	 */
	pretty?: boolean | number;

	/** Foreground and background color representation. Defaults to `hex`. */
	colorMode?: JSONExportColorMode;

	/** Include the creation timestamp and generator metadata. Defaults to `true`. */
	includeMetadata?: boolean;
};

/** Internal JSON generation options after defaults have been applied. */
export interface JSONGenerationOptions {
	target: JSONExportTarget;
	pretty: boolean | number;
	colorMode: JSONExportColorMode;
	includeMetadata: boolean;
	filename?: string;
	layer?: LayerExportOptions['layer'];
}

/** Internal framebuffer cell data used while building a document. */
export interface JSONCellData {
	x: number;
	y: number;
	character: string;
	foreground: TextmodeDocumentRGBAColor;
	background: TextmodeDocumentRGBAColor;
	transform: TextmodeDocumentCellTransform;
}

/**
 * Progress emitted by JSON frame-sequence capture.
 *
 * @category JSON frame-sequence export
 * @see {@link https://code.textmode.art/api/textmode.export.js/interfaces/JSONSequenceExportProgress | JSONSequenceExportProgress API reference}
 */
export interface JSONSequenceExportProgress {
	state: 'capturing' | 'finalizing' | 'completed' | 'error';
	frameIndex: number;
	totalFrames: number;
	progress: number;
	message?: string;
}

/**
 * Options for deterministic, fixed-rate JSON sequence capture.
 *
 * @category JSON frame-sequence export
 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/JSONSequenceExportOptions | JSONSequenceExportOptions API reference}
 */
export type JSONSequenceExportOptions = JSONExportOptions & {
	frameCount?: number;
	frameRate?: number;
	prepareFrame?: import('../base').PrepareExportFrame;
	signal?: AbortSignal;
	onProgress?: (progress: JSONSequenceExportProgress) => void;
};

/**
 * Machine-readable JSON sequence failure.
 *
 * @category JSON frame-sequence export
 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/JSONSequenceExportErrorCode | JSONSequenceExportErrorCode API reference}
 */
export type JSONSequenceExportErrorCode =
	| 'JSON_SEQUENCE_INVALID_OPTIONS'
	| 'JSON_SEQUENCE_LIMIT_EXCEEDED'
	| 'JSON_SEQUENCE_ABORTED'
	| 'JSON_SEQUENCE_TIMEOUT'
	| 'JSON_SEQUENCE_BUSY'
	| 'JSON_SEQUENCE_DISPOSED'
	| 'JSON_SEQUENCE_FAILED';
