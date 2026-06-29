/**
 * Image-specific type definitions for the textmode.js library.
 */

/**
 * Supported image formats for export.
 */
export type ImageFormat = 'png' | 'jpg' | 'webp';

/**
 * Options for exporting the textmode content to image format.
 *
 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/ImageExportOptions | ImageExportOptions API reference}
 */
export type ImageExportOptions = {
	/**
	 * Target filename without extension. Defaults to an auto-generated value.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/ImageExportOptions#filename | ImageExportOptions.filename API reference}
	 */
	filename?: string;

	/**
	 * The image format to export *(`'png'`, `'jpg'`, or `'webp'`)*. Defaults to `'png'`.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/ImageExportOptions#format | ImageExportOptions.format API reference}
	 */
	format?: 'png' | 'jpg' | 'webp';

	/**
	 * Scale factor for the output image.
	 *
	 * `1.0` = original size, `2.0` = double size, `0.5` = half size.
	 *
	 * Defaults to `1.0`.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/ImageExportOptions#scale | ImageExportOptions.scale API reference}
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
export const IMAGE_MIME_TYPES: Record<ImageFormat, string> = {
	png: 'image/png',
	jpg: 'image/jpeg',
	webp: 'image/webp',
} as const;

/**
 * File extension mapping for image formats.
 */
export const IMAGE_EXTENSIONS: Record<ImageFormat, string> = {
	png: '.png',
	jpg: '.jpg',
	webp: '.webp',
} as const;
