import type { TXTExportOptions, TXTGenerationOptions } from './types';
import type { Textmodifier } from 'textmode.js';
import { DataExtractor, FileHandler } from '../base';

/**
 * TXT exporter for the textmode.js library.
 * Orchestrates the TXT export process by coordinating data extraction,
 * content generation, and file handling.
 */
export class TXTExporter {
    /**
     * Applies default values to TXT export options
     * @param options User-provided options
     * @returns Complete options with defaults applied
     */
    private _applyDefaultOptions(options: TXTExportOptions): TXTGenerationOptions {
        return {
            preserveTrailingSpaces: options.preserveTrailingSpaces ?? false,
            emptyCharacter: options.emptyCharacter ?? ' ',
            filename: options.filename
        };
    }

    /**
     * Generates TXT content from textmode rendering data
     * @param textmodifier The Textmodifier instance to extract data from
     * @param options Export options with defaults applied
     * @returns TXT content as string
     */
    private _createTXTContent(textmodifier: Textmodifier, options: TXTGenerationOptions): string {
        const dataExtractor = new DataExtractor();

        console.log(textmodifier);

        let framebufferData = dataExtractor.$extractFramebufferData(textmodifier.layers.base.drawFramebuffer);

        const characterGrid: string[][] = [];
        let idx = 0;

        for (let y = 0; y < textmodifier.grid.rows; y++) {
            const row: string[] = [];

            for (let x = 0; x < textmodifier.grid.cols; x++) {
                const pixelIdx = idx * 4;

                const charIndex = dataExtractor.$getCharacterIndex(
                    framebufferData.characterPixels,
                    pixelIdx
                );

                const character = textmodifier.font.characters[charIndex]?.character || options.emptyCharacter;
                row.push(character);

                idx++;
            }

            characterGrid.push(row);
        }

        const lines: string[] = [];

        for (const row of characterGrid) {
            let line = row.join('');

            if (!options.preserveTrailingSpaces) {
                line = line.replace(/\s+$/, '');
            }

            lines.push(line);
        }

        return lines.join('\n');
    }

    /**
     * Generates TXT content from textmode rendering data without saving to file
     * @param textmodifier The Textmodifier instance to extract data from
     * @param options Export options
     * @returns TXT content as string
     */
    public $generateTXT(textmodifier: Textmodifier, options: TXTExportOptions = {}): string {
        return this._createTXTContent(textmodifier, this._applyDefaultOptions(options));
    }

    /**
     * Exports TXT content to a downloadable file
     * @param textmodifier The Textmodifier instance to extract data from
     * @param options Export options
     */
    public $saveTXT(textmodifier: Textmodifier, options: TXTExportOptions = {}): void {
        const generationOptions = this._applyDefaultOptions(options);
        const txtContent = this._createTXTContent(textmodifier, generationOptions);

        const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
        new FileHandler().$downloadFile(blob, generationOptions.filename);
    }
}
