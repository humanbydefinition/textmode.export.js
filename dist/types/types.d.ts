import type { ImageExportOptions } from './exporters/image';
import type { TXTExportOptions } from './exporters/txt';
import type { SVGExportOptions } from './exporters/svg';
import type { GIFExportOptions } from './exporters/gif';
import type { VideoExportOptions } from './exporters/video';
/**
 * Runtime export helpers that `createExportPlugin` attaches to the `Textmodifier` instance.
 */
export interface TextmodeExportAPI {
    /**
     * Saves the current canvas content to an image file *(`'png'` by default)*.
     * @param options Export options.
     */
    saveCanvas(options?: ImageExportOptions): Promise<void>;
    /**
     * Copies the current canvas to the user's clipboard as an image.
     * @param options Export options.
     */
    copyCanvas(options?: ImageExportOptions): Promise<void>;
    /**
     * Downloads the current frame as an SVG file.
     * @param options Export options.
     */
    saveSVG(options?: SVGExportOptions): void;
    /**
     * Downloads the current text content as a plain-text file.
     * @param options Export options.
     */
    saveStrings(options?: TXTExportOptions): void;
    /**
     * Generates the SVG markup for the current frame.
     * @param options Export options.
     * @returns The SVG content representing the artwork.
     */
    toSVG(options?: SVGExportOptions): string;
    /**
     * Produces the current text content as a string.
     * @param options Export options.
     * @returns The textual representation of the artwork.
     */
    toString(options?: TXTExportOptions): string;
    /**
     * Records an animated GIF and saves it to disk.
     * @param options Export options.
     */
    saveGIF(options?: GIFExportOptions): Promise<void>;
    /**
     * Captures a WEBM video and saves it to disk.
     * @param options Export options.
     */
    saveWEBM(options?: VideoExportOptions): Promise<void>;
}
/**
 * Options for configuring the export plugin.
 */
export interface TextmodeExportPluginOptions {
    /**
     * Controls whether the export overlay UI should be created.
     * Defaults to `true`.
     */
    overlay?: boolean;
}
//# sourceMappingURL=types.d.ts.map