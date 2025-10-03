import type { SVGExportOptions } from './types';
import type { Textmodifier } from 'textmode.js';
/**
 * Main SVG exporter for the textmode.js library.
 * Orchestrates the SVG export process by coordinating data extraction,
 * content generation, and file handling.
 */
export declare class SVGExporter {
    /**
     * Applies default values to SVG export options
     * @param options User-provided options
     * @returns Complete options with defaults applied
     */
    private _applyDefaultOptions;
    /**
     * Generates SVG content from textmode rendering data without saving to file
     * @param textmodifier The Textmodifier instance to extract data from
     * @param options Export options
     * @returns SVG content as string
     */
    $generateSVG(textmodifier: Textmodifier, options?: SVGExportOptions): string;
    /**
     * Exports SVG content to a downloadable file
     * @param textmodifier The Textmodifier instance to extract data from
     * @param options Export options
     */
    $saveSVG(textmodifier: Textmodifier, options?: SVGExportOptions): void;
}
//# sourceMappingURL=SVGExporter.d.ts.map