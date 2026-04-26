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
	 * Calculates cell position information
	 *
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
			cellY: y * gridInfo.cellHeight,
		};
	}

	/**
	 * Processes all grid cells and extracts SVG cell data
	 *
	 * @param framebufferData Raw pixel data from framebuffers
	 * @param grid Grid information
	 * @returns Array of SVG cell data objects
	 */
	public $extractSVGCellData(framebufferData: FramebufferData, grid: TextmodeGrid): SVGCellData[] {
		const cellData: SVGCellData[] = [];
		let idx = 0;

		for (let y = 0; y < grid.rows; y++) {
			for (let x = 0; x < grid.cols; x++) {
				const pixelIdx = idx * 4;

				// Use shared method to get character index
				const charIndex = this.$getCharacterIndex(framebufferData.characterPixels, pixelIdx);

				// Extract colors using shared method
				let primaryColor = pixelsToRGBA(framebufferData.primaryColorPixels, pixelIdx);
				let secondaryColor = pixelsToRGBA(framebufferData.secondaryColorPixels, pixelIdx);

				// Extract transform data
				const transform = this.$extractCellTransform(
					framebufferData.characterPixels,
					pixelIdx
				) as CellTransform;

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
					position,
				});

				idx++;
			}
		}

		return cellData;
	}
}
