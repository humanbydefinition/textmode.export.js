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

import type { TextmodePlugin, TextmodePluginContext } from 'textmode.js';
import './augmentations';
import { EXPORT_API_METHOD_KEYS, TextmodeExportController } from './runtime/TextmodeExportController';
import packageJson from '../package.json';

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
	VideoContentHint,
	VideoExportFormat,
	VideoExportOptions,
	VideoExportPhase,
	VideoExportProgress,
	VideoHardwareAcceleration,
	VideoLatencyMode,
	VideoRecordingState,
} from './exporters/video';
export type { LayerExportOptions } from './exporters/base';

/**
 * Default export plugin instance for the standard textmode.js workflow.
 *
 * @category Workflow
 *
 * @see {@link https://code.textmode.art/api/textmode.export.js/variables/ExportPlugin | ExportPlugin API reference}
 */
export const ExportPlugin: TextmodePlugin = {
	name: packageJson.name,

	/**
	 * Installs the export plugin into a Textmodifier instance
	 *
	 * @param textmodifier The Textmodifier instance
	 * @param api The plugin API
	 * @returns A cleanup function that releases the mounted overlay and its post-draw subscription.
	 */
	install(textmodifier, api: TextmodePluginContext): () => void {
		const controller = new TextmodeExportController(textmodifier, (callback) => api.on('postDraw', callback));
		try {
			for (const key of EXPORT_API_METHOD_KEYS) {
				api.defineExtension('textmodifier', key, {
					value: controller.api[key],
				});
			}
			api.defineExtension('textmodifier', 'exportOverlay', {
				get: () => controller.api.exportOverlay,
			});
		} catch (error) {
			controller.dispose();
			throw error;
		}

		return () => controller.dispose();
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
