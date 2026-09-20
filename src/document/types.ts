import type {
	LEGACY_TEXTMODE_ALL_VERSION,
	LEGACY_TEXTMODE_LAYER_FORMAT,
	LEGACY_TEXTMODE_SELECTED_VERSION,
	TEXTMODE_DOCUMENT_FORMAT,
	TEXTMODE_DOCUMENT_FORMAT_VERSION,
	TEXTMODE_OBJECT_ROWS_ENCODING,
} from './constants';

export type JSONExportTarget = 'selected' | 'all';
export type JSONDocumentFormat = typeof TEXTMODE_DOCUMENT_FORMAT;
export type JSONDocumentVersion = typeof TEXTMODE_DOCUMENT_FORMAT_VERSION;
export type JSONExportColorMode = 'hex' | 'rgba';

export interface JSONRGBAColor {
	r: number;
	g: number;
	b: number;
	a: number;
}

export type JSONColorValue = string | JSONRGBAColor;

export interface JSONCellTransform {
	invert: boolean;
	flipX: boolean;
	flipY: boolean;
	rotation: number;
}

export interface JSONObjectRowCell {
	x: number;
	y: number;
	character: string;
	foreground: JSONColorValue;
	background: JSONColorValue;
	transform: JSONCellTransform;
}

export interface JSONObjectRowsCellCollection {
	encoding: typeof TEXTMODE_OBJECT_ROWS_ENCODING;
	rows: JSONObjectRowCell[][];
}

export type JSONCellCollection = JSONObjectRowsCellCollection;

export interface JSONLayerGrid {
	cols: number;
	rows: number;
	cellWidth: number;
	cellHeight: number;
}

export interface JSONExportMetadata {
	createdAt: string;
	generator: {
		name: 'textmode.export.js';
		version: string;
	};
}

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
