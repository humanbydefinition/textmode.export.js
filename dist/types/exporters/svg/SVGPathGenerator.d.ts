import type { TextmodeFont } from 'textmode.js';
/**
 * Glyph data structure for parsed glyphs.
 * Mirrors the shape used by textmode.js internally for Typr glyph data.
 */
interface GlyphData {
    /** Number of contours (-1 for composite glyphs) */
    noc: number;
    /** Bounding box coordinates */
    xMin: number;
    yMin: number;
    xMax: number;
    yMax: number;
    /** End points of each contour */
    endPts: number[];
    /** Point flags indicating curve/line segments */
    flags: number[];
    /** X coordinates of all points */
    xs: number[];
    /** Y coordinates of all points */
    ys: number[];
    /** Composite glyph parts (for composite glyphs) */
    parts?: unknown[];
    /** Advance width of the glyph */
    advanceWidth: number;
}
/**
 * Handles SVG path generation for character glyphs.
 * This class is responsible for converting font glyph data into SVG path strings.
 */
export declare class SVGPathGenerator {
    /**
     * Creates a path object for a glyph
     * @param fontData Font data object
     * @param glyphData Glyph data from font
     * @param x X position
     * @param y Y position
     * @param fontSize Font size
     * @returns Path object with bounding box and SVG methods
     */
    private _createGlyphPath;
    /**
     * Converts glyph data to SVG path string
     * @param glyphData Glyph data from font
     * @param x X position
     * @param y Y position
     * @param scale Scale factor
     * @returns SVG path data string
     */
    private _glyphToSVGPath;
    /**
     * Generates an SVG path for a character glyph
     * @param character The character to generate a path for
     * @param fontData The font data object
     * @param x X position
     * @param y Y position
     * @param fontSize Font size
     * @returns Path object with SVG generation methods
     */
    private _generateCharacterPath;
    /**
     * Generates SVG path data for a character with positioning calculations
     * @param character The character to render
     * @param fontData The font data
     * @param cellX Cell X position
     * @param cellY Cell Y position
     * @param cellWidth Cell width
     * @param cellHeight Cell height
     * @param fontSize Font size
     * @param advanceWidth Character advance width
     * @returns SVG path data string or null if generation fails
     */
    $generatePositionedCharacterPath(character: string, font: TextmodeFont, cellX: number, cellY: number, cellWidth: number, cellHeight: number, fontSize: number, glyphData: GlyphData | null): string | null;
}
export {};
//# sourceMappingURL=SVGPathGenerator.d.ts.map