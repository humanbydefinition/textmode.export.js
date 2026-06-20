import type { LayerExportOptions } from '../base';

/**
 * Target scope for JSON export.
 *
 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/JSONExportTarget | JSONExportTarget API reference}
 */
export type JSONExportTarget = 'selected' | 'all';

/**
 * Canonical JSON document format identifier.
 *
 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/JSONDocumentFormat | JSONDocumentFormat API reference}
 */
export type JSONDocumentFormat = 'textmode.document';

/**
 * Canonical JSON document format version.
 *
 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/JSONDocumentVersion | JSONDocumentVersion API reference}
 */
export type JSONDocumentVersion = '2.0.0';

/**
 * Supported JSON color output modes.
 *
 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/JSONExportColorMode | JSONExportColorMode API reference}
 */
export type JSONExportColorMode = 'hex' | 'rgba';

/**
 * RGBA color representation used in JSON exports.
 *
 * @see {@link https://code.textmode.art/api/textmode.export.js/interfaces/JSONRGBAColor | JSONRGBAColor API reference}
 */
export interface JSONRGBAColor {
	r: number;
	g: number;
	b: number;
	a: number;
}

/**
 * Color value used in the exported JSON document.
 *
 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/JSONColorValue | JSONColorValue API reference}
 */
export type JSONColorValue = string | JSONRGBAColor;

/**
 * Cell transform data for JSON exports.
 *
 * @see {@link https://code.textmode.art/api/textmode.export.js/interfaces/JSONCellTransform | JSONCellTransform API reference}
 */
export interface JSONCellTransform {
	invert: boolean;
	flipX: boolean;
	flipY: boolean;
	rotation: number;
}

/**
 * Rich per-cell representation for readable JSON exports.
 *
 * @see {@link https://code.textmode.art/api/textmode.export.js/interfaces/JSONObjectRowCell | JSONObjectRowCell API reference}
 */
export interface JSONObjectRowCell {
	x: number;
	y: number;
	character: string;
	foreground: JSONColorValue;
	background: JSONColorValue;
	transform: JSONCellTransform;
}

/**
 * Row-based cell encoding.
 *
 * @see {@link https://code.textmode.art/api/textmode.export.js/interfaces/JSONObjectRowsCellCollection | JSONObjectRowsCellCollection API reference}
 */
export interface JSONObjectRowsCellCollection {
	encoding: 'object-rows-v1';
	rows: JSONObjectRowCell[][];
}

/**
 * Supported JSON cell collection variants.
 *
 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/JSONCellCollection | JSONCellCollection API reference}
 */
export type JSONCellCollection = JSONObjectRowsCellCollection;

/**
 * Grid dimensions exported for a layer.
 *
 * @see {@link https://code.textmode.art/api/textmode.export.js/interfaces/JSONLayerGrid | JSONLayerGrid API reference}
 */
export interface JSONLayerGrid {
	cols: number;
	rows: number;
	cellWidth: number;
	cellHeight: number;
}

/**
 * Optional export metadata.
 *
 * @see {@link https://code.textmode.art/api/textmode.export.js/interfaces/JSONExportMetadata | JSONExportMetadata API reference}
 */
export interface JSONExportMetadata {
	createdAt: string;
	generator: {
		name: 'textmode.export.js';
		version: string;
	};
}

/**
 * Selected-layer entry in a JSON document export.
 *
 * @see {@link https://code.textmode.art/api/textmode.export.js/interfaces/TextmodeSelectedDocumentLayer | TextmodeSelectedDocumentLayer API reference}
 */
export interface TextmodeSelectedDocumentLayer {
	id: string;
	cells: JSONCellCollection;
}

/**
 * Selected-layer document exported by the JSON exporter.
 *
 * @see {@link https://code.textmode.art/api/textmode.export.js/interfaces/TextmodeSelectedDocumentJSON | TextmodeSelectedDocumentJSON API reference}
 */
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

/**
 * Single layer entry in an all-layers JSON export.
 *
 * @see {@link https://code.textmode.art/api/textmode.export.js/interfaces/TextmodeDocumentLayer | TextmodeDocumentLayer API reference}
 */
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

/**
 * Layer stack document exported by the JSON exporter.
 *
 * @see {@link https://code.textmode.art/api/textmode.export.js/interfaces/TextmodeAllDocumentJSON | TextmodeAllDocumentJSON API reference}
 */
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
 * JSON document exported by the JSON exporter.
 *
 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/TextmodeDocumentJSON | TextmodeDocumentJSON API reference}
 */
export type TextmodeDocumentJSON = TextmodeSelectedDocumentJSON | TextmodeAllDocumentJSON;

/**
 * Options for exporting the textmode content to JSON format.
 *
 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/JSONExportOptions | JSONExportOptions API reference}
 */
export type JSONExportOptions = LayerExportOptions & {
	/**
	 * Scope of the JSON export.
	 *
	 * Use `'selected'` to export one layer, or `'all'` to export the base layer and every user-created layer.
	 *
	 * Defaults to `'selected'`.
	 */
	target?: JSONExportTarget;

	/**
	 * The filename to save the JSON file as.
	 *
	 * If not provided, a default filename is used.
	 */
	filename?: string;

	/**
	 * Pretty-print the generated JSON.
	 *
	 * When set to `true`, output uses two-space indentation.
	 * When set to a number, that value is used as indentation width.
	 * When `false`, the output is minified.
	 *
	 * Defaults to `true`.
	 */
	pretty?: boolean | number;

	/**
	 * Color representation used for foreground and background values.
	 *
	 * Defaults to `'hex'`.
	 */
	colorMode?: JSONExportColorMode;

	/**
	 * Whether to include export metadata such as timestamp and generator details.
	 *
	 * Defaults to `true`.
	 */
	includeMetadata?: boolean;
};

/**
 * Internal options used by JSON generation (with all defaults applied).
 */
export interface JSONGenerationOptions {
	target: JSONExportTarget;
	pretty: boolean | number;
	colorMode: JSONExportColorMode;
	includeMetadata: boolean;
	filename?: string;
	layer?: LayerExportOptions['layer'];
}

/**
 * Internal extracted cell data used while building the JSON document.
 */
export interface JSONCellData {
	x: number;
	y: number;
	character: string;
	foreground: JSONRGBAColor;
	background: JSONRGBAColor;
	transform: JSONCellTransform;
}
