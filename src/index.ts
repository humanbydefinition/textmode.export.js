/**
 * @packageDocumentation
 *
 * Export plugin for textmode.js - save artworks as images, videos, SVG, and text.
 *
 * This plugin adds comprehensive export capabilities to textmode.js instances,
 * allowing you to save your generative artworks in multiple formats with a 
 * convenient overlay UI for quick access to all export options.
 *
 * ## Available export formats
 *
 * ### Image formats
 * - {@link ImageExportOptions | PNG/JPEG/WebP} - Save canvas as raster image
 * 
 * ### Vector formats
 * - {@link SVGExportOptions | SVG} - Save as scalable vector graphics
 * 
 * ### Text formats
 * - {@link TXTExportOptions | TXT} - Save text content as plain text
 * 
 * ### Animation formats
 * - {@link GIFExportOptions | GIF} - Save as animated GIF
 * - {@link VideoExportOptions | WEBM} - Save as video file
 *
 * @module textmode.export.js
 */

import type { Textmodifier } from 'textmode.js';
import type { TextmodePlugin, TextmodePluginAPI } from 'textmode.js/plugins';
import { SVGExporter, type SVGExportOptions } from './exporters/svg';
import { ImageExporter, type ImageExportOptions } from './exporters/image';
import { TXTExporter, type TXTExportOptions } from './exporters/txt';
import { GIFExporter, type GIFExportOptions } from './exporters/gif';
import { VideoExporter, type VideoExportOptions } from './exporters/video';
import { createExportOverlay } from './overlay';
import type { TextmodeExportAPI, TextmodeExportPluginOptions, ExportOverlayController } from './types';

// Re-export all export option types for consumers
export type { TextmodeExportAPI, TextmodeExportPluginOptions, ExportOverlayController } from './types';
export type { ImageExportOptions } from './exporters/image';
export type { SVGExportOptions } from './exporters/svg';
export type { TXTExportOptions } from './exporters/txt';
export type { GIFExportOptions, GIFExportProgress } from './exporters/gif';
export type { VideoExportOptions, VideoExportProgress } from './exporters/video';

/**
 * Export plugin for textmode.js.
 *
 * Add this plugin to your textmode.js instance to enable exporting artworks
 * as images, videos, SVG, and text files. Includes an overlay UI for quick
 * access to all export options, which can be controlled at runtime.
 *
 * @example
 * ```javascript
 * import { textmode } from 'textmode.js';
 * import { ExportPlugin } from 'textmode.export.js';
 *
 * const t = textmode.create({
 *     plugins: [ExportPlugin]
 * });
 *
 * t.draw(() => {
 *     t.background(0);
 *     t.text('Hello World', 10, 10);
 * });
 *
 * // Export methods are now available
 * t.saveCanvas({ format: 'png', scale: 2.0 });
 * t.saveSVG({ filename: 'my-artwork' });
 * t.saveGIF({ duration: 3, fps: 30 });
 *
 * // Control overlay visibility at runtime
 * t.exportOverlay.hide();  // Hide the overlay
 * t.exportOverlay.show();  // Show the overlay
 * t.exportOverlay.toggle(); // Toggle visibility
 * ```
 */
export const ExportPlugin: TextmodePlugin = {
  name: 'textmode.export',
  version: '1.2.1',

  /**
   * Installs the export plugin into a Textmodifier instance
   * @param textmodifier The Textmodifier instance
   * @param api The plugin API
   * @returns Promise that resolves when installation is complete
   */
  async install(textmodifier: Textmodifier, api: TextmodePluginAPI) {
    // Create export API methods first
    const exportMethods = {
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

    // Create overlay controller (it needs access to export methods)
    const overlayController = createExportOverlay(textmodifier, exportMethods as TextmodeExportAPI);

    // Create overlay API
    const exportOverlayAPI: ExportOverlayController = {
      show: () => overlayController.show(),
      hide: () => overlayController.hide(),
      toggle: () => overlayController.toggle(),
      isVisible: () => overlayController.isVisible(),
    };

    // Combine into full export API
    const exportAPI: TextmodeExportAPI = {
      ...exportMethods,
      exportOverlay: exportOverlayAPI,
    };

    Object.assign(textmodifier, exportAPI);

    // Store controller reference for cleanup
    (textmodifier as any)._exportOverlayController = overlayController;
  },

  async uninstall(textmodifier: Textmodifier) {
    const overlayController = (textmodifier as any)._exportOverlayController;
    overlayController?.$dispose();
    delete (textmodifier as any)._exportOverlayController;

    const exportApiKeys: Array<keyof TextmodeExportAPI> = [
      'exportOverlay',
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

/**
 * Creates the `textmode.export.js` plugin for textmode.js.
 *
 * @deprecated Use {@link ExportPlugin} directly instead.
 * This function is provided for backwards compatibility only.
 *
 * @example
 * ```javascript
 * // Old way (deprecated)
 * import { createTextmodeExportPlugin } from 'textmode.export.js';
 * const t = textmode.create({ plugins: [createTextmodeExportPlugin()] });
 *
 * // New way (recommended)
 * import { ExportPlugin } from 'textmode.export.js';
 * const t = textmode.create({ plugins: [ExportPlugin] });
 * ```
 *
 * @param options Plugin options
 * @returns A textmode.js plugin instance.
 */
export const createTextmodeExportPlugin = (
  options: TextmodeExportPluginOptions = {},
): TextmodePlugin => {
  const overlayEnabled = options.overlay ?? true;
  
  // Return modified plugin that respects overlay option
  const plugin = { ...ExportPlugin };
  const originalInstall = plugin.install;
  
  plugin.install = async (textmodifier: Textmodifier, api: TextmodePluginAPI) => {
    await originalInstall.call(plugin, textmodifier, api);
    
    // If overlay should be disabled, hide it after installation
    if (!overlayEnabled) {
      const exportAPI = textmodifier as any as TextmodeExportAPI;
      exportAPI.exportOverlay.hide();
    }
  };
  
  return plugin;
};

// UMD global export
if (typeof window !== 'undefined') {
  (window as any).ExportPlugin = ExportPlugin;
  // Keep backwards compatibility
  (window as any).createTextmodeExportPlugin = createTextmodeExportPlugin;
}