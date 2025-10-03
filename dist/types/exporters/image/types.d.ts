/**
 * Image-specific type definitions for the textmode.js library.
 */
/**
 * Supported image formats for export.
 */
export type ImageFormat = 'png' | 'jpg' | 'webp';
/**
 * Options for exporting the textmode content to image format.
 */
export type ImageExportOptions = {
    /**
     * Target filename without extension. Defaults to an auto-generated value.
     */
    filename?: string;
    /**
     * The image format to export *(`'png'`, `'jpg'`, or `'webp'`)*. Defaults to `'png'`.
     */
    format?: 'png' | 'jpg' | 'webp';
    /**
     * Scale factor for the output image.
     *
     * `1.0` = original size, `2.0` = double size, `0.5` = half size.
     *
     * Defaults to `1.0`.
     */
    scale?: number;
};
/**
 * Internal options used by image generation (with all defaults applied).
 */
export interface ImageGenerationOptions {
    filename?: string;
    format: ImageFormat;
    scale: number;
}
/**
 * MIME type mapping for image formats.
 */
export declare const IMAGE_MIME_TYPES: Record<ImageFormat, string>;
/**
 * File extension mapping for image formats.
 */
export declare const IMAGE_EXTENSIONS: Record<ImageFormat, string>;
//# sourceMappingURL=types.d.ts.map