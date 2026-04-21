import type { ImageExportOptions } from './exporters/image';
import type { TXTExportOptions } from './exporters/txt';
import type { SVGExportOptions } from './exporters/svg';
import type { GIFExportOptions } from './exporters/gif';
import type { VideoExportOptions } from './exporters/video';

/**
 * Controller for managing the export overlay UI visibility at runtime.
 */
export interface ExportOverlayController {
	/**
	 * Shows the export overlay UI.
	 *
	 * @example
	 * ```ts
	 * t.exportOverlay.show();
	 * ```
	 */
	show(): void;

	/**
	 * Hides the export overlay UI.
	 *
	 * @example
	 * ```ts
	 * t.exportOverlay.hide();
	 * ```
	 */
	hide(): void;

	/**
	 * Toggles the export overlay UI visibility.
	 *
	 * @example
	 * ```ts
	 * t.exportOverlay.toggle();
	 * ```
	 */
	toggle(): void;

	/**
	 * Checks if the export overlay is currently visible.
	 *
	 * @example
	 * ```ts
	 * const visible = t.exportOverlay.isVisible();
	 * ```
	 */
	isVisible(): boolean;
}

/**
 * Runtime export helpers that `createExportPlugin` attaches to the `Textmodifier` instance.
 */
export interface TextmodeExportAPI {
	/**
	 * Controller for managing the export overlay UI visibility at runtime.
	 */
	exportOverlay: ExportOverlayController;

	/**
	 * Saves the current canvas content to an image file *(`'png'` by default)*.
	 * @param options Export options.
	 *
	 * @example
	 * ```ts
	 * await t.saveCanvas({ format: 'png', filename: 'frame-001' });
	 * ```
	 */
	saveCanvas(options?: ImageExportOptions): Promise<void>;

	/**
	 * Copies the current canvas to the user's clipboard as an image.
	 * @param options Export options.
	 *
	 * @example
	 * ```ts
	 * await t.copyCanvas({ format: 'png' });
	 * ```
	 */
	copyCanvas(options?: ImageExportOptions): Promise<void>;

	/**
	 * Downloads the current frame as an SVG file.
	 * @param options Export options.
	 *
	 * @example
	 * ```ts
	 * t.saveSVG({ filename: 'poster', includeBackgroundRectangles: true });
	 * ```
	 */
	saveSVG(options?: SVGExportOptions): void;

	/**
	 * Downloads the current text content as a plain-text file.
	 * @param options Export options.
	 *
	 * @example
	 * ```ts
	 * t.saveStrings({ filename: 'frame', preserveTrailingSpaces: true });
	 * ```
	 */
	saveStrings(options?: TXTExportOptions): void;

	/**
	 * Generates the SVG markup for the current frame.
	 * @param options Export options.
	 * @returns The SVG content representing the artwork.
	 *
	 * @example
	 * ```ts
	 * const svg = t.toSVG({ drawMode: 'stroke', strokeWidth: 1.5 });
	 * ```
	 */
	toSVG(options?: SVGExportOptions): string;

	/**
	 * Produces the current text content as a string.
	 * @param options Export options.
	 * @returns The textual representation of the artwork.
	 *
	 * @example
	 * ```ts
	 * const text = t.toString({ preserveTrailingSpaces: false });
	 * ```
	 */
	toString(options?: TXTExportOptions): string;

	/**
	 * Records an animated GIF and saves it to disk.
	 * @param options Export options.
	 *
	 * @example
	 * ```ts
	 * await t.saveGIF({ frameCount: 120, frameRate: 30, filename: 'loop' });
	 * ```
	 */
	saveGIF(options?: GIFExportOptions): Promise<void>;

	/**
	 * Captures a WEBM video and saves it to disk.
	 * @param options Export options.
	 *
	 * @example
	 * ```ts
	 * await t.saveWEBM({ frameCount: 240, frameRate: 60, filename: 'capture' });
	 * ```
	 */
	saveWEBM(options?: VideoExportOptions): Promise<void>;
}

/**
 * Options for configuring the export plugin.
 *
 * @deprecated This interface is only used by the deprecated `createTextmodeExportPlugin` function.
 * Use {@link ExportPlugin} directly instead, and control overlay visibility at runtime via
 * {@link ExportOverlayController}.
 */
export interface TextmodeExportPluginOptions {
	/**
	 * Controls whether the export overlay UI should be created.
	 * Defaults to `true`.
	 *
	 * @deprecated Use runtime overlay controls instead: `textmodifier.exportOverlay.show()` / `.hide()`
	 */
	overlay?: boolean;
}
