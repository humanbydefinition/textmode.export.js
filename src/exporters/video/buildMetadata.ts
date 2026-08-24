import packageJson from '../../../package.json';

/**
 * Machine-readable provenance embedded in ESM and UMD artifacts.
 *
 * @example
 * ```ts
 * import { VIDEO_EXPORT_BUILD_METADATA } from 'textmode.export.js';
 * console.log(VIDEO_EXPORT_BUILD_METADATA.mediabunnyVersion);
 * ```
 *
 * @see {@link https://code.textmode.art/api/textmode.export.js/variables/VIDEO_EXPORT_BUILD_METADATA | VIDEO_EXPORT_BUILD_METADATA API reference}
 */
export const VIDEO_EXPORT_BUILD_METADATA = Object.freeze({
	exporterVersion: packageJson.version,
	mediabunnyVersion: packageJson.dependencies.mediabunny,
});
