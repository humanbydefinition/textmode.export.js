/**
 * Options for exporting the textmode content to TXT format.
 */
export type TXTExportOptions = {
    /**
     * The filename to save the TXT file as.
     *
     * If not provided, a default filename is used.
     */
    filename?: string;
    /**
     * Whether to preserve trailing spaces on each line.
     *
     * When `false`, trailing spaces are trimmed from each line.
     *
     * Defaults to `false`.
     */
    preserveTrailingSpaces?: boolean;
    /**
     * Character to use for empty cells *(when no character is rendered in it)*.
     * Defaults to space `' '`.
     */
    emptyCharacter?: string;
};
/**
 * Internal options used by TXT generation (with all defaults applied).
 */
export interface TXTGenerationOptions {
    preserveTrailingSpaces: boolean;
    emptyCharacter: string;
    filename?: string;
}
/**
 * Re-export shared types from SVG module that are also used by TXT exporter
 */
export type { FramebufferData } from '../svg/types';
//# sourceMappingURL=types.d.ts.map