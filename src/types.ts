import type { ImageExportOptions } from './exporters/image';
import type { TXTExportOptions } from './exporters/txt';
import type { SVGExportOptions } from './exporters/svg';
import type { GIFExportOptions } from './exporters/gif';
import type { VideoBitratePreset, VideoExportOptions } from './exporters/video';
import type { JSONExportOptions, TextmodeDocumentJSON } from './exporters/json';

export type TXTOverlayDefaults = Pick<TXTExportOptions, 'preserveTrailingSpaces' | 'emptyCharacter'>;
export type JSONOverlayDefaults = Pick<JSONExportOptions, 'target' | 'pretty' | 'includeMetadata' | 'colorMode'>;
export type ImageOverlayDefaults = Pick<ImageExportOptions, 'format' | 'scale'>;
export type SVGOverlayDefaults = Pick<SVGExportOptions, 'includeBackgroundRectangles' | 'drawMode' | 'strokeWidth'>;
export type GIFOverlayDefaults = Pick<GIFExportOptions, 'frameCount' | 'frameRate' | 'scale' | 'repeat'>;
export type VideoOverlayDefaults = Pick<
	VideoExportOptions,
	| 'format'
	| 'frameCount'
	| 'frameRate'
	| 'bitrateMode'
	| 'latencyMode'
	| 'hardwareAcceleration'
	| 'keyFrameInterval'
	| 'transparent'
> & {
	bitrate?: VideoBitratePreset;
};

/**
 * Per-format default options used to seed the overlay UI inputs at mount time
 * and after a {@link ExportOverlayController.resetDefaults} call.
 *
 * Each sub-object contains the library-chosen defaults for the fields that
 * the overlay exposes.  Top-level `format` controls which export format is
 * selected in the overlay. You can read and override them at runtime via
 * {@link ExportOverlayController.getDefaults} and
 * {@link ExportOverlayController.setDefaults}.
 *
 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/ExportDefaults | ExportDefaults API reference}
 */
export type ExportDefaults = {
	/**
	 * Export format selected by default in the overlay.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/ExportDefaults | ExportDefaults API reference}
	 */
	format: 'txt' | 'json' | 'image' | 'gif' | 'video' | 'svg';
	txt: TXTOverlayDefaults;
	json: JSONOverlayDefaults;
	image: ImageOverlayDefaults;
	svg: SVGOverlayDefaults;
	gif: GIFOverlayDefaults;
	video: VideoOverlayDefaults;
};

/**
 * Partial patch accepted by {@link ExportOverlayController.setDefaults}.
 *
 * Every supplied per-format sub-object is deep-merged into the corresponding
 * format's curated defaults. Top-level `format` changes the overlay's selected
 * format. Omitted keys keep their current value.
 *
 * @example
 * ```ts
 * t.exportOverlay.setDefaults({ format: 'image', image: { scale: 2 }, gif: { frameRate: 30 } });
 * ```
 *
 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/ExportDefaultsPatch | ExportDefaultsPatch API reference}
 */
export type ExportDefaultsPatch = {
	format?: ExportDefaults['format'];
} & {
	[K in Exclude<keyof ExportDefaults, 'format'>]?: Partial<ExportDefaults[K]>;
};

/**
 * Current canvas-relative placement state for the export overlay UI.
 *
 * `auto` means the overlay is using the library default offset from the
 * textmode canvas. `custom` means the user or runtime API has moved it.
 *
 * @see {@link https://code.textmode.art/api/textmode.export.js/interfaces/ExportOverlayPosition | ExportOverlayPosition API reference}
 */
export interface ExportOverlayPosition {
	mode: 'auto' | 'custom';
	offsetX: number;
	offsetY: number;
}

/**
 * Canvas-relative placement coordinates for the export overlay UI.
 *
 * @see {@link https://code.textmode.art/api/textmode.export.js/interfaces/ExportOverlayPositionInput | ExportOverlayPositionInput API reference}
 */
export interface ExportOverlayPositionInput {
	offsetX: number;
	offsetY: number;
}

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

	/**
	 * Restores the export overlay to its default canvas-relative placement and
	 * clears any remembered placement.
	 *
	 * @example
	 * ```ts
	 * t.exportOverlay.resetPosition();
	 * ```
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/interfaces/ExportOverlayController/methods/resetPosition | ExportOverlayController.resetPosition API reference}
	 */
	resetPosition(): void;

	/**
	 * Reads the current export overlay placement.
	 *
	 * @returns The current canvas-relative overlay placement state.
	 *
	 * @example
	 * ```ts
	 * const position = t.exportOverlay.getPosition();
	 * console.log(position.mode, position.offsetX, position.offsetY);
	 * ```
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/interfaces/ExportOverlayController/methods/getPosition | ExportOverlayController.getPosition API reference}
	 */
	getPosition(): Readonly<ExportOverlayPosition>;

	/**
	 * Moves the export overlay to a custom canvas-relative placement and
	 * remembers that placement for future sessions on the same origin.
	 *
	 * @param position Canvas-relative overlay offsets in CSS pixels.
	 *
	 * @example
	 * ```ts
	 * t.exportOverlay.setPosition({ offsetX: 24, offsetY: 24 });
	 * ```
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/interfaces/ExportOverlayController/methods/setPosition | ExportOverlayController.setPosition API reference}
	 */
	setPosition(position: ExportOverlayPositionInput): void;

	/**
	 * Override the curated overlay defaults at runtime.
	 *
	 * Merges the supplied patch into the internal defaults store. Per-format
	 * option patches are pushed into mounted blades; top-level `format` updates
	 * the overlay's selected export format immediately.
	 *
	 * @param patch Partial defaults to merge per format.
	 *
	 * @example
	 * ```ts
	 * // Select image export by default, set image scale to 2×, and GIF to 30 fps
	 * t.exportOverlay.setDefaults({ format: 'image', image: { scale: 2 }, gif: { frameRate: 30 } });
	 * ```
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/interfaces/ExportOverlayController/methods/setDefaults | ExportOverlayController.setDefaults API reference}
	 */
	setDefaults(patch: ExportDefaultsPatch): void;

	/**
	 * Read the current effective defaults for every format.
	 *
	 * The returned object reflects the library's curated defaults merged
	 * with any runtime overrides applied via {@link setDefaults}.
	 *
	 * @returns The current per-format defaults.
	 *
	 * @example
	 * ```ts
	 * const defaults = t.exportOverlay.getDefaults();
	 * console.log(defaults.image.scale); // 1 (or whatever was set)
	 * ```
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/interfaces/ExportOverlayController/methods/getDefaults | ExportOverlayController.getDefaults API reference}
	 */
	getDefaults(): Readonly<ExportDefaults>;

	/**
	 * Restore one or all formats to the library's curated defaults.
	 *
	 * If a format is specified, only that format is reset; otherwise all
	 * formats are restored.
	 *
	 * @param format Optional format to reset. Omit to reset all.
	 *
	 * @example
	 * ```ts
	 * // Reset image defaults
	 * t.exportOverlay.resetDefaults('image');
	 *
	 * // Reset the overlay's selected default export format
	 * t.exportOverlay.resetDefaults('format');
	 *
	 * // Reset all formats
	 * t.exportOverlay.resetDefaults();
	 * ```
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/interfaces/ExportOverlayController/methods/resetDefaults | ExportOverlayController.resetDefaults API reference}
	 */
	resetDefaults(format?: keyof ExportDefaults): void;
}

/**
 * Runtime export helpers that `ExportPlugin` attaches to the `Textmodifier` instance.
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
