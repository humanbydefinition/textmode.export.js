import type { TextmodeGrid } from 'textmode.js';
import type { TextmodeFont, TextmodeTileset } from 'textmode.js';
import { DataExtractor, resolveGlyphByEncodedValue, type ResolvedLayerExportTarget } from '../base';
import { pixelsToRGBA } from '../../utils/pixels';
import type { JSONCellData } from './types';

/**
 * Extracts structured cell data from the base textmode layer for JSON export.
 */
export class JSONDataExtractor extends DataExtractor {
	/**
	 * Extracts all base-layer cell data needed for JSON export.
	 *
	 * @param target The resolved layer target to extract data from
	 * @returns Row-major cell data for the current base layer
	 */
	public $extractCellData(target: ResolvedLayerExportTarget): JSONCellData[] {
		const framebufferData = this.$extractFramebufferData(target.drawFramebuffer);
		const cells: JSONCellData[] = [];
		const grid: TextmodeGrid = target.grid;
		const font: TextmodeFont | TextmodeTileset = target.font;
		let idx = 0;

		for (let y = 0; y < grid.rows; y++) {
			for (let x = 0; x < grid.cols; x++) {
				const pixelIdx = idx * 4;
				const encodedCharacterValue = this.$getEncodedCharacterValue(framebufferData.characterPixels, pixelIdx);
				const transform = this.$extractCellTransform(framebufferData.characterPixels, pixelIdx);
				const character = resolveGlyphByEncodedValue(font, encodedCharacterValue)?.character ?? ' ';

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
