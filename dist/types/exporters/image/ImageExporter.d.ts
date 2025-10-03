import { type ImageExportOptions, type ImageGenerationOptions } from './types';
/**
 * Main image exporter for the textmode.js library.
 * Orchestrates the image export process by coordinating canvas capture,
 * format conversion, and file handling.
 */
export declare class ImageExporter {
    /**
     * Applies default values to image export options
     * @param options User-provided options
     * @returns Complete options with defaults applied
     */
    private _applyDefaultOptions;
    /**
     * Validates export options and browser support
     * @param options The options to validate
     * @throws Error if options are invalid or format is not supported
     */
    private _validateOptions;
    /**
     * Generates image blob from textmode rendering without saving to file
     * @param canvasData The canvas data containing the rendered textmode graphics
     * @param options Export options
     * @returns Promise that resolves to a Blob containing the image data
     */
    $generateImageBlob(canvas: HTMLCanvasElement, options: ImageGenerationOptions): Promise<Blob>;
    /**
     * Exports image to a downloadable file
     * @param canvas The canvas data containing the rendered textmode graphics
     * @param options Export options
     */
    $saveImage(canvas: HTMLCanvasElement, options?: ImageExportOptions): Promise<void>;
    /**
     * Copies the generated image to the clipboard using the modern Clipboard API
     * @param canvas The source canvas element
     * @param options Export options
     */
    $copyImageToClipboard(canvas: HTMLCanvasElement, options?: ImageExportOptions): Promise<void>;
}
//# sourceMappingURL=ImageExporter.d.ts.map