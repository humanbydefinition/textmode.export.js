import type { Textmodifier } from 'textmode.js';
import type { TextmodePluginAPI } from 'textmode.js/plugins';
import { VideoRecorder } from './VideoRecorder';
import type { VideoExportOptions, VideoGenerationOptions } from './types';
import { FileHandler } from '../base';

/**
 * Main video exporter for the textmode.js library.
 * Orchestrates the video export process by coordinating canvas capture,
 * frame processing, and file handling.
 */
export class VideoExporter {
  private readonly _recorder: VideoRecorder;
  private readonly _textmodifier: Textmodifier;
  private readonly _registerPostDrawHook: TextmodePluginAPI['registerPostDrawHook'];

  /**
   * Creates an instance of VideoExporter.
   * @param textmodifier The Textmodifier instance to extract data from
   * @param registerPostDrawHook The function to register post-draw hooks
   */
  constructor(textmodifier: Textmodifier, registerPostDrawHook: TextmodePluginAPI['registerPostDrawHook']) {
    this._recorder = new VideoRecorder();
    this._textmodifier = textmodifier;
    this._registerPostDrawHook = registerPostDrawHook;
  }

  /**
   * Captures frames and saves them as a WEBM file
   * @param options Export options
   */
  public async $saveWEBM(options: VideoExportOptions = {}): Promise<void> {
    const canvas = this._textmodifier.canvas;
    const generationOptions = this._applyDefaultOptions(options);

    try {
      const blob = await this._recorder.$record(
        canvas,
        generationOptions,
        this._registerPostDrawHook,
        options.onProgress,
      );
      new FileHandler().$downloadFile(blob, generationOptions.filename);

    } catch (error) {
      options.onProgress?.({
        state: 'error',
        message: error instanceof Error ? error.message : 'WEBM export failed',
      });
      throw error;
    }
  }

  /**
   * Applies default values to video export options
   * @param options User-provided options
   * @returns Complete options with defaults applied
   */
  private _applyDefaultOptions(options: VideoExportOptions): VideoGenerationOptions {

    return {
      filename: options.filename,
      frameRate: Math.abs(Math.round(options.frameRate ?? 60)),
      frameCount: Math.abs(Math.round(options.frameCount ?? 300)),
      quality: Math.abs(Math.min(Math.max(options.quality ?? 1.0, 0), 1)),
      transparent: Boolean(options.transparent),
      debugLogging: Boolean(options.debugLogging),
    };
  }
}
