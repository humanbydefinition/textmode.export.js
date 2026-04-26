type ResolvableGlyph = {
	character: string;
	color: [number, number, number];
	glyphData?: unknown;
};

type ResolvableFont = {
	characters: readonly ResolvableGlyph[];
};

const resolverCache = new WeakMap<ResolvableFont, Map<number, ResolvableGlyph>>();

/**
 * Converts a normalized glyph identity color into the framebuffer value used by textmode.js.
 *
 * @param color Normalized RGB glyph identity color
 * @returns Encoded framebuffer character value
 */
export function getEncodedGlyphValueFromColor(color: [number, number, number]): number {
	const r = Math.round(color[0] * 255);
	const g = Math.round(color[1] * 255);
	return r + (g << 8);
}

/**
 * Resolves a glyph from the raw encoded framebuffer character value.
 *
 * The framebuffer stores textmode.js glyph identity colors, not a stable array index.
 * This resolver builds the inverse map from `font.characters[*].color` so JSON, SVG,
 * and TXT exports all decode glyph identity through the same contract.
 *
 * @param font Textmode font or tileset with character metadata
 * @param encodedValue Raw encoded framebuffer character value
 * @returns Matching glyph, or undefined if the value does not map to a known glyph
 */
export function resolveGlyphByEncodedValue(font: ResolvableFont, encodedValue: number): ResolvableGlyph | undefined {
	let resolver = resolverCache.get(font);

	if (!resolver) {
		resolver = new Map<number, ResolvableGlyph>();
		for (const glyph of font.characters) {
			resolver.set(getEncodedGlyphValueFromColor(glyph.color), glyph);
		}
		resolverCache.set(font, resolver);
	}

	return resolver.get(encodedValue);
}
