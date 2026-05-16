import { describe, expect, it } from 'vitest';
import type { Textmodifier } from 'textmode.js';
import type { TextmodeLayer } from 'textmode.js';
import { TXTExporter } from './TXTExporter';

function createLayerMock(characters: string): TextmodeLayer {
	const glyphs = [...characters].map((character) => ({
		character,
		color: [character.charCodeAt(0) / 255, 0, 0] as [number, number, number],
	}));
	const characterPixels = Uint8Array.from(glyphs.flatMap(({ character }) => [character.charCodeAt(0), 0, 0, 0]));
	const colorPixels = Uint8Array.from(glyphs.flatMap(() => [255, 255, 255, 255]));

	return {
		grid: {
			cols: glyphs.length,
			rows: 1,
			cellWidth: 8,
			cellHeight: 16,
			width: glyphs.length * 8,
			height: 16,
		},
		font: {
			characters: glyphs,
		},
		drawFramebuffer: {
			readPixels: (attachment: number) => {
				if (attachment === 0) {
					return characterPixels;
				}
				if (attachment === 1 || attachment === 2) {
					return colorPixels;
				}
				throw new Error(`Unexpected attachment ${attachment}`);
			},
		},
	} as unknown as TextmodeLayer;
}

function createTextmodifierMock(): Textmodifier & { testLayer: TextmodeLayer } {
	const baseLayer = createLayerMock('AB');
	const userLayer = createLayerMock('XY');

	return {
		layers: {
			base: baseLayer,
			all: [userLayer],
		},
		testLayer: userLayer,
	} as unknown as Textmodifier & { testLayer: TextmodeLayer };
}

describe('TXTExporter', () => {
	it('exports the base layer by default', () => {
		expect(new TXTExporter().$generateTXT(createTextmodifierMock())).toBe('AB');
	});

	it('exports a selected user layer when provided', () => {
		const textmodifier = createTextmodifierMock();
		expect(new TXTExporter().$generateTXT(textmodifier, { layer: textmodifier.testLayer })).toBe('XY');
	});
});
