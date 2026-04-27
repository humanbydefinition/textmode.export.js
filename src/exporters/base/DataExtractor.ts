import type { TextmodeFramebuffer } from 'textmode.js';
import type { FramebufferData } from '../svg/types';

/**
 * Base class for data extraction from textmode framebuffers.
 * Provides common functionality shared between different export formats.
 */
export class DataExtractor {
	/**
	 * Extracts pixel data from all framebuffers needed for export
	 *
	 * @param framebuffer The conversion pipeline containing framebuffers
	 * @returns Object containing all pixel data arrays
	 */
	public $extractFramebufferData(framebuffer: TextmodeFramebuffer): FramebufferData {
		const characterPixels: Uint8Array = framebuffer.readPixels(0);
		const primaryColorPixels: Uint8Array = framebuffer.readPixels(1);
		const secondaryColorPixels: Uint8Array = framebuffer.readPixels(2);

		return { characterPixels, primaryColorPixels, secondaryColorPixels };
	}

	/**
	 * Gets the raw encoded character value from character framebuffer pixels.
	 *
	 * @param characterPixels Character framebuffer pixel data
	 * @param pixelIndex Index in the pixel array (already multiplied by 4 for RGBA)
	 * @returns Raw encoded character value
	 */
	public $getEncodedCharacterValue(characterPixels: Uint8Array, pixelIndex: number): number {
		// Get the raw encoded character value from red and green channels.
		// Consumers must resolve this value according to their output format.
		const r = characterPixels[pixelIndex];
		const g = characterPixels[pixelIndex + 1];
		return r + (g << 8);
	}

	/**
	 * Gets character index from character framebuffer pixels.
	 *
	 * @param characterPixels Character framebuffer pixel data
	 * @param pixelIndex Index in the pixel array (already multiplied by 4 for RGBA)
	 * @returns Raw encoded character value
	 */
	public $getCharacterIndex(characterPixels: Uint8Array, pixelIndex: number): number {
		return this.$getEncodedCharacterValue(characterPixels, pixelIndex);
	}

	/**
	 * Extracts per-cell transform flags from the character framebuffer.
	 *
	 * @param characterPixels Character framebuffer pixel data
	 * @param pixelIndex Index in the pixel array (already multiplied by 4 for RGBA)
	 * @returns Decoded transform flags and rotation
	 */
	public $extractCellTransform(
		characterPixels: Uint8Array,
		pixelIndex: number
	): { isInverted: boolean; flipHorizontal: boolean; flipVertical: boolean; rotation: number } {
		const packedFlags = characterPixels[pixelIndex + 2];
		const rotationNormalized = characterPixels[pixelIndex + 3] / 255;

		return {
			isInverted: (packedFlags & 1) !== 0,
			flipHorizontal: (packedFlags & 2) !== 0,
			flipVertical: (packedFlags & 4) !== 0,
			rotation: Math.round(rotationNormalized * 360 * 100) / 100,
		};
	}
}
