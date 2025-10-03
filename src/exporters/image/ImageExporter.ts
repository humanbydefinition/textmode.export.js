import { IMAGE_MIME_TYPES, type ImageExportOptions, type ImageGenerationOptions } from './types';
import { FileHandler } from '../base';

/**
 * Main image exporter for the textmode.js library.
 * Orchestrates the image export process by coordinating canvas capture,
 * format conversion, and file handling.
 */
export class ImageExporter {

    /**
     * Applies default values to image export options
     * @param options User-provided options
     * @returns Complete options with defaults applied
     */
    private _applyDefaultOptions(options: ImageExportOptions): ImageGenerationOptions {
        return {
            format: options.format ?? 'png',
            scale: Math.abs(options.scale ?? 1.0),
            filename: options.filename
        };
    }

    /**
     * Validates export options and browser support
     * @param options The options to validate
     * @throws Error if options are invalid or format is not supported
     */
    private _validateOptions(options: ImageGenerationOptions): void {
        if (!(options.format in IMAGE_MIME_TYPES)) {
            throw new Error(`Saving '${options.format}' files is not supported`);
        }
    }

    /**
     * Generates image blob from textmode rendering without saving to file
     * @param canvasData The canvas data containing the rendered textmode graphics
     * @param options Export options
     * @returns Promise that resolves to a Blob containing the image data
     */
    public async $generateImageBlob(
        canvas: HTMLCanvasElement,
        options: ImageGenerationOptions
    ): Promise<Blob> {
        const sourceCanvas = canvas;

        const outputCanvas = document.createElement('canvas');
        const ctx = outputCanvas.getContext('2d')!;

        const scaledWidth = Math.round(sourceCanvas.width * options.scale);
        const scaledHeight = Math.round(sourceCanvas.height * options.scale);

        outputCanvas.width = scaledWidth;
        outputCanvas.height = scaledHeight;

        // Draw the source canvas scaled onto the output canvas
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, scaledWidth, scaledHeight);
        ctx.drawImage(
            sourceCanvas,
            0, 0, sourceCanvas.width, sourceCanvas.height,
            0, 0, scaledWidth, scaledHeight
        );

        // Generate image blob
        const imageBlob = await new Promise<Blob>((resolve, reject) => {
            outputCanvas.toBlob((blob: Blob | null) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error(`Failed to generate ${options.format.toUpperCase()} blob`));
                }
            }, IMAGE_MIME_TYPES[options.format]);
        });

        return imageBlob;
    }

    /**
     * Exports image to a downloadable file
     * @param canvas The canvas data containing the rendered textmode graphics
     * @param options Export options
     */
    public async $saveImage(canvas: HTMLCanvasElement, options: ImageExportOptions = {}): Promise<void> {
        const _options = this._applyDefaultOptions(options);
        this._validateOptions(_options);

        const imageBlob = await this.$generateImageBlob(canvas, _options);

        new FileHandler().$downloadFile(imageBlob, _options.filename);
    }

    /**
     * Copies the generated image to the clipboard using the modern Clipboard API
     * @param canvas The source canvas element
     * @param options Export options
     */
    public async $copyImageToClipboard(canvas: HTMLCanvasElement, options: ImageExportOptions = {}): Promise<void> {
        if (typeof navigator === 'undefined' || !navigator.clipboard || typeof navigator.clipboard.write !== 'function') {
            throw new Error('Clipboard API is not available in this environment');
        }

        const _options = this._applyDefaultOptions(options);
        this._validateOptions(_options);

        const imageBlob = await this.$generateImageBlob(canvas, _options);

        const clipboardItem = new ClipboardItem({ [IMAGE_MIME_TYPES[_options.format]]: imageBlob });
        await navigator.clipboard.write([clipboardItem]);
    }
}
