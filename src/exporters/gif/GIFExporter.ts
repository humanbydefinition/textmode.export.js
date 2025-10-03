import type { TextmodePluginAPI, Textmodifier } from 'textmode.js';
import { GIFRecorder } from './GIFRecorder';
import type { GIFExportOptions, GIFGenerationOptions } from './types';
import { FileHandler } from '../base';
import { applyPalette, GIFEncoder, quantize, type GIFPalette } from 'gifenc';

/**
 * Main GIF exporter for the textmode.js library.
 * Orchestrates the GIF export process by coordinating canvas capture,
 * frame processing, and file handling.
 */
export class GIFExporter {
  private readonly _recorder: GIFRecorder;
  private readonly _textmodifier: Textmodifier;
  private readonly _registerPostDrawHook: TextmodePluginAPI['registerPostDrawHook'];

  /**
   * Creates an instance of GIFExporter.
   * @param textmodifier The Textmodifier instance to capture frames from
   * @param registerPostDrawHook Function to register post-draw hooks
   */
  constructor(textmodifier: Textmodifier, registerPostDrawHook: TextmodePluginAPI['registerPostDrawHook']) {
    this._recorder = new GIFRecorder();
    this._textmodifier = textmodifier;
    this._registerPostDrawHook = registerPostDrawHook;
  }

  /**
   * Captures frames and saves them as a GIF file
   * @param options Export options 
   */
  public async $saveGIF(options: GIFExportOptions = {}): Promise<void> {
    const canvas = this._textmodifier.canvas as HTMLCanvasElement;
    const generationOptions = this._applyDefaultOptions(options);
    const progress = options.onProgress;

    try {
      const frames = await this._recorder.$record(
        canvas,
        generationOptions,
        this._registerPostDrawHook,
        progress,
      );

      const encoder = GIFEncoder();
      const { repeat } = options;

      frames.forEach((frame, index) => {
        const { width, height, imageData, delayMs } = frame;
        const rgbaBuffer = new Uint32Array(imageData.data.buffer.slice(0));

        const palette: GIFPalette = quantize(rgbaBuffer, 256, {});

        const indexedPixels = applyPalette(rgbaBuffer, palette);

        encoder.writeFrame(indexedPixels, width, height, {
          palette,
          delay: delayMs,
          repeat: index === 0 ? repeat : -1,
        });
      });

      encoder.finish();
      const bytes = encoder.bytes();
      const buffer = bytes.buffer.slice(
        bytes.byteOffset,
        bytes.byteOffset + bytes.byteLength,
      ) as ArrayBuffer;

      new FileHandler().$downloadFile(
        new Blob([buffer], { type: 'image/gif' }),
        generationOptions.filename
      );

      progress?.({
        state: 'completed',
        totalFrames: generationOptions.frameCount,
      });
    } catch (error) {
      progress?.({
        state: 'error',
        message: error instanceof Error ? error.message : 'GIF export failed',
      });
      throw error;
    }
  }

  /**
   * Applies default values to the provided export options
   * @param options User-provided options
   * @returns Complete options with defaults applied
   */
  private _applyDefaultOptions(options: GIFExportOptions): GIFGenerationOptions {
    const frameCount = Math.abs(Math.round(options.frameCount ?? 300));
    const frameRate = Math.abs(options.frameRate ?? 60);
    const scale = Math.abs(options.scale ?? 1.0);
    const repeat = Math.max(-1, Math.round(options.repeat ?? 0));

    return {
      filename: options.filename,
      frameCount,
      frameRate,
      scale,
      repeat,
    };
  }
}
