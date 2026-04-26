import type { Textmodifier } from 'textmode.js';
import { DataExtractor } from '../base';
import { pixelsToRGBA } from '../../utils/pixels';
import type { JSONCellData } from './types';

/**
 * Extracts structured cell data from the base textmode layer for JSON export.
 */
export class JSONDataExtractor extends DataExtractor {
	/**
	 * Extracts all base-layer cell data needed for JSON export.
	 *
	 * @param textmodifier The Textmodifier instance to extract data from
	 * @returns Row-major cell data for the current base layer
	 */
	public $extractCellData(textmodifier: Textmodifier): JSONCellData[] {
		const drawFramebuffer = textmodifier.layers.base.drawFramebuffer!;
		const framebufferData = this.$extractFramebufferData(drawFramebuffer);
		const cells: JSONCellData[] = [];
		let idx = 0;

		for (let y = 0; y < textmodifier.grid!.rows; y++) {
			for (let x = 0; x < textmodifier.grid!.cols; x++) {
				const pixelIdx = idx * 4;
				const charIndex = this.$getCharacterIndex(framebufferData.characterPixels, pixelIdx);
				const transform = this.$extractCellTransform(framebufferData.characterPixels, pixelIdx);
				const character = textmodifier.font.characters[charIndex]?.character ?? ' ';

				cells.push({
					x,
					y,
					character,
					foreground: pixelsToRGBA(framebufferData.primaryColorPixels, pixelIdx),
					background: pixelsToRGBA(framebufferData.secondaryColorPixels, pixelIdx),
					transform: {
						invert: transform.isInverted,
						flipX: transform.flipHorizontal,
						flipY: transform.flipVertical,
						rotation: transform.rotation,
					},
				});

				idx++;
			}
		}

		return cells;
	}
}
