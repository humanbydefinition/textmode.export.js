import type { Textmodifier } from 'textmode.js';
import type { TextmodePlugin, TextmodePluginAPI } from 'textmode.js/plugins';
import { SVGExporter, type SVGExportOptions } from './exporters/svg';
import { ImageExporter, type ImageExportOptions } from './exporters/image';
import { TXTExporter, type TXTExportOptions } from './exporters/txt';
import { GIFExporter, type GIFExportOptions } from './exporters/gif';
import { VideoExporter, type VideoExportOptions } from './exporters/video';
import { createExportOverlay } from './overlay';
import type { OverlayController } from './overlay/core/OverlayController';
import type { TextmodeExportAPI, TextmodeExportPluginOptions } from './types';

/**
 * Initializes the export plugin for `textmode.js` use.
 * @param options Plugin options
 * @returns The export plugin instance to pass to `textmode.js`.
 * 
 * @example
 * ```typescript
 * import { textmode } from 'textmode.js';
 * import { createExportPlugin } from 'textmode.export.js';
 * 
 * const exportPlugin = createExportPlugin({ overlay: true });
 *
 * const textmodifier = textmode.create({
 *  plugins: [exportPlugin],
 * });
 * 
 * // Now textmodifier has export methods like saveSVG, saveCanvas, etc.
 * // textmodifier.saveSVG({ filename: 'my-artwork' });
 * // textmodifier.saveCanvas({ format: 'png', scale: 2.0 });
 * ```
 */
/**
 * Creates and returns a textmode export plugin instance.
 * In UMD builds, this is also available globally as `createTextmodeExportPlugin`.
 */
export const createTextmodeExportPlugin = (
  options: TextmodeExportPluginOptions = {},
): TextmodePlugin => {
  const overlayEnabled = options.overlay ?? true;
  let overlayController: OverlayController | undefined;

  return {
    name: 'textmode-export',
    version: '1.0.0',

    /**
     * Installs the export plugin into a Textmodifier instance
     * @param textmodifier The Textmodifier instance
     * @param api The plugin API
     * @returns Promise that resolves when installation is complete
     */
    async install(textmodifier: Textmodifier, api: TextmodePluginAPI) {
      const exportAPI: TextmodeExportAPI = {

        /**
         * Saves the current canvas as an image file
         * @param options Export options
         * @returns Promise that resolves when the file is saved
         */
        saveCanvas: async (options: ImageExportOptions = {}) => {
          
          return new ImageExporter().$saveImage(textmodifier.canvas, options);
        },

        /**
         * Copies the current canvas image to the clipboard
         * @param options Export options
         * @return Promise that resolves when the image is copied
         * @throws Error if the Clipboard API is not supported or if copying fails
         */
        copyCanvas: async (options: ImageExportOptions = {}) => {
          
          return new ImageExporter().$copyImageToClipboard(textmodifier.canvas, options);
        },

        /**
         * Saves the current canvas as an SVG file
         * @param options Export options
         */
        saveSVG: (options: SVGExportOptions = {}) => {
          
          new SVGExporter().$saveSVG(textmodifier, options);
        },

        /**
         * Saves the current text content as a TXT file
         * @param options Export options
         */
        saveStrings: (options: TXTExportOptions = {}) => {
          
          new TXTExporter().$saveTXT(textmodifier, options);
        },

        /**
         * Generates SVG content as a string
         * @param options Export options
         * @returns String containing the SVG content
         */
        toSVG: (options: SVGExportOptions = {}) => {
          
          return new SVGExporter().$generateSVG(textmodifier, options);
        },

        /**
         * Generates TXT content as a string
         * @param options Export options
         * @returns String containing the TXT content
         */
        toString: (options: TXTExportOptions = {}) => {
          
          return new TXTExporter().$generateTXT(textmodifier, options);
        },

        /**
         * Saves the current canvas as an animated GIF file
         * @param options Export options
         * @returns Promise that resolves when the file is saved
         */
        saveGIF: async (options: GIFExportOptions = {}) => {
          
          return new GIFExporter(textmodifier, api.registerPostDrawHook).$saveGIF(options);
        },

        /**
         * Saves the current canvas as a WEBM video file
         * @param options Export options
         * @returns Promise that resolves when the file is saved
         */
        saveWEBM: async (options: VideoExportOptions = {}) => {
          
          return new VideoExporter(textmodifier, api.registerPostDrawHook).$saveWEBM(options);
        },
      };

      Object.assign(textmodifier, exportAPI);

      if (overlayEnabled) {
        overlayController = createExportOverlay(textmodifier, exportAPI);
      }
    },

    async uninstall(textmodifier: Textmodifier) {
      overlayController?.$dispose();
      overlayController = undefined;

      const exportApiKeys: Array<keyof TextmodeExportAPI> = [
        'saveCanvas',
        'copyCanvas',
        'saveSVG',
        'saveStrings',
        'toSVG',
        'toString',
        'saveGIF',
        'saveWEBM',
      ];

      for (const key of exportApiKeys) {
        delete (textmodifier as Partial<TextmodeExportAPI>)[key];
      }
    },
  };
};

export type { TextmodeExportAPI, TextmodeExportPluginOptions } from './types';
export type { ImageExportOptions } from './exporters/image';
export type { SVGExportOptions } from './exporters/svg';
export type { TXTExportOptions } from './exporters/txt';
export type { GIFExportOptions, GIFExportProgress } from './exporters/gif';
export type { VideoExportOptions, VideoExportProgress } from './exporters/video';

// For UMD builds: expose createTextmodeExportPlugin globally for convenience
if (typeof window !== 'undefined') {
  (window as any).createTextmodeExportPlugin = createTextmodeExportPlugin;
}