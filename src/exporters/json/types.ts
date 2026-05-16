import type { LayerExportOptions } from '../base';

/**
 * Target scope for JSON export.
 */
export type JSONExportTarget = 'selected' | 'all';

/**
 * Canonical JSON document format identifier.
 */
export type JSONDocumentFormat = 'textmode.document';

/**
 * Canonical JSON document format version.
 */
export type JSONDocumentVersion = '2.0.0';

/**
 * Supported JSON color output modes.
 */
export type JSONExportColorMode = 'hex' | 'rgba';

/**
 * RGBA color representation used in JSON exports.
 */
export interface JSONRGBAColor {
	r: number;
	g: number;
	b: number;
	a: number;
}

/**
 * Color value used in the exported JSON document.
 */
export type JSONColorValue = string | JSONRGBAColor;

/**
 * Cell transform data for JSON exports.
 */
export interface JSONCellTransform {
	invert: boolean;
	flipX: boolean;
	flipY: boolean;
	rotation: number;
}

/**
 * Rich per-cell representation for readable JSON exports.
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
 */
export interface JSONObjectRowsCellCollection {
	encoding: 'object-rows-v1';
	rows: JSONObjectRowCell[][];
}

/**
 * Supported JSON cell collection variants.
 */
export type JSONCellCollection = JSONObjectRowsCellCollection;

/**
 * Grid dimensions exported for a layer.
 */
export interface JSONLayerGrid {
	cols: number;
	rows: number;
	cellWidth: number;
	cellHeight: number;
}

/**
 * Optional export metadata.
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
 */
export interface TextmodeSelectedDocumentLayer {
	id: string;
	cells: JSONCellCollection;
}

/**
 * Selected-layer document exported by the JSON exporter.
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
 */
export type TextmodeDocumentJSON = TextmodeSelectedDocumentJSON | TextmodeAllDocumentJSON;

/**
 * Options for exporting the textmode content to JSON format.
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
