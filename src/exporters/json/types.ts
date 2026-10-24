import type { LayerExportOptions } from '../base';
import type {
	TextmodeDocumentCellTransform,
	TextmodeDocumentTarget,
	TextmodeDocumentRGBAColor,
} from '@textmode/document';

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
	 * Defaults to `selected`.
	 */
	target?: TextmodeDocumentTarget;

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
	target: TextmodeDocumentTarget;
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
