/**
 * @packageDocumentation
 *
 * Export finished textmode.js artworks without leaving the sketch.
 *
 * ## Choose an output
 *
 * Use **canvas capture** for the rendered image on screen: PNG, JPEG, WebP,
 * GIF, and video preserve compositing, filters, shaders, and post-processing.
 * Use **layer data export** when the artwork should stay editable or machine
 * readable: TXT and SVG read from the selected layer, while JSON can describe
 * either the selected layer or the full layer stack.
 *
 * Start with {@link ExportPlugin}, then call the helpers added to your sketch
 * or use the built-in export overlay. For recipes and format trade-offs, read
 * the [Exporting guide](/docs/exporting).
 *
 * @categoryDescription Workflow
 * Install the plugin and use the export helpers added to a textmode.js sketch.
 *
 * @categoryDescription Canvas capture
 * Export a still image from the rendered canvas.
 *
 * @categoryDescription GIF export
 * Capture deterministic frames and encode an animated GIF.
 *
 * @categoryDescription Video export
 * Capture deterministic frames and encode MP4 or WebM video with Mediabunny.
 *
 * @categoryDescription ZIP frame-sequence export
 * Capture deterministic PNG, JPEG, WebP, SVG, JSON, or TXT frames in a code-only ZIP archive.
 *
 * @categoryDescription Layer data export
 * Export selected-layer text or vector data as TXT or SVG.
 *
 * @categoryDescription JSON document data
 * Export selected-layer or full-stack document data as JSON.
 *
 * @categoryDescription Overlay
 * Configure and control the built-in export overlay.
 *
 * @showCategories
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
export { ZIPExportError } from './exporters/zip';
export type {
	ZIPCaptureOptions,
	ZIPExportErrorCode,
	ZIPExportOptions,
	ZIPExportProgress,
	ZIPExportState,
	ZIPFrameFormat,
	ZIPFrameOptionsMap,
} from './exporters/zip';
export type {
	VideoBitrateMode,
	VideoExportFormat,
	VideoExportOptions,
	VideoExportPhase,
	VideoExportProgress,
	VideoHardwareAcceleration,
	VideoQuality,
	VideoQualityLevel,
	VideoSaveDestination,
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
