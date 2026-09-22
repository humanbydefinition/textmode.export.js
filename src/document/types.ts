import type {
	LEGACY_TEXTMODE_ALL_VERSION,
	LEGACY_TEXTMODE_LAYER_FORMAT,
	LEGACY_TEXTMODE_SELECTED_VERSION,
	TEXTMODE_DOCUMENT_FORMAT,
	TEXTMODE_DOCUMENT_FORMAT_VERSION,
	TEXTMODE_OBJECT_ROWS_ENCODING,
} from './constants';

/**
 * Scope encoded by a textmode document.
 *
 * @category JSON document data
 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/TextmodeDocumentTarget | TextmodeDocumentTarget API reference}
 */
export type TextmodeDocumentTarget = 'selected' | 'all';
/** Format discriminator encoded in a document. */
export type TextmodeDocumentFormat = typeof TEXTMODE_DOCUMENT_FORMAT;
/** Current on-disk format version, independent of the npm package version. */
export type TextmodeDocumentVersion = typeof TEXTMODE_DOCUMENT_FORMAT_VERSION;

/** RGBA color channels, each an integer from 0 through 255. */
export interface TextmodeDocumentRGBAColor {
	r: number;
	g: number;
	b: number;
	a: number;
}

/** On-disk color notation; decoded colors use RGBA channels. */
export type TextmodeDocumentColor = string | TextmodeDocumentRGBAColor;

/** Per-cell transform in degrees. */
export interface TextmodeDocumentCellTransform {
	invert: boolean;
	flipX: boolean;
	flipY: boolean;
	rotation: number;
}

/** Cell at its redundant row-major x/y coordinates. */
export interface TextmodeDocumentCell {
	x: number;
	y: number;
	character: string;
	foreground: TextmodeDocumentColor;
	background: TextmodeDocumentColor;
	transform: TextmodeDocumentCellTransform;
}

/** Dense row-major cell collection. */
export interface TextmodeDocumentCellCollection {
	encoding: typeof TEXTMODE_OBJECT_ROWS_ENCODING;
	rows: TextmodeDocumentCell[][];
}

/** Logical grid dimensions and pixel extent of each cell. */
export interface TextmodeDocumentGrid {
	cols: number;
	rows: number;
	cellWidth: number;
	cellHeight: number;
}

/** Optional producer information; it does not control decoding behavior. */
export interface TextmodeDocumentMetadata {
	createdAt: string;
	generator: {
		name: string;
		version: string;
	};
}

/**
 * Scope selected by the JSON exporter.
 *
 * @deprecated Use TextmodeDocumentTarget.
 * @category JSON document data
 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/JSONExportTarget | JSONExportTarget API reference}
 */
export type JSONExportTarget = TextmodeDocumentTarget;
/** @deprecated Use TextmodeDocumentFormat. */
export type JSONDocumentFormat = TextmodeDocumentFormat;
/** @deprecated Use TextmodeDocumentVersion. */
export type JSONDocumentVersion = TextmodeDocumentVersion;
/** @deprecated Use TextmodeDocumentRGBAColor. */
export type JSONRGBAColor = TextmodeDocumentRGBAColor;
/** @deprecated Use TextmodeDocumentColor. */
export type JSONColorValue = TextmodeDocumentColor;
/** @deprecated Use TextmodeDocumentCellTransform. */
export type JSONCellTransform = TextmodeDocumentCellTransform;
/** @deprecated Use TextmodeDocumentCell. */
export type JSONObjectRowCell = TextmodeDocumentCell;
/** @deprecated Use TextmodeDocumentCellCollection. */
export type JSONObjectRowsCellCollection = TextmodeDocumentCellCollection;
/** @deprecated Use TextmodeDocumentCellCollection. */
export type JSONCellCollection = TextmodeDocumentCellCollection;
/** @deprecated Use TextmodeDocumentGrid. */
export type JSONLayerGrid = TextmodeDocumentGrid;
/** @deprecated Use TextmodeDocumentMetadata. */
export type JSONExportMetadata = TextmodeDocumentMetadata;

export interface TextmodeSelectedDocumentLayer {
	id: string;
	cells: JSONCellCollection;
}

export interface TextmodeSelectedDocumentJSON {
	format: JSONDocumentFormat;
	formatVersion: JSONDocumentVersion;
	target: 'selected';
	metadata?: JSONExportMetadata;
	canvas: {
		width: number;
		height: number;
	};
	grid: JSONLayerGrid;
	layer: TextmodeSelectedDocumentLayer;
}

export interface TextmodeDocumentLayer {
	id: string;
	visible: boolean;
	opacity: number;
	blendMode: string;
	offsetX: number;
	offsetY: number;
	rotationZ: number;
	grid: JSONLayerGrid;
	cells: JSONCellCollection;
}

export interface TextmodeAllDocumentJSON {
	format: JSONDocumentFormat;
	formatVersion: JSONDocumentVersion;
	target: 'all';
	metadata?: JSONExportMetadata;
	canvas: {
		width: number;
		height: number;
	};
	layers: TextmodeDocumentLayer[];
}

/**
 * JSON document produced by the selected-layer or layer-stack exporter.
 *
 * @category JSON document data
 *
 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/TextmodeDocumentJSON | TextmodeDocumentJSON API reference}
 */
export type TextmodeDocumentJSON = TextmodeSelectedDocumentJSON | TextmodeAllDocumentJSON;

export interface CanonicalTextmodeCell extends Omit<JSONObjectRowCell, 'foreground' | 'background' | 'transform'> {
	foreground: JSONRGBAColor;
	background: JSONRGBAColor;
	transform: JSONCellTransform;
}

export interface CanonicalTextmodeCellCollection {
	encoding: typeof TEXTMODE_OBJECT_ROWS_ENCODING;
	rows: CanonicalTextmodeCell[][];
}

export interface CanonicalTextmodeSelectedDocument extends Omit<TextmodeSelectedDocumentJSON, 'layer'> {
	layer: {
		id: string;
		cells: CanonicalTextmodeCellCollection;
	};
}

export interface CanonicalTextmodeDocumentLayer extends Omit<TextmodeDocumentLayer, 'cells'> {
	cells: CanonicalTextmodeCellCollection;
}

export interface CanonicalTextmodeAllDocument extends Omit<TextmodeAllDocumentJSON, 'layers'> {
	layers: CanonicalTextmodeDocumentLayer[];
}

export type CanonicalTextmodeDocument = CanonicalTextmodeSelectedDocument | CanonicalTextmodeAllDocument;

export interface TextmodeDocumentLimits {
	maxCells?: number;
	maxLayers?: number;
	maxLayerIdLength?: number;
	maxCharacterLength?: number;
	maxMetadataStringLength?: number;
}

export interface TextmodeDocumentDecodeOptions {
	limits?: TextmodeDocumentLimits;
	acceptLegacy?: boolean;
}

export type TextmodeDocumentErrorCode =
	| 'INVALID_JSON'
	| 'INVALID_DOCUMENT'
	| 'UNSUPPORTED_FORMAT'
	| 'UNSUPPORTED_VERSION'
	| 'UNSUPPORTED_TARGET'
	| 'UNSUPPORTED_ENCODING'
	| 'LIMIT_EXCEEDED';

export interface TextmodeDocumentError {
	code: TextmodeDocumentErrorCode;
	message: string;
	path?: string;
}

export interface TextmodeDocumentWarning {
	code: 'LEGACY_DOCUMENT_MIGRATED';
	message: string;
}

export type JSONParseResult = { ok: true; value: unknown } | { ok: false; error: TextmodeDocumentError };

export type TextmodeDocumentDecodeResult =
	| {
			ok: true;
			document: CanonicalTextmodeDocument;
			warnings: TextmodeDocumentWarning[];
	  }
	| { ok: false; error: TextmodeDocumentError };

export type TextmodeDocumentParseResult = TextmodeDocumentDecodeResult;

export interface LegacyTextmodeSelectedDocumentJSON {
	$schema?: string;
	format: typeof LEGACY_TEXTMODE_LAYER_FORMAT;
	formatVersion: typeof LEGACY_TEXTMODE_SELECTED_VERSION;
	metadata?: JSONExportMetadata;
	canvas: { width: number; height: number };
	grid: JSONLayerGrid;
	layer: TextmodeSelectedDocumentLayer;
}

export interface LegacyTextmodeAllDocumentJSON {
	$schema?: string;
	format: typeof LEGACY_TEXTMODE_LAYER_FORMAT;
	formatVersion: typeof LEGACY_TEXTMODE_ALL_VERSION;
	metadata?: JSONExportMetadata;
	canvas: { width: number; height: number };
	layers: TextmodeDocumentLayer[];
}
