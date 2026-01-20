import type { GlyphPath } from './types';
import type { loadables } from 'textmode.js';

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
 * Minimal TyprFont interface required by the SVG path generator.
 * Matches the relevant subset of the textmode.js Typr font structure.
 */
interface TyprFont {
    head: {
        unitsPerEm: number;
    };
}

/**
 * Handles SVG path generation for character glyphs.
 * This class is responsible for converting font glyph data into SVG path strings.
 */
export class SVGPathGenerator {
    /**
     * Creates a path object for a glyph
     * @param fontData Font data object
     * @param glyphData Glyph data from font
     * @param x X position
     * @param y Y position
     * @param fontSize Font size
     * @returns Path object with bounding box and SVG methods
     */
    private _createGlyphPath(
        fontData: TyprFont,
        glyphData: GlyphData,
        x: number,
        y: number,
        fontSize: number
    ): GlyphPath {
        const scale = fontSize / fontData.head.unitsPerEm;

        return {
            getBoundingBox: () => {
                return {
                    x1: x + (glyphData.xMin * scale),
                    y1: y + (-glyphData.yMax * scale),
                    x2: x + (glyphData.xMax * scale),
                    y2: y + (-glyphData.yMin * scale)
                };
            },
            toSVG: () => {
                return this._glyphToSVGPath(glyphData, x, y, scale);
            }
        };
    }

    /**
     * Converts glyph data to SVG path string
     * @param glyphData Glyph data from font
     * @param x X position
     * @param y Y position
     * @param scale Scale factor
     * @returns SVG path data string
     */
    private _glyphToSVGPath(glyphData: GlyphData, x: number, y: number, scale: number): string {
        if (!glyphData || !glyphData.xs) return "";

        const { xs, ys, endPts, flags } = glyphData;
        if (!xs || !ys || !endPts || !flags) return "";

        let pathData = "";
        let startIndex = 0;

        for (let i = 0; i < endPts.length; i++) {
            const endPt = endPts[i];
            if (endPt < startIndex) continue;

            if (endPt >= startIndex) {
                const firstX = x + (xs[startIndex] * scale);
                const firstY = y - (ys[startIndex] * scale);
                pathData += `M${firstX.toFixed(2)},${firstY.toFixed(2)}`;

                let j = startIndex + 1;
                while (j <= endPt) {
                    const isOnCurve = (flags[j] & 1) !== 0;

                    if (isOnCurve) {
                        const currX = x + (xs[j] * scale);
                        const currY = y - (ys[j] * scale);
                        pathData += `L${currX.toFixed(2)},${currY.toFixed(2)}`;
                        j++;
                    } else {
                        const ctrlX = x + (xs[j] * scale);
                        const ctrlY = y - (ys[j] * scale);

                        let nextJ = (j + 1 > endPt) ? startIndex : j + 1;
                        let nextIsOnCurve = (flags[nextJ] & 1) !== 0;

                        if (nextIsOnCurve) {
                            const nextX = x + (xs[nextJ] * scale);
                            const nextY = y - (ys[nextJ] * scale);
                            pathData += `Q${ctrlX.toFixed(2)},${ctrlY.toFixed(2)} ${nextX.toFixed(2)},${nextY.toFixed(2)}`;
                            j = nextJ + 1;
                        } else {
                            const nextX = x + (xs[nextJ] * scale);
                            const nextY = y - (ys[nextJ] * scale);
                            const impliedX = (ctrlX + nextX) / 2;
                            const impliedY = (ctrlY + nextY) / 2;
                            pathData += `Q${ctrlX.toFixed(2)},${ctrlY.toFixed(2)} ${impliedX.toFixed(2)},${impliedY.toFixed(2)}`;
                            j = nextJ;
                        }
                    }
                }
                pathData += "Z";
            }
            startIndex = endPt + 1;
        }
        return pathData;
    }

    /**
     * Generates an SVG path for a character glyph
     * @param character The character to generate a path for
     * @param fontData The font data object
     * @param x X position
     * @param y Y position
     * @param fontSize Font size
     * @returns Path object with SVG generation methods
     */
    private _generateCharacterPath(
        character: string,
        font: loadables.TextmodeFont,
        x: number,
        y: number,
        fontSize: number
    ): GlyphPath | null {
        const charData = font.characterMap.get(character);
        const glyphData = charData?.glyphData;

        if (!glyphData) {
            return null;
        }

        return this._createGlyphPath(font.font, glyphData, x, y, fontSize);
    }

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
    public $generatePositionedCharacterPath(
        character: string,
        font: loadables.TextmodeFont,
        cellX: number,
        cellY: number,
        cellWidth: number,
        cellHeight: number,
        fontSize: number,
        glyphData: GlyphData | null
    ): string | null {
        if (!glyphData) {
            return null;
        }

        const fontData = font.font;
        // Center the glyph in the cell
        const scale = fontSize / fontData.head.unitsPerEm;
        const scaledGlyphWidth = glyphData.advanceWidth * scale;
        const xOffset = cellX + (cellWidth - scaledGlyphWidth) / 2;
        const yOffset = cellY + (cellHeight + fontSize * 0.7) / 2;

        // Generate the character path
        const glyphPath = this._generateCharacterPath(character, font, xOffset, yOffset, fontSize);
        if (!glyphPath) {
            return null;
        }

        // Get the SVG path data
        const pathData = glyphPath.toSVG();

        return pathData || null;
    }
}
