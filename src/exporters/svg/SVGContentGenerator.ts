import type { 
    SVGCellData, 
    SVGGenerationOptions
} from './types';
import { SVGPathGenerator } from './SVGPathGenerator';
import type { TextmodeGrid, loadables } from 'textmode.js';

/**
 * Generates SVG content and markup from processed cell data.
 * This class handles the creation of SVG elements, groups, and styling.
 */
export class SVGContentGenerator {
    private _pathGenerator: SVGPathGenerator;

    constructor() {
        this._pathGenerator = new SVGPathGenerator();
    }

    /**
     * Generates the SVG header with metadata
     * @param gridInfo Grid dimensions
     * @returns SVG header string
     */
    public $generateSVGHeader(gridInfo: TextmodeGrid): string {
        const { width, height } = gridInfo;
        return `<?xml version="1.0" encoding="UTF-8"?><svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg"><title>textmode.js sketch</title>`;
    }

    /**
     * Generates the SVG footer
     * @returns SVG footer string
     */
    public $generateSVGFooter(): string {
        return '</g></svg>';
    }

    /**
     * Generates SVG transform attribute string
     * @param cellData Cell data with transform information
     * @param gridInfo Grid information for center calculations
     * @returns Transform attribute string or empty string
     */
    private _generateTransformAttribute(cellData: SVGCellData, gridInfo: TextmodeGrid): string {
        const { transform, position } = cellData;
        
        if (!transform.flipHorizontal && !transform.flipVertical && !transform.rotation) {
            return '';
        }

        const centerX = position.cellX + gridInfo.cellWidth / 2;
        const centerY = position.cellY + gridInfo.cellHeight / 2;
        const transforms: string[] = [];

        if (transform.flipHorizontal || transform.flipVertical) {
            const sx = transform.flipHorizontal ? -1 : 1;
            const sy = transform.flipVertical ? -1 : 1;
            transforms.push(`translate(${centerX} ${centerY})scale(${sx} ${sy})translate(${-centerX} ${-centerY})`);
        }

        if (transform.rotation) {
            transforms.push(`rotate(${transform.rotation} ${centerX} ${centerY})`);
        }

        return ` transform="${transforms.join(' ')}"`;
    }

    /**
     * Generates background rectangle for a cell
     * @param cellData Cell data
     * @param gridInfo Grid information
     * @param options SVG generation options
     * @returns Background rectangle SVG string or empty string
     */
    private _generateCellBackground(
        cellData: SVGCellData,
        gridInfo: TextmodeGrid,
        options: SVGGenerationOptions
    ): string {
        if (!options.includeBackgroundRectangles || cellData.secondaryColor.a === 0) return '';

        const { position } = cellData;
        const { r, g, b, a } = cellData.secondaryColor;
        const color = `rgba(${r},${g},${b},${a / 255})`;

        return options.drawMode === 'stroke' 
            ? `<rect x="${position.cellX}" y="${position.cellY}" width="${gridInfo.cellWidth}" height="${gridInfo.cellHeight}" stroke="${color}" fill="none" stroke-width="${options.strokeWidth}"/>`
            : `<rect x="${position.cellX}" y="${position.cellY}" width="${gridInfo.cellWidth}" height="${gridInfo.cellHeight}" fill="${color}"/>`;
    }

    /**
     * Generates character path element for a cell
     * @param cellData Cell data
     * @param gridInfo Grid information
     * @param fontInfo Font information
     * @param options SVG generation options
     * @returns Character path SVG string
     */
    private _generateCharacterPath(
        cellData: SVGCellData,
        gridInfo: TextmodeGrid,
        fontInfo: loadables.TextmodeFont,
        options: SVGGenerationOptions
    ): string {
        const character = fontInfo.characters[cellData.charIndex];
        if (!character) return '';

        const pathData = this._pathGenerator.$generatePositionedCharacterPath(
            character.character,
            fontInfo,
            cellData.position.cellX,
            cellData.position.cellY,
            gridInfo.cellWidth,
            gridInfo.cellHeight,
            fontInfo.fontSize,
            character.glyphData
        );

        if (!pathData) return '';

        const { r, g, b, a } = cellData.primaryColor;
        const color = `rgba(${r},${g},${b},${a / 255})`;

        return options.drawMode === 'stroke'
            ? `<path d="${pathData}" stroke="${color}" stroke-width="${options.strokeWidth}" fill="none"/>`
            : `<path d="${pathData}" fill="${color}"/>`;
    }

    /**
     * Generates complete SVG content for a single cell
     * @param cellData Cell data
     * @param gridInfo Grid information
     * @param fontInfo Font information
     * @param options SVG generation options
     * @returns Complete cell SVG content
     */
    public $generateCellContent(
        cellData: SVGCellData,
        gridInfo: TextmodeGrid,
        fontInfo: loadables.TextmodeFont,
        options: SVGGenerationOptions
    ): string {
        const parts: string[] = [];

        // Add background rectangle
        const background = this._generateCellBackground(cellData, gridInfo, options);
        if (background) parts.push(background);

        // Add character path with optional transform
        const path = this._generateCharacterPath(cellData, gridInfo, fontInfo, options);
        if (path) {
            const transformAttr = this._generateTransformAttribute(cellData, gridInfo);
            parts.push(transformAttr ? `<g${transformAttr}>${path}</g>` : path);
        }

        return parts.join('');
    }

    /**
     * Generates the complete SVG content from cell data
     * @param cellDataArray Array of cell data
     * @param grid Grid information
     * @param fontInfo Font information
     * @param options SVG generation options
     * @returns Complete SVG string
     */
    public $generateSVGContent(
        cellDataArray: SVGCellData[],
        grid: TextmodeGrid,
        fontInfo: loadables.TextmodeFont,
        options: SVGGenerationOptions
    ): string {
        const parts = [
            this.$generateSVGHeader(grid),
            '<g id="ascii-cells">'
        ];

        // Add each cell
        for (const cellData of cellDataArray) {
            parts.push(this.$generateCellContent(cellData, grid, fontInfo, options));
        }

        parts.push(this.$generateSVGFooter());
        return parts.join('');
    }

    /**
     * Optimizes SVG content by removing empty elements and unnecessary whitespace
     * @param svgContent Raw SVG content
     * @returns Optimized SVG content
     */
    public $optimizeSVGContent(svgContent: string): string {
        return svgContent
            .replace(/\s+/g, ' ') // Collapse whitespace
            .replace(/> </g, '><'); // Remove spaces between tags
    }
}
