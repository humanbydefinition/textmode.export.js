import type { SVGExportOptions, SVGGenerationOptions } from './types';
import { SVGDataExtractor } from './SVGDataExtractor';
import { SVGContentGenerator } from './SVGContentGenerator';
import type { Textmodifier } from 'textmode.js';
import { FileHandler } from '../base';

/**
 * Main SVG exporter for the textmode.js library.
 * Orchestrates the SVG export process by coordinating data extraction,
 * content generation, and file handling.
 */
export class SVGExporter {

    /**
     * Applies default values to SVG export options
     * @param options User-provided options
     * @returns Complete options with defaults applied
     */
    private _applyDefaultOptions(options: SVGExportOptions): SVGGenerationOptions {
        return {
            includeBackgroundRectangles: options.includeBackgroundRectangles ?? true,
            drawMode: options.drawMode ?? 'fill',
            strokeWidth: options.strokeWidth ?? 1.0,
            filename: options.filename
        };
    }

    /**
     * Generates SVG content from textmode rendering data without saving to file
     * @param textmodifier The Textmodifier instance to extract data from
     * @param options Export options
     * @returns SVG content as string
     */
    public $generateSVG(
        textmodifier: Textmodifier,
        options: SVGExportOptions = {}
    ): string {

        const dataExtractor = new SVGDataExtractor();
        const contentGenerator = new SVGContentGenerator();

        // Extract SVG cell data
        const cellDataArray = dataExtractor.$extractSVGCellData(
            dataExtractor.$extractFramebufferData(textmodifier.layers.base.drawFramebuffer),
            textmodifier.grid,
        );

        // Generate SVG content
        const svgContent = contentGenerator.$generateSVGContent(
            cellDataArray,
            textmodifier.grid,
            textmodifier.font,
            this._applyDefaultOptions(options)
        );

        return contentGenerator.$optimizeSVGContent(svgContent);
    }

    /**
     * Exports SVG content to a downloadable file
     * @param textmodifier The Textmodifier instance to extract data from
     * @param options Export options
     */
    public $saveSVG(textmodifier: Textmodifier, options: SVGExportOptions = {}): void {
        new FileHandler().$downloadFile(
            new Blob([this.$generateSVG(textmodifier, options)], { type: 'image/svg+xml;charset=utf-8' }),
            options.filename
        );
    }
}
