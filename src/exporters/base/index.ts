export { DataExtractor } from './DataExtractor';
export { FileHandler } from './FileHandler';
export { FilenamePolicy } from './FilenamePolicy';
export { getEncodedGlyphValueFromColor, resolveGlyphByEncodedValue } from './CharacterResolver';
export {
	createLayerTargetProvider,
	getLayerTargetId,
	getLayerTargetOptions,
	resolveLayerExportTarget,
	resolveLayerStackExportTargets,
} from './LayerTarget';
export type {
	LayerExportOptions,
	LayerTargetOption,
	LayerTargetProvider,
	ResolvedLayerExportTarget,
	ResolvedLayerStackExportTarget,
} from './LayerTarget';
export type { ExportFrameContext, PrepareExportFrame } from './FramePreparation';
export {
	ExclusiveCaptureGate,
	FrameSequenceDriver,
	FrameSequenceError,
	createFrameSequenceAbortError,
	frameTiming,
	isFrameSequenceAbortError,
} from './frame-sequence';
export type {
	FrameSequenceDriverLike,
	FrameSequenceRenderOptions,
	FrameSequenceStagingSurface,
	PostDrawSubscription,
} from './frame-sequence';
