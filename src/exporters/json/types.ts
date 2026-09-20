import type { LayerExportOptions } from '../base';
import type { JSONCellTransform, JSONExportColorMode, JSONExportTarget, JSONRGBAColor } from '../../document';

export type {
	JSONCellCollection,
	JSONCellTransform,
	JSONColorValue,
	JSONDocumentFormat,
	JSONDocumentVersion,
	JSONExportColorMode,
	JSONExportMetadata,
	JSONExportTarget,
	JSONLayerGrid,
	JSONObjectRowCell,
	JSONObjectRowsCellCollection,
	JSONRGBAColor,
	TextmodeAllDocumentJSON,
	TextmodeDocumentJSON,
	TextmodeDocumentLayer,
	TextmodeSelectedDocumentJSON,
	TextmodeSelectedDocumentLayer,
} from '../../document';

/**
 * Options for exporting textmode content to JSON.
 *
 * @category JSON document data
 *
 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/JSONExportOptions | JSONExportOptions API reference}
 */
export type JSONExportOptions = LayerExportOptions & {
	/** Export one selected layer or the complete layer stack. Defaults to `selected`. */
	target?: JSONExportTarget;

	/** Filename used by the download helper. */
	filename?: string;

	/** Pretty-print with two spaces, a custom indentation width, or not at all. */
	pretty?: boolean | number;

	/** Color representation used for foreground and background values. Defaults to `hex`. */
	colorMode?: JSONExportColorMode;

	/** Include the timestamp and generator metadata. Defaults to `true`. */
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
	foreground: JSONRGBAColor;
	background: JSONRGBAColor;
	transform: JSONCellTransform;
}
