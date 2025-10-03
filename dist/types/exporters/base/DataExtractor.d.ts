import type { TextmodeFramebuffer } from 'textmode.js';
import type { FramebufferData } from '../svg/types';
/**
 * Base class for data extraction from textmode framebuffers.
 * Provides common functionality shared between different export formats.
 */
export declare class DataExtractor {
    /**
     * Extracts pixel data from all framebuffers needed for export
     * @param framebuffer The conversion pipeline containing framebuffers
     * @returns Object containing all pixel data arrays
     */
    $extractFramebufferData(framebuffer: TextmodeFramebuffer): FramebufferData;
    /**
     * Gets character index from character framebuffer pixels
     * @param characterPixels Character framebuffer pixel data
     * @param pixelIndex Index in the pixel array (already multiplied by 4 for RGBA)
     * @param charactersLength Total number of available characters
     * @returns Character index
     */
    $getCharacterIndex(characterPixels: Uint8Array, pixelIndex: number): number;
}
//# sourceMappingURL=DataExtractor.d.ts.map