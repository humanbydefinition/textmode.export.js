import type { ImageExportOptions } from './exporters/image';
import type { TXTExportOptions } from './exporters/txt';
import type { SVGExportOptions } from './exporters/svg';
import type { GIFExportOptions } from './exporters/gif';
import type { VideoExportOptions } from './exporters/video';
import type { JSONExportOptions, TextmodeDocumentJSON } from './exporters/json';

/**
 * Controller for managing the export overlay UI visibility at runtime.
 *
 * @see {@link https://code.textmode.art/api/textmode.export.js/interfaces/ExportOverlayController | ExportOverlayController API reference}
 */
export interface ExportOverlayController {
	/**
	 * Shows the export overlay UI.
	 *
	 * @example
	 * ```ts
	 * t.exportOverlay.show();
	 * ```
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/interfaces/ExportOverlayController/methods/show | ExportOverlayController.show API reference}
	 */
	show(): void;

	/**
	 * Hides the export overlay UI.
	 *
	 * @example
	 * ```ts
	 * t.exportOverlay.hide();
	 * ```
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/interfaces/ExportOverlayController/methods/hide | ExportOverlayController.hide API reference}
	 */
	hide(): void;

	/**
	 * Toggles the export overlay UI visibility.
	 *
	 * @example
	 * ```ts
	 * t.exportOverlay.toggle();
	 * ```
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/interfaces/ExportOverlayController/methods/toggle | ExportOverlayController.toggle API reference}
	 */
	toggle(): void;

	/**
	 * Checks if the export overlay is currently visible.
	 *
	 * @example
	 * ```ts
	 * const visible = t.exportOverlay.isVisible();
	 * ```
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/interfaces/ExportOverlayController/methods/isVisible | ExportOverlayController.isVisible API reference}
	 */
	isVisible(): boolean;
}

/**
 * Runtime export helpers that `createExportPlugin` attaches to the `Textmodifier` instance.
 *
 * @example
 * {@includeCode ../examples/ExportPlugin/layerTargets/sketch.js}
 *
 * @see {@link https://code.textmode.art/api/textmode.export.js/interfaces/TextmodeExportAPI | TextmodeExportAPI API reference}
 */
export interface TextmodeExportAPI {
	/**
	 * Controller for managing the export overlay UI visibility at runtime.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/interfaces/TextmodeExportAPI#exportoverlay | TextmodeExportAPI.exportOverlay API reference}
	 */
	exportOverlay: ExportOverlayController;

	/**
	 * Saves the current canvas content to an image file *(`'png'` by default)*.
	 *
	 * @param options Export options.
	 *
	 * @example
	 * ```ts
	 * await t.saveCanvas({ format: 'png', filename: 'frame-001' });
	 * ```
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/interfaces/TextmodeExportAPI/methods/saveCanvas | TextmodeExportAPI.saveCanvas API reference}
	 */
	saveCanvas(options?: ImageExportOptions): Promise<void>;

	/**
	 * Copies the current canvas to the user's clipboard as an image.
	 *
	 * @param options Export options.
	 *
	 * @example
	 * ```ts
	 * await t.copyCanvas({ format: 'png' });
	 * ```
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/interfaces/TextmodeExportAPI/methods/copyCanvas | TextmodeExportAPI.copyCanvas API reference}
	 */
	copyCanvas(options?: ImageExportOptions): Promise<void>;

	/**
	 * Downloads the selected layer as an SVG file.
	 *
	 * @param options Export options.
	 *
	 * @example
	 * ```ts
	 * t.saveSVG({ filename: 'poster', layer: t.layers.base, includeBackgroundRectangles: true });
	 * ```
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/interfaces/TextmodeExportAPI/methods/saveSVG | TextmodeExportAPI.saveSVG API reference}
	 */
	saveSVG(options?: SVGExportOptions): void;

	/**
	 * Downloads the selected layer's text content as a plain-text file.
	 *
	 * @param options Export options.
	 *
	 * @example
	 * ```ts
	 * t.saveStrings({ filename: 'frame', layer: t.layers.base, preserveTrailingSpaces: true });
	 * ```
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/interfaces/TextmodeExportAPI/methods/saveStrings | TextmodeExportAPI.saveStrings API reference}
	 */
	saveStrings(options?: TXTExportOptions): void;

	/**
	 * Generates SVG markup for the selected layer.
	 *
	 * @param options Export options.
	 * @returns The SVG content representing the artwork.
	 *
	 * @example
	 * ```ts
	 * const svg = t.toSVG({ layer: t.layers.base, drawMode: 'stroke', strokeWidth: 1.5 });
	 * ```
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/interfaces/TextmodeExportAPI/methods/toSVG | TextmodeExportAPI.toSVG API reference}
	 */
	toSVG(options?: SVGExportOptions): string;

	/**
	 * Produces the selected layer's text content as a string.
	 *
	 * @param options Export options.
	 * @returns The textual representation of the artwork.
	 *
	 * @example
	 * ```ts
	 * const text = t.toString({ layer: t.layers.base, preserveTrailingSpaces: false });
	 * ```
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/interfaces/TextmodeExportAPI/methods/toString | TextmodeExportAPI.toString API reference}
	 */
	toString(options?: TXTExportOptions): string;

	/**
	 * Produces the selected layer or layer stack as structured JSON data.
	 *
	 * @param options Export options.
	 * @returns The JSON document representing the selected layer or layer stack.
	 *
	 * @example
	 * ```ts
	 * const layer = t.toJSON({ layer: t.layers.base, colorMode: 'hex', includeMetadata: true });
	 * const stack = t.toJSON({ target: 'all' });
	 * ```
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/interfaces/TextmodeExportAPI/methods/toJSON | TextmodeExportAPI.toJSON API reference}
	 */
	toJSON(options?: JSONExportOptions): TextmodeDocumentJSON;

	/**
	 * Produces the selected layer or layer stack as a JSON string.
	 *
	 * @param options Export options.
	 * @returns Serialized JSON string for the selected layer or layer stack.
	 *
	 * @example
	 * ```ts
	 * const json = t.toJSONString({ layer: t.layers.base, pretty: false, colorMode: 'hex' });
	 * const stackJson = t.toJSONString({ target: 'all' });
	 * ```
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/interfaces/TextmodeExportAPI/methods/toJSONString | TextmodeExportAPI.toJSONString API reference}
	 */
	toJSONString(options?: JSONExportOptions): string;

	/**
	 * Downloads the selected layer or layer stack as a JSON file.
	 *
	 * @param options Export options.
	 *
	 * @example
	 * ```ts
	 * t.saveJSON({ filename: 'frame', layer: t.layers.base, pretty: true });
	 * t.saveJSON({ filename: 'stack', target: 'all' });
	 * ```
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/interfaces/TextmodeExportAPI/methods/saveJSON | TextmodeExportAPI.saveJSON API reference}
	 */
	saveJSON(options?: JSONExportOptions): void;

	/**
	 * Records an animated GIF and saves it to disk.
	 *
	 * @param options Export options.
	 *
	 * @example
	 * ```ts
	 * await t.saveGIF({ frameCount: 120, frameRate: 30, filename: 'loop' });
	 * ```
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/interfaces/TextmodeExportAPI/methods/saveGIF | TextmodeExportAPI.saveGIF API reference}
	 */
	saveGIF(options?: GIFExportOptions): Promise<void>;

	/**
	 * Captures a video and saves it to disk *(`'mp4'` by default)*.
	 *
	 * @param options Export options.
	 *
	 * @example
	 * ```ts
	 * await t.saveVideo({ frameCount: 240, frameRate: 60, filename: 'capture' });
	 * await t.saveVideo({
	 *     format: 'webm',
	 *     bitrate: 'high',
	 *     bitrateMode: 'variable',
	 *     latencyMode: 'quality',
	 *     keyFrameInterval: 2,
	 *     frameCount: 240,
	 *     filename: 'capture',
	 * });
	 * ```
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/interfaces/TextmodeExportAPI/methods/saveVideo | TextmodeExportAPI.saveVideo API reference}
	 */
	saveVideo(options?: VideoExportOptions): Promise<void>;
}

/**
 * Options for configuring the export plugin.
 *
 * @deprecated This interface is only used by the deprecated `createTextmodeExportPlugin` function.
 * Use {@link ExportPlugin} directly instead, and control overlay visibility at runtime via
 * {@link ExportOverlayController}.
 *
 * @see {@link https://code.textmode.art/api/textmode.export.js/interfaces/TextmodeExportPluginOptions | TextmodeExportPluginOptions API reference}
 */
export interface TextmodeExportPluginOptions {
	/**
	 * Controls whether the export overlay UI should be created.
	 * Defaults to `true`.
	 *
	 * @deprecated Use runtime overlay controls instead: `textmodifier.exportOverlay.show()` / `.hide()`
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/interfaces/TextmodeExportPluginOptions#overlay | TextmodeExportPluginOptions.overlay API reference}
	 */
	overlay?: boolean;
}
