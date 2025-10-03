export type VideoRecordingState = 'idle' | 'recording' | 'encoding' | 'completed' | 'error';
/**
 * Progress information emitted during the video export process.
 */
export type VideoExportProgress = {
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
 * Options for exporting the textmode content to video format.
 */
export type VideoExportOptions = {
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
     * Encoder quality between 0.0 and 1.0. Higher values request higher fidelity. Defaults to `1.0` *(lossless)*.
     */
    quality?: number;
    /**
    * When true, attempts to preserve alpha data in the recording *(experimental)*. Defaults to `false`.
    */
    transparent?: boolean;
    /**
     * Progress callback invoked throughout the recording lifecycle.
     */
    onProgress?: (progress: VideoExportProgress) => void;
    /**
     * Enables verbose logging. Defaults to `false`.
     */
    debugLogging?: boolean;
};
export interface VideoGenerationOptions {
    filename?: string;
    frameRate: number;
    frameCount: number;
    quality: number;
    transparent: boolean;
    debugLogging: boolean;
}
//# sourceMappingURL=types.d.ts.map