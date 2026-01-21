import type { TextmodePluginAPI } from 'textmode.js/plugins';
import type { GIFExportProgress, GIFFrame, GIFGenerationOptions } from './types';

/**
 * Records frames from a canvas for GIF generation.
 * Captures frames at specified intervals using textmode.js post-draw hooks.
 */
export class GIFRecorder {
  /** Reusable canvas for frame scaling */
  private _canvas?: HTMLCanvasElement;

  /** Reusable 2D context for frame scaling */
  private _ctx?: CanvasRenderingContext2D;

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
  public async $record(
    canvas: HTMLCanvasElement,
    options: GIFGenerationOptions,
    registerPostDrawHook: TextmodePluginAPI['registerPostDrawHook'],
    onProgress?: (progress: GIFExportProgress) => void,
  ): Promise<GIFFrame[]> {
    // Calculate frame timing parameters
    const targetFrameRate = Math.max(1, Math.round(options.frameRate));
    const targetDelayMs = Math.round(1000 / targetFrameRate);
    const totalFrames = Math.max(1, Math.round(options.frameCount));

    return await new Promise<GIFFrame[]>((resolve, reject) => {
      const frames: GIFFrame[] = [];
      let stopHook: (() => void) | undefined;
      let framesCaptured = 0;
      let settled = false; // Prevent multiple resolve/reject calls

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
       * Rejects the promise once with an error.
       * Ensures idempotent error handling.
       */
      const rejectOnce = (error: unknown) => {
        if (settled) {
          return;
        }
        settled = true;
        cleanup();
        const message = error instanceof Error ? error.message : 'GIF recording failed';
        onProgress?.({ state: 'error', message });
        reject(error instanceof Error ? error : new Error(String(error)));
      };

      /**
       * Resolves the promise once with captured frames.
       * Ensures idempotent success handling.
       */
      const resolveOnce = (capturedFrames: GIFFrame[]) => {
        if (settled) {
          return;
        }
        settled = true;
        cleanup();
        resolve(capturedFrames);
      };

      /**
       * Captures a single frame from the canvas.
       * Called via post-draw hook on each render.
       */
      const captureFrame = () => {
        // Check if we've captured all required frames
        if (framesCaptured >= totalFrames) {
          resolveOnce(frames);
          return;
        }

        try {
          // Calculate scaled dimensions
          const scale = options.scale;
          const width = Math.max(1, Math.round(canvas.width * scale));
          const height = Math.max(1, Math.round(canvas.height * scale));

          // Initialize or reuse canvas
          if (!this._canvas) {
            this._canvas = document.createElement('canvas');
          }

          // Resize canvas if dimensions changed
          if (this._canvas.width !== width || this._canvas.height !== height) {
            this._canvas.width = width;
            this._canvas.height = height;
          }

          // Initialize or reuse 2D context
          if (!this._ctx) {
            this._ctx = this._canvas.getContext('2d')!;
          }

          const ctx = this._ctx;
          ctx.imageSmoothingEnabled = false; // Preserve pixel art quality

          // Draw scaled frame
          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, width, height);

          // Extract pixel data
          const imageData = ctx.getImageData(0, 0, width, height);

          const frame: GIFFrame = {
            imageData,
            width,
            height,
            delayMs: targetDelayMs,
          };

          frames.push(frame);
          framesCaptured += 1;

          // Report progress
          onProgress?.({
            state: 'recording',
            frameIndex: framesCaptured,
            totalFrames,
          });

          // Check completion
          if (framesCaptured >= totalFrames) {
            resolveOnce(frames);
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
      onProgress?.({
        state: 'recording',
        frameIndex: 0,
        totalFrames,
      });
    });
  }
}
