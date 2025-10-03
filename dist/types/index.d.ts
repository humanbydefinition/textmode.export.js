import type { TextmodePlugin } from 'textmode.js';
import type { TextmodeExportPluginOptions } from './types';
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
export declare const createTextmodeExportPlugin: (options?: TextmodeExportPluginOptions) => TextmodePlugin;
export type { TextmodeExportAPI, TextmodeExportPluginOptions } from './types';
export type { ImageExportOptions } from './exporters/image';
export type { SVGExportOptions } from './exporters/svg';
export type { TXTExportOptions } from './exporters/txt';
export type { GIFExportOptions, GIFExportProgress } from './exporters/gif';
export type { VideoExportOptions, VideoExportProgress } from './exporters/video';
//# sourceMappingURL=index.d.ts.map