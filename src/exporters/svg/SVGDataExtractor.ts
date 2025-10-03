import type { FramebufferData, SVGCellData, CellTransform, CellPosition } from './types';
import { DataExtractor } from '../base';
import type { TextmodeGrid } from 'textmode.js';
import { pixelsToRGBA } from '../../utils/pixels';

/**
 * Extracts and processes data from framebuffers for SVG generation.
 * This class handles the conversion of raw pixel data into structured data objects.
 */
export class SVGDataExtractor extends DataExtractor {

    /**
     * Extracts transform data from transform pixels
     * @param transformPixels Transform framebuffer pixels
     * @param rotationPixels Rotation framebuffer pixels
     * @param pixelIndex Pixel index in the array
     * @returns Transform data object
     */
    private _extractTransformData(
        transformPixels: Uint8Array,
        rotationPixels: Uint8Array,
        pixelIndex: number
    ): CellTransform {
        // Extract transform data from transform framebuffer
        const transformR = transformPixels[pixelIndex];
        const transformG = transformPixels[pixelIndex + 1];
        const transformB = transformPixels[pixelIndex + 2];

        // R channel for inversion, G channel for horizontal flip, B channel for vertical flip
        const isInverted = transformR === 255;
        const flipHorizontal = transformG === 255;
        const flipVertical = transformB === 255;

        // Calculate rotation angle from rotation framebuffer
        const rotationRed = rotationPixels[pixelIndex];
        const rotationGreen = rotationPixels[pixelIndex + 1];

        // Decode using two-channel precision
        const scaledAngle = rotationRed + (rotationGreen / 255);
        const rotation = Math.round(((scaledAngle * 360) / 255) * 100) / 100;

        return {
            isInverted,
            flipHorizontal,
            flipVertical,
            rotation
        };
    }

    /**
     * Calculates cell position information
     * @param x Grid X coordinate
     * @param y Grid Y coordinate
     * @param gridInfo Grid information
     * @returns Position data object
     */
    private _calculateCellPosition(x: number, y: number, gridInfo: TextmodeGrid): CellPosition {
        return {
            x,
            y,
            cellX: x * gridInfo.cellWidth,
            cellY: y * gridInfo.cellHeight
        };
    }

    /**
     * Processes all grid cells and extracts SVG cell data
     * @param framebufferData Raw pixel data from framebuffers
     * @param grid Grid information
     * @param font Font information
     * @returns Array of SVG cell data objects
     */
    public $extractSVGCellData(
        framebufferData: FramebufferData,
        grid: TextmodeGrid,
    ): SVGCellData[] {
        const cellData: SVGCellData[] = [];
        let idx = 0;

        for (let y = 0; y < grid.rows; y++) {
            for (let x = 0; x < grid.cols; x++) {
                const pixelIdx = idx * 4;

                // Use shared method to get character index
                const charIndex = this.$getCharacterIndex(
                    framebufferData.characterPixels,
                    pixelIdx
                );

                // Extract colors using shared method
                let primaryColor = pixelsToRGBA(framebufferData.primaryColorPixels, pixelIdx);
                let secondaryColor = pixelsToRGBA(framebufferData.secondaryColorPixels, pixelIdx);

                // Extract transform data
                const transform = this._extractTransformData(
                    framebufferData.transformPixels,
                    framebufferData.rotationPixels,
                    pixelIdx
                );

                // If inverted, swap primary and secondary colors
                if (transform.isInverted) {
                    const tempColor = primaryColor;
                    primaryColor = secondaryColor;
                    secondaryColor = tempColor;
                }

                // Calculate position
                const position = this._calculateCellPosition(x, y, grid);

                cellData.push({
                    charIndex,
                    primaryColor,
                    secondaryColor,
                    transform,
                    position
                });

                idx++;
            }
        }

        return cellData;
    }
}
