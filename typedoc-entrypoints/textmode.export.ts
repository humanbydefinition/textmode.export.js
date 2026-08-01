/**
 * @packageDocumentation
 *
 * Export finished textmode.js artworks without leaving the sketch.
 *
 * ## Choose an output
 *
 * Use **canvas capture** for the exact image on screen: PNG, JPEG, WebP, GIF,
 * or video preserve compositing, filters, shaders, and post-processing. Use
 * **layer data export** when the artwork should stay editable or machine
 * readable: TXT, SVG, and JSON read from the selected layer, while JSON can
 * also describe the full layer stack.
 *
 * Start with {@link ExportPlugin}, then call the helpers added to your sketch
 * or use the built-in export overlay. For recipes and format trade-offs, read
 * the [Exporting guide](/docs/exporting).
 */

export { ExportPlugin } from '../src/index';

export type {
	ExportDefaults,
	ExportDefaultsPatch,
	ExportOverlayController,
	ExportOverlayPosition,
	ExportOverlayPositionInput,
	GIFExportOptions,
	GIFExportProgress,
	GIFOverlayDefaults,
	ImageExportOptions,
	ImageOverlayDefaults,
	JSONExportColorMode,
	JSONExportOptions,
	JSONExportTarget,
	JSONOverlayDefaults,
	LayerExportOptions,
	SVGExportOptions,
	SVGOverlayDefaults,
	TextmodeDocumentJSON,
	TextmodeExportAPI,
	TXTExportOptions,
	TXTOverlayDefaults,
	VideoBitrateMode,
	VideoBitratePreset,
	VideoExportFormat,
	VideoExportOptions,
	VideoExportPhase,
	VideoExportProgress,
	VideoHardwareAcceleration,
	VideoLatencyMode,
	VideoOverlayDefaults,
	VideoRecordingState,
} from '../src/index';
