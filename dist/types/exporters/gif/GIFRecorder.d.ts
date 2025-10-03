import type { TextmodePluginAPI } from 'textmode.js';
import type { GIFExportProgress, GIFFrame, GIFGenerationOptions } from './types';
/**
 * Records frames from a canvas for GIF generation.
 * Captures frames at specified intervals using textmode.js post-draw hooks.
 */
export declare class GIFRecorder {
    /** Reusable canvas for frame scaling */
    private _canvas?;
    /** Reusable 2D context for frame scaling */
    private _ctx?;
    /**
     * Records a sequence of frames from the provided canvas.
     *
     * @param canvas - Source canvas to capture frames from
     * @param options - Frame generation options (rate, count, scale)
     * @param registerPostDrawHook - Hook registration function from textmode.js API
     * @param onProgress - Optional callback for recording progress updates
     * @returns Promise resolving to array of captured frames
     * @throws Error if frame capture fails
     */
    $record(canvas: HTMLCanvasElement, options: GIFGenerationOptions, registerPostDrawHook: TextmodePluginAPI['registerPostDrawHook'], onProgress?: (progress: GIFExportProgress) => void): Promise<GIFFrame[]>;
}
//# sourceMappingURL=GIFRecorder.d.ts.map