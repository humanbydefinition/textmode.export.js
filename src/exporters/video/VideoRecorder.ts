import type { TextmodePluginAPI } from 'textmode.js';
import type { VideoExportProgress, VideoGenerationOptions } from './types';
import WebMWriter from 'webm-writer';

/**
 * Records frames from a canvas to create WEBM video files.
 * Captures frames at specified intervals using textmode.js post-draw hooks
 * and encodes them into a WEBM video format.
 */
export class VideoRecorder {
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
  public async $record(
    canvas: HTMLCanvasElement,
    options: VideoGenerationOptions,
    registerPostDrawHook: TextmodePluginAPI['registerPostDrawHook'],
    onProgress?: (progress: VideoExportProgress) => void,
  ): Promise<Blob> {
    // Calculate frame parameters
    const targetFrameRate = Math.max(1, Math.round(options.frameRate));
    const totalFrames = Math.max(1, Math.round(options.frameCount));

    // Initialize WEBM encoder with quality and transparency settings
    const writer = new WebMWriter({
      quality: options.quality,
      alphaQuality: options.transparent ? options.quality : undefined,
      transparent: options.transparent,
      frameRate: targetFrameRate,
    });

    // Create reusable canvas snapshot function
    const snapshotSurface = this._createSnapshotSurface();

    return await new Promise<Blob>((resolve, reject) => {
      let stopHook: (() => void) | undefined;
      let state: 'capturing' | 'encoding' = 'capturing';
      let settled = false; // Prevent multiple resolve/reject calls
      let framesCaptured = 0;

      /**
       * Cleans up the post-draw hook registration.
       */
      const cleanup = () => {
        if (stopHook) {
          stopHook();
          stopHook = undefined;
        }
      };

      /**
       * Emits progress update for recording state.
       */
      const emitRecordingProgress = () => {
        onProgress?.({
          state: 'recording',
          frameIndex: framesCaptured,
          totalFrames,
        });
      };

      /**
       * Rejects the promise once with an error.
       * Ensures idempotent error handling.
       */
      const rejectOnce = (error: unknown) => {
        if (settled) {
          return;
        }
        settled = true;
        cleanup();
        const message = error instanceof Error ? error.message : 'WEBM export failed';
        onProgress?.({ state: 'error', message });
        reject(error instanceof Error ? error : new Error(String(error)));
      };

      /**
       * Resolves the promise once with the encoded video blob.
       * Ensures idempotent success handling.
       */
      const resolveOnce = (blob: Blob) => {
        if (settled) {
          return;
        }
        settled = true;
        onProgress?.({
          state: 'completed',
          frameIndex: Math.min(totalFrames, framesCaptured),
          totalFrames,
        });
        resolve(blob);
      };

      /**
       * Transitions from capturing to encoding phase.
       * Completes the WEBM writer and resolves with the final blob.
       */
      const beginEncoding = () => {
        if (state !== 'capturing' || settled) {
          return;
        }
        state = 'encoding';
        cleanup();

        // Finalize WEBM encoding and retrieve the video blob
        void writer.complete().then((blob) => {
          resolveOnce(blob);
        }).catch(rejectOnce);
      };

      /**
       * Captures a single frame from the canvas.
       * Called via post-draw hook on each render.
       */
      const captureFrame = () => {
        // Skip if not in capturing state
        if (state !== 'capturing') {
          return;
        }

        // Check if we've captured all required frames
        if (framesCaptured >= totalFrames) {
          beginEncoding();
          return;
        }

        try {
          // Capture frame snapshot and add to encoder
          const frameSource = snapshotSurface(canvas);
          writer.addFrame(frameSource);
          framesCaptured += 1;
          emitRecordingProgress();

          // Begin encoding if we've reached the target frame count
          if (framesCaptured >= totalFrames) {
            beginEncoding();
          }
        } catch (error) {
          rejectOnce(error);
        }
      };

      // Register the post-draw hook
      stopHook = registerPostDrawHook(() => {
        captureFrame();
      });


      // Send initial progress update
      emitRecordingProgress();
    });
  }

  /**
   * Creates a reusable snapshot function for capturing canvas frames.
   * Uses a cached canvas and context to avoid repeated allocations.
   * 
   * @returns Function that takes a canvas and returns a snapshot canvas
   */
  private _createSnapshotSurface(): (currentCanvas: HTMLCanvasElement) => HTMLCanvasElement {
    // Closure variables for canvas reuse
    let snapshotCanvas: HTMLCanvasElement | null = null;
    let snapshotContext: CanvasRenderingContext2D | null = null;

    /**
     * Ensures snapshot canvas exists with correct dimensions.
     * Creates or resizes the canvas as needed.
     */
    const ensureSnapshotSurface = (width: number, height: number) => {
      // Initialize canvas on first use
      if (!snapshotCanvas) {
        snapshotCanvas = document.createElement('canvas');
      }

      // Resize canvas if dimensions changed
      if (snapshotCanvas.width !== width || snapshotCanvas.height !== height) {
        snapshotCanvas.width = width;
        snapshotCanvas.height = height;
        snapshotContext = snapshotCanvas.getContext('2d');
        if (snapshotContext) {
          snapshotContext.imageSmoothingEnabled = false; // Preserve pixel art quality
        }
      } else if (!snapshotContext) {
        // Initialize context if canvas exists but context doesn't
        snapshotContext = snapshotCanvas.getContext('2d');
        if (snapshotContext) {
          snapshotContext.imageSmoothingEnabled = false; // Preserve pixel art quality
        }
      }

      return snapshotContext ? snapshotCanvas : null;
    };

    /**
     * Returns a snapshot of the current canvas.
     * Reuses the same canvas buffer across calls for performance.
     */
    return (currentCanvas: HTMLCanvasElement) => {
      const width = Math.max(1, currentCanvas.width);
      const height = Math.max(1, currentCanvas.height);
      const surface = ensureSnapshotSurface(width, height);

      // Fallback to original canvas if snapshot surface unavailable
      if (!surface || !snapshotContext) {
        return currentCanvas;
      }

      // Copy current canvas to snapshot surface
      snapshotContext.clearRect(0, 0, width, height);
      snapshotContext.drawImage(currentCanvas, 0, 0, width, height);
      return surface;
    };
  }
}
