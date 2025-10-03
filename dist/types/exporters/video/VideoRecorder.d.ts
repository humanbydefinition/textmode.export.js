import type { TextmodePluginAPI } from 'textmode.js';
import type { VideoExportProgress, VideoGenerationOptions } from './types';
/**
 * Records frames from a canvas to create WEBM video files.
 * Captures frames at specified intervals using textmode.js post-draw hooks
 * and encodes them into a WEBM video format.
 */
export declare class VideoRecorder {
    /**
     * Records a sequence of frames from the provided canvas and encodes them as a WEBM video.
     *
     * @param canvas - Source canvas to capture frames from
     * @param options - Video generation options
     * @param registerPostDrawHook - Hook registration function from textmode.js API
     * @param onProgress - Optional callback for recording progress updates
     * @returns Promise resolving to a Blob containing the encoded WEBM video
     * @throws Error if frame capture or encoding fails
     */
    $record(canvas: HTMLCanvasElement, options: VideoGenerationOptions, registerPostDrawHook: TextmodePluginAPI['registerPostDrawHook'], onProgress?: (progress: VideoExportProgress) => void): Promise<Blob>;
    /**
     * Creates a reusable snapshot function for capturing canvas frames.
     * Uses a cached canvas and context to avoid repeated allocations.
     *
     * @returns Function that takes a canvas and returns a snapshot canvas
     */
    private _createSnapshotSurface;
}
//# sourceMappingURL=VideoRecorder.d.ts.map