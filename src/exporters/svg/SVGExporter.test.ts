// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest';
import type { Textmodifier } from 'textmode.js';
import type { TextmodeLayer } from 'textmode.js';
import { SVGExporter } from './SVGExporter';

function createTextmodifierMock(): Textmodifier & { testLayer: TextmodeLayer } {
	// textmode.js stores glyph identity colors in the framebuffer.
	// The exporter resolves these encoded values through font.characters[*].color.
	const characterPixels = Uint8Array.from([
		// Row 0: 'A' at x=0, 'B' at x=1
		1,
		0,
		0,
		0, // encoded color for 'A'
		2,
		0,
		0,
		0, // encoded color for 'B'
	]);
	const primaryColorPixels = Uint8Array.from([255, 0, 0, 255, 0, 255, 0, 255]);
	const secondaryColorPixels = Uint8Array.from([0, 0, 0, 255, 0, 0, 255, 128]);
	const userCharacterPixels = Uint8Array.from([2, 0, 0, 0, 1, 0, 0, 0]);
	const userPrimaryColorPixels = Uint8Array.from([10, 20, 30, 255, 40, 50, 60, 255]);
	const userSecondaryColorPixels = Uint8Array.from([70, 80, 90, 255, 100, 110, 120, 255]);

	// Minimal glyph data for SVG path generation
	const glyphDataA = {
		noc: 1,
		xMin: 0,
		yMin: 0,
		xMax: 500,
		yMax: 700,
		endPts: [3],
		flags: [1, 1, 1, 1],
		xs: [0, 500, 500, 0],
		ys: [0, 0, 700, 700],
		advanceWidth: 500,
	};

	const glyphDataB = {
		noc: 1,
		xMin: 0,
		yMin: 0,
		xMax: 250,
		yMax: 700,
		endPts: [3],
		flags: [1, 1, 1, 1],
		xs: [0, 250, 250, 0],
		ys: [0, 0, 700, 700],
		advanceWidth: 250,
	};

	const grid = {
		cols: 2,
		rows: 1,
		cellWidth: 8,
		cellHeight: 16,
		width: 16,
		height: 16,
	};
	const font = {
		characters: [
			{ character: 'A', color: [1 / 255, 0, 0], glyphData: glyphDataA },
			{ character: 'B', color: [2 / 255, 0, 0], glyphData: glyphDataB },
		],
		characterMap: new Map([
			['A', { character: 'A', color: [1 / 255, 0, 0], glyphData: glyphDataA }],
			['B', { character: 'B', color: [2 / 255, 0, 0], glyphData: glyphDataB }],
		]),
		fontSize: 16,
		font: {
			head: { unitsPerEm: 1000 },
			hhea: { ascender: 800 },
		},
	};
	const createLayer = (
		layerCharacterPixels: Uint8Array,
		layerPrimaryColorPixels: Uint8Array,
		layerSecondaryColorPixels: Uint8Array
	): TextmodeLayer =>
		({
			grid,
			font,
			drawFramebuffer: {
				readPixels: (attachment: number) => {
					switch (attachment) {
						case 0:
							return layerCharacterPixels;
						case 1:
							return layerPrimaryColorPixels;
						case 2:
							return layerSecondaryColorPixels;
						default:
							throw new Error(`Unexpected attachment ${attachment}`);
					}
				},
			},
		}) as unknown as TextmodeLayer;

	const baseLayer = createLayer(characterPixels, primaryColorPixels, secondaryColorPixels);
	const userLayer = createLayer(userCharacterPixels, userPrimaryColorPixels, userSecondaryColorPixels);

	return {
		grid: {
			cols: 2,
			rows: 1,
			cellWidth: 8,
			cellHeight: 16,
			width: 16,
			height: 16,
		},
		font,
		layers: {
			base: baseLayer,
			all: [userLayer],
		},
		testLayer: userLayer,
	} as unknown as Textmodifier & { testLayer: TextmodeLayer };
}

describe('SVGExporter', () => {
	it('generates an SVG containing the correct characters', () => {
		const exporter = new SVGExporter();
		const svg = exporter.$generateSVG(createTextmodifierMock());

		// Basic structure checks
		expect(svg).toContain('<?xml version="1.0"');
		expect(svg).toContain('<svg');
		expect(svg).toContain('</svg>');

		// Both cells should produce path data (two <path> elements)
		const pathMatches = svg.match(/<path/g);
		expect(pathMatches).not.toBeNull();
		expect(pathMatches!.length).toBe(2);

		// Both cells should produce background rectangles
		const rectMatches = svg.match(/<rect/g);
		expect(rectMatches).not.toBeNull();
		expect(rectMatches!.length).toBe(2);

		// The SVG exporter resolves encoded framebuffer values through glyph colors.
		// Value 1 must use glyph A at x=0, and value 2 must use glyph B centered at x=10.
		expect(svg).toContain('M0.00,12.80');
		expect(svg).toContain('M10.00,12.80');
	});

	it('includes background rectangles by default', () => {
		const exporter = new SVGExporter();
		const svg = exporter.$generateSVG(createTextmodifierMock());
		expect(svg).toContain('<rect');
	});

	it('omits background rectangles when disabled', () => {
		const exporter = new SVGExporter();
		const svg = exporter.$generateSVG(createTextmodifierMock(), {
			includeBackgroundRectangles: false,
		});
		expect(svg).not.toContain('<rect');
	});

	it('switches to stroke mode when configured', () => {
		const exporter = new SVGExporter();
		const svg = exporter.$generateSVG(createTextmodifierMock(), {
			drawMode: 'stroke',
			strokeWidth: 2.5,
		});
		expect(svg).toContain('stroke-width="2.5"');
		expect(svg).toContain('fill="none"');
	});

	it('generates SVG from a selected user layer', () => {
		const exporter = new SVGExporter();
		const textmodifier = createTextmodifierMock();
		const svg = exporter.$generateSVG(textmodifier, {
			layer: textmodifier.testLayer,
			includeBackgroundRectangles: false,
		});

		expect(svg).toContain('M2.00,12.80');
		expect(svg).toContain('M8.00,12.80');
	});

	it('triggers a download when saving', () => {
		const exporter = new SVGExporter();
		const createObjectURL = vi.fn(() => 'blob:svg-export');
		const revokeObjectURL = vi.fn();
		vi.stubGlobal('URL', { createObjectURL, revokeObjectURL });

		const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
		const appendSpy = vi.spyOn(document.body, 'appendChild');

		exporter.$saveSVG(createTextmodifierMock(), { filename: 'test.svg' });

		expect(clickSpy).toHaveBeenCalledTimes(1);
		expect(createObjectURL).toHaveBeenCalledTimes(1);
		expect(revokeObjectURL).toHaveBeenCalledWith('blob:svg-export');

		const anchor = appendSpy.mock.calls[0]?.[0] as HTMLAnchorElement;
		expect(anchor.download).toBe('test.svg');
	});
});
