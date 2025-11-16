import type { TextmodeFramebuffer } from 'textmode.js';
import type { FramebufferData } from '../svg/types';

/**
 * Base class for data extraction from textmode framebuffers.
 * Provides common functionality shared between different export formats.
 */
export class DataExtractor {
    /**
     * Extracts pixel data from all framebuffers needed for export
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
     * Gets character index from character framebuffer pixels
     * @param characterPixels Character framebuffer pixel data
     * @param pixelIndex Index in the pixel array (already multiplied by 4 for RGBA)
     * @param charactersLength Total number of available characters
     * @returns Character index
     */
    public $getCharacterIndex(characterPixels: Uint8Array, pixelIndex: number): number {
        // Get character index from red and green channels
        const r = characterPixels[pixelIndex];
        const g = characterPixels[pixelIndex + 1];
        return r + (g << 8);
    }
}
