import type { TextmodePluginAPI, Textmodifier } from 'textmode.js';
import type { GIFExportOptions } from './types';
/**
 * Main GIF exporter for the textmode.js library.
 * Orchestrates the GIF export process by coordinating canvas capture,
 * frame processing, and file handling.
 */
export declare class GIFExporter {
    private readonly _recorder;
    private readonly _textmodifier;
    private readonly _registerPostDrawHook;
    /**
     * Creates an instance of GIFExporter.
     * @param textmodifier The Textmodifier instance to capture frames from
     * @param registerPostDrawHook Function to register post-draw hooks
     */
    constructor(textmodifier: Textmodifier, registerPostDrawHook: TextmodePluginAPI['registerPostDrawHook']);
    /**
     * Captures frames and saves them as a GIF file
     * @param options Export options
     */
    $saveGIF(options?: GIFExportOptions): Promise<void>;
    /**
     * Applies default values to the provided export options
     * @param options User-provided options
     * @returns Complete options with defaults applied
     */
    private _applyDefaultOptions;
}
//# sourceMappingURL=GIFExporter.d.ts.map