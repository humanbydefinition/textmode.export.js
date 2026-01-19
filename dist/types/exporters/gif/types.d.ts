export type GIFRecordingState = 'idle' | 'recording' | 'encoding' | 'completed' | 'error';
/**
 * Progress information emitted during the GIF export process.
 */
export type GIFExportProgress = {
    /**
     * Current state of the recording process.
     */
    state: 'idle' | 'recording' | 'encoding' | 'completed' | 'error';
    /**
     * Number of frames that have been recorded so far.
     */
    frameIndex?: number;
    /**
     * Total number of frames planned for the recording.
     */
    totalFrames?: number;
    /**
     * Optional status message for UI consumption.
     */
    message?: string;
};
/**
 * Options for exporting the textmode content to GIF format.
 */
export type GIFExportOptions = {
    /**
     * Target filename without extension. Defaults to an auto-generated value.
     */
    filename?: string;
    /**
     * Desired total number of frames to capture. Defaults to `300`.
     */
    frameCount?: number;
    /**
     * Target frame rate for the export, in frames per second. Defaults to `60`.
     */
    frameRate?: number;
    /**
     * Scale factor for the output image.
     *
     * `1.0` = original size, `2.0` = double size, `0.5` = half size.
     *
     * Defaults to `1.0`.
     */
    scale?: number;
    /**
     * GIF loop count. 0 = loop forever. Defaults to `0`.
     */
    repeat?: number;
    /**
     * Progress callback invoked throughout the recording lifecycle.
     */
    onProgress?: (progress: GIFExportProgress) => void;
};
export interface GIFGenerationOptions {
    filename?: string;
    frameCount: number;
    frameRate: number;
    scale: number;
    repeat: number;
}
export interface GIFFrame {
    imageData: ImageData;
    width: number;
    height: number;
    delayMs?: number;
}
//# sourceMappingURL=types.d.ts.map