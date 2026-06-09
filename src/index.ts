/**
 * @packageDocumentation
 *
 * Export plugin for textmode.js - save artworks as images, videos, SVG, JSON, and text.
 *
 * This plugin adds comprehensive export capabilities to textmode.js instances,
 * allowing you to save your generative artworks in multiple formats with a
 * convenient overlay UI for quick access to all export options.
 *
 * ## Available export formats
 *
 * ### Image formats
 * - {@link ImageExportOptions | PNG/JPEG/WebP} - Save canvas as raster image
 *
 * ### Vector formats
 * - {@link SVGExportOptions | SVG} - Save as scalable vector graphics
 *
 * ### Text formats
 * - {@link TXTExportOptions | TXT} - Save text content as plain text
 * - {@link JSONExportOptions | JSON} - Save document data as structured JSON
 *
 * ### Animation formats
 * - {@link GIFExportOptions | GIF} - Save as animated GIF
 * - {@link VideoExportOptions | Video} - Save as WebM or MP4 video
 *
 * @module textmode.export.js
 */

import type { Textmodifier } from 'textmode.js';
import type { TextmodePlugin, TextmodePluginContext } from 'textmode.js';
import { SVGExporter, type SVGExportOptions } from './exporters/svg';
import { ImageExporter, type ImageExportOptions } from './exporters/image';
import { TXTExporter, type TXTExportOptions } from './exporters/txt';
import { GIFExporter, type GIFExportOptions } from './exporters/gif';
import { VideoExporter, type VideoExportOptions } from './exporters/video';
import { JSONExporter, type JSONExportOptions } from './exporters/json';
import { createExportOverlay } from './overlay';
import { createLayerTargetProvider } from './exporters/base';
import type { TextmodeExportAPI, TextmodeExportPluginOptions, ExportOverlayController } from './types';
import { TEXTMODE_EXPORT_VERSION } from './version';

// Re-export all export option types for consumers
export type { TextmodeExportAPI, TextmodeExportPluginOptions, ExportOverlayController } from './types';
export type { ImageExportOptions } from './exporters/image';
export type { SVGExportOptions } from './exporters/svg';
export type { TXTExportOptions } from './exporters/txt';
export type {
	JSONCellCollection,
	JSONCellTransform,
	JSONColorValue,
	JSONDocumentFormat,
	JSONDocumentVersion,
	JSONExportColorMode,
	JSONExportMetadata,
	JSONExportOptions,
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
} from './exporters/json';
export type { GIFExportOptions, GIFExportProgress } from './exporters/gif';
export type { VideoExportErrorCode, VideoExportOptions, VideoExportProgress } from './exporters/video';
export type { LayerExportOptions } from './exporters/base';

type TextmodifierWithExportInternals = Textmodifier &
	Partial<TextmodeExportAPI> & {
		_exportOverlayController?: ReturnType<typeof createExportOverlay>;
	};

/**
 * Export plugin for textmode.js.
 *
 * Add this plugin to your textmode.js instance to enable exporting artworks
 * as images, videos, SVG, JSON, and text files. Includes an overlay UI for quick
 * access to all export options, which can be controlled at runtime.
 *
 * @example
 * {@includeCode ../examples/ExportPlugin/init/sketch.js}
 */
export const ExportPlugin: TextmodePlugin = {
	name: 'textmode.export',
	version: TEXTMODE_EXPORT_VERSION,

	/**
	 * Installs the export plugin into a Textmodifier instance
	 *
	 * @param textmodifier The Textmodifier instance
	 * @param api The plugin API
	 * @returns Promise that resolves when installation is complete
	 */
	async install(textmodifier: Textmodifier, api: TextmodePluginContext) {
		// Create export API methods first
		const exportMethods = {
			/**
			 * Saves the current canvas as an image file
			 *
			 * @param options Export options
			 * @returns Promise that resolves when the file is saved
			 */
			saveCanvas: async (options: ImageExportOptions = {}) => {
				return new ImageExporter().$saveImage(textmodifier.canvas, options);
			},

			/**
			 * Copies the current canvas image to the clipboard
			 *
			 * @param options Export options
			 * @returns Promise that resolves when the image is copied
			 * @throws {Error} If the Clipboard API is not supported or copying fails
			 */
			copyCanvas: async (options: ImageExportOptions = {}) => {
				return new ImageExporter().$copyImageToClipboard(textmodifier.canvas, options);
			},

			/**
			 * Saves the current canvas as an SVG file
			 *
			 * @param options Export options
			 */
			saveSVG: (options: SVGExportOptions = {}) => {
				new SVGExporter().$saveSVG(textmodifier, options);
			},

			/**
			 * Saves the current text content as a TXT file
			 *
			 * @param options Export options
			 */
			saveStrings: (options: TXTExportOptions = {}) => {
				new TXTExporter().$saveTXT(textmodifier, options);
			},

			/**
			 * Generates SVG content as a string
			 *
			 * @param options Export options
			 * @returns String containing the SVG content
			 */
			toSVG: (options: SVGExportOptions = {}) => {
				return new SVGExporter().$generateSVG(textmodifier, options);
			},

			/**
			 * Generates TXT content as a string
			 *
			 * @param options Export options
			 * @returns String containing the TXT content
			 */
			toString: (options: TXTExportOptions = {}) => {
				return new TXTExporter().$generateTXT(textmodifier, options);
			},

			/**
			 * Generates structured JSON document data for the selected layer or layer stack.
			 *
			 * @param options Export options
			 * @returns Object containing the exported document data
			 */
			toJSON: (options: JSONExportOptions = {}) => {
				return new JSONExporter().$generateJSONData(textmodifier, options);
			},

			/**
			 * Generates serialized JSON for the selected layer.
			 *
			 * @param options Export options
			 * @returns String containing the JSON content
			 */
			toJSONString: (options: JSONExportOptions = {}) => {
				return new JSONExporter().$generateJSONString(textmodifier, options);
			},

			/**
			 * Saves the selected layer as a JSON file.
			 *
			 * @param options Export options
			 */
			saveJSON: (options: JSONExportOptions = {}) => {
				new JSONExporter().$saveJSON(textmodifier, options);
			},

			/**
			 * Saves the current canvas as an animated GIF file
			 *
			 * @param options Export options
			 * @returns Promise that resolves when the file is saved
			 */
			saveGIF: async (options: GIFExportOptions = {}) => {
				return new GIFExporter(textmodifier, api.registerPostDrawHook).$saveGIF(options);
			},

			/**
			 * Saves the current canvas as an MP4/H.264 video file
			 *
			 * @param options Export options
			 * @returns Promise that resolves when the file is saved
			 */
			saveVideo: async (options: VideoExportOptions = {}) => {
				return new VideoExporter(textmodifier, api.registerPostDrawHook).$saveVideo(options);
			},
		};

		// Create overlay controller (it needs access to export methods)
		const overlayController = createExportOverlay(
			textmodifier,
			exportMethods as TextmodeExportAPI,
			createLayerTargetProvider(textmodifier)
		);
		api.registerPostDrawHook(() => {
			if (overlayController.isVisible()) {
				overlayController.refreshLayerTargets();
			}
		});

		// Create overlay API
		const exportOverlayAPI: ExportOverlayController = {
			show: () => overlayController.show(),
			hide: () => overlayController.hide(),
			toggle: () => overlayController.toggle(),
			isVisible: () => overlayController.isVisible(),
		};

		// Combine into full export API
		const exportAPI: TextmodeExportAPI = {
			...exportMethods,
			exportOverlay: exportOverlayAPI,
		};

		const exportTarget = textmodifier as TextmodifierWithExportInternals;
		Object.assign(exportTarget, exportAPI);

		// Store controller reference for cleanup
		exportTarget._exportOverlayController = overlayController;
	},

	async uninstall(textmodifier: Textmodifier) {
		const exportTarget = textmodifier as TextmodifierWithExportInternals;
		const overlayController = exportTarget._exportOverlayController;
		overlayController?.$dispose();
		delete exportTarget._exportOverlayController;

		const exportApiKeys: Array<keyof TextmodeExportAPI> = [
			'exportOverlay',
			'saveCanvas',
			'copyCanvas',
			'saveSVG',
			'saveStrings',
			'toSVG',
			'toString',
			'toJSON',
			'toJSONString',
			'saveJSON',
			'saveGIF',
			'saveVideo',
		];

		for (const key of exportApiKeys) {
			delete exportTarget[key];
		}
	},
};

/**
 * Creates the `textmode.export.js` plugin for textmode.js.
 *
 * @deprecated Use {@link ExportPlugin} directly instead.
 * This function is provided for backwards compatibility only.
 *
 * @example
 * ```javascript
 * // Old way (deprecated)
 * import { createTextmodeExportPlugin } from 'textmode.export.js';
 * const t = textmode.create({ plugins: [createTextmodeExportPlugin()] });
 *
 * // New way (recommended)
 * import { ExportPlugin } from 'textmode.export.js';
 * const t = textmode.create({ plugins: [ExportPlugin] });
 * ```
 *
 * @param options Plugin options
 * @returns A textmode.js plugin instance.
 */
export const createTextmodeExportPlugin = (options: TextmodeExportPluginOptions = {}): TextmodePlugin => {
	const overlayEnabled = options.overlay ?? true;

	// Return modified plugin that respects overlay option
	const plugin: TextmodePlugin = { ...ExportPlugin };
	const originalInstall = plugin.install;

	plugin.install = async (textmodifier: Textmodifier, api: TextmodePluginContext) => {
		const exportTarget = textmodifier as TextmodifierWithExportInternals;
		await originalInstall.call(plugin, exportTarget, api);

		// If overlay should be disabled, hide it after installation
		if (!overlayEnabled) {
			exportTarget.exportOverlay?.hide();
		}
	};

	return plugin;
};

declare global {
	interface Window {
		ExportPlugin?: TextmodePlugin;
		createTextmodeExportPlugin?: typeof createTextmodeExportPlugin;
	}
}

// UMD global export
if (typeof window !== 'undefined') {
	window.ExportPlugin = ExportPlugin;
	// Keep backwards compatibility
	window.createTextmodeExportPlugin = createTextmodeExportPlugin;
}
