import type { TextmodePluginAPI, Textmodifier } from 'textmode.js';
import type { VideoExportOptions } from './types';
/**
 * Main video exporter for the textmode.js library.
 * Orchestrates the video export process by coordinating canvas capture,
 * frame processing, and file handling.
 */
export declare class VideoExporter {
    private readonly _recorder;
    private readonly _textmodifier;
    private readonly _registerPostDrawHook;
    /**
     * Creates an instance of VideoExporter.
     * @param textmodifier The Textmodifier instance to extract data from
     * @param registerPostDrawHook The function to register post-draw hooks
     */
    constructor(textmodifier: Textmodifier, registerPostDrawHook: TextmodePluginAPI['registerPostDrawHook']);
    /**
     * Captures frames and saves them as a WEBM file
     * @param options Export options
     */
    $saveWEBM(options?: VideoExportOptions): Promise<void>;
    /**
     * Applies default values to video export options
     * @param options User-provided options
     * @returns Complete options with defaults applied
     */
    private _applyDefaultOptions;
}
//# sourceMappingURL=VideoExporter.d.ts.map