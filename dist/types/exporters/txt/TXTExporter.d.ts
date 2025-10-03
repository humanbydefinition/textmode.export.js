import type { TXTExportOptions } from './types';
import type { Textmodifier } from 'textmode.js';
/**
 * TXT exporter for the textmode.js library.
 * Orchestrates the TXT export process by coordinating data extraction,
 * content generation, and file handling.
 */
export declare class TXTExporter {
    /**
     * Applies default values to TXT export options
     * @param options User-provided options
     * @returns Complete options with defaults applied
     */
    private _applyDefaultOptions;
    /**
     * Generates TXT content from textmode rendering data
     * @param textmodifier The Textmodifier instance to extract data from
     * @param options Export options with defaults applied
     * @returns TXT content as string
     */
    private _createTXTContent;
    /**
     * Generates TXT content from textmode rendering data without saving to file
     * @param textmodifier The Textmodifier instance to extract data from
     * @param options Export options
     * @returns TXT content as string
     */
    $generateTXT(textmodifier: Textmodifier, options?: TXTExportOptions): string;
    /**
     * Exports TXT content to a downloadable file
     * @param textmodifier The Textmodifier instance to extract data from
     * @param options Export options
     */
    $saveTXT(textmodifier: Textmodifier, options?: TXTExportOptions): void;
}
//# sourceMappingURL=TXTExporter.d.ts.map