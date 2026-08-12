/**
 * @packageDocumentation
 *
 * Export finished textmode.js artworks without leaving the sketch.
 *
 * ## Choose an output
 *
 * Use **canvas capture** for the exact image on screen: PNG, JPEG, WebP, GIF,
 * or video preserve compositing, filters, shaders, and post-processing. Use
 * **layer data export** when the artwork should stay editable or machine
 * readable: TXT, SVG, and JSON read from the selected layer, while JSON can
 * also describe the full layer stack.
 *
 * Start with {@link ExportPlugin}, then call the helpers added to your sketch
 * or use the built-in export overlay. For recipes and format trade-offs, read
 * the [Exporting guide](/docs/exporting).
 */

import type { Textmodifier } from 'textmode.js';
import type { TextmodePlugin, TextmodePluginContext } from 'textmode.js';
import './augmentations';
import { SVGExporter, type SVGExportOptions } from './exporters/svg';
import { ImageExporter, type ImageExportOptions } from './exporters/image';
import { TXTExporter, type TXTExportOptions } from './exporters/txt';
import { GIFExporter, type GIFExportOptions } from './exporters/gif';
import { VideoExporter, type VideoExportOptions } from './exporters/video';
import { JSONExporter, type JSONExportOptions } from './exporters/json';
import { createExportOverlay } from './overlay';
import { createLayerTargetProvider } from './exporters/base';
import type { TextmodeExportAPI, ExportOverlayController, ExportDefaults, ExportDefaultsPatch } from './types';
import { TEXTMODE_EXPORT_VERSION } from './version';

// Re-export all types for consumers
export type {
	ExportDefaults,
	ExportDefaultsPatch,
	ExportOverlayPosition,
	ExportOverlayPositionInput,
	GIFOverlayDefaults,
	ImageOverlayDefaults,
	JSONOverlayDefaults,
	SVGOverlayDefaults,
	TXTOverlayDefaults,
	VideoOverlayDefaults,
} from './types';
export type { TextmodeExportAPI, ExportOverlayController } from './types';
export type { ImageExportOptions } from './exporters/image';
export type { SVGExportOptions } from './exporters/svg';
export type { TXTExportOptions } from './exporters/txt';
export type { JSONExportColorMode, JSONExportOptions, JSONExportTarget, TextmodeDocumentJSON } from './exporters/json';
export type { GIFExportOptions, GIFExportProgress } from './exporters/gif';
export type {
	VideoBitrateMode,
	VideoBitratePreset,
	VideoExportFormat,
	VideoExportOptions,
	VideoExportPhase,
	VideoExportProgress,
	VideoHardwareAcceleration,
	VideoLatencyMode,
	VideoRecordingState,
} from './exporters/video';
export type { LayerExportOptions } from './exporters/base';

// Module-level WeakMap to store the overlay controller without leaking
// private keys onto the user's Textmodifier instance.
interface InstalledExportPlugin {
	disposeOverlay: () => void;
}

const _controllers = new WeakMap<Textmodifier, InstalledExportPlugin>();
const _apiMethodKeys: ReadonlyArray<Exclude<keyof TextmodeExportAPI, 'exportOverlay'>> = [
	'saveCanvas',
	'toImageBlob',
	'copyCanvas',
	'saveSVG',
	'saveStrings',
	'toSVG',
	'toString',
	'toJSON',
	'toJSONString',
	'saveJSON',
	'saveGIF',
	'toGIFBlob',
	'saveVideo',
	'toVideoBlob',
];

/**
 * Default export plugin instance for the standard textmode.js workflow.
 *
 * @category Workflow
 *
 * @see {@link https://code.textmode.art/api/textmode.export.js/variables/ExportPlugin | ExportPlugin API reference}
 */
export const ExportPlugin: TextmodePlugin = {
	name: 'textmode.export',
	version: TEXTMODE_EXPORT_VERSION,

	/**
	 * Installs the export plugin into a Textmodifier instance
	 *
	 * @param textmodifier The Textmodifier instance
	 * @param api The plugin API
	 */
	install(textmodifier: Textmodifier, api: TextmodePluginContext) {
		const onPostDraw = (callback: () => void): (() => void) => api.on('postDraw', callback);
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

			toImageBlob: async (options: ImageExportOptions = {}) => {
				return new ImageExporter().$toImageBlob(textmodifier.canvas, options);
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
				return new GIFExporter(textmodifier, onPostDraw).$saveGIF(options);
			},

			toGIFBlob: async (options: GIFExportOptions = {}) => {
				return new GIFExporter(textmodifier, onPostDraw).$generateGIFBlob(options);
			},

			/**
			 * Saves the current canvas as an MP4/H.264 video file
			 *
			 * @param options Export options
			 * @returns Promise that resolves when the file is saved
			 */
			saveVideo: async (options: VideoExportOptions = {}) => {
				return new VideoExporter(textmodifier, onPostDraw).$saveVideo(options);
			},

			toVideoBlob: async (options: VideoExportOptions = {}) => {
				return new VideoExporter(textmodifier, onPostDraw).$generateVideoBlob(options);
			},
		};

		const overlayController = createExportOverlay(
			textmodifier,
			exportMethods as TextmodeExportAPI,
			createLayerTargetProvider(textmodifier)
		);
		const stopOverlayRefresh = onPostDraw(() => {
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
			resetPosition: () => overlayController.resetPosition(),
			getPosition: () => overlayController.getPosition(),
			setPosition: (position) => overlayController.setPosition(position),
			setDefaults: (patch: ExportDefaultsPatch) => overlayController.setDefaults(patch),
			getDefaults: () => overlayController.getDefaults(),
			resetDefaults: (format?: keyof ExportDefaults) => overlayController.resetDefaults(format),
		};

		// Register the export API as Textmodifier extensions so the plugin runtime
		// handles conflict detection and uninstall cleanup uniformly. The export
		// methods are registered as value extensions; the overlay controller is
		// exposed through a getter.
		for (const key of _apiMethodKeys) {
			api.defineExtension('textmodifier', key, {
				value: exportMethods[key],
			});
		}
		api.defineExtension('textmodifier', 'exportOverlay', {
			get: () => exportOverlayAPI,
		});

		_controllers.set(textmodifier, {
			disposeOverlay: () => {
				stopOverlayRefresh();
				overlayController.$dispose();
			},
		});
	},

	uninstall(textmodifier: Textmodifier) {
		const installed = _controllers.get(textmodifier);
		installed?.disposeOverlay();
		_controllers.delete(textmodifier);

		// Extension properties and hooks are removed by the plugin runtime's
		// extension registry and hook registry when the plugin is uninstalled.
	},
};

declare global {
	interface Window {
		ExportPlugin?: TextmodePlugin;
	}
}

// UMD global export
if (typeof window !== 'undefined') {
	window.ExportPlugin = ExportPlugin;
}
