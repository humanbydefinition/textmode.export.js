import type { ImageExportOptions } from '../exporters/image';
import type { TXTExportOptions } from '../exporters/txt';
import type { SVGExportOptions } from '../exporters/svg';
import type { GIFExportOptions } from '../exporters/gif';
import type { VideoBitratePreset, VideoExportOptions } from '../exporters/video';
import type { JSONExportOptions } from '../exporters/json';

export type ExportFormat = 'txt' | 'json' | 'image' | 'gif' | 'video' | 'svg';

export type ExportOptionsMap = {
	txt: TXTExportOptions;
	json: JSONExportOptions;
	image: ImageExportOptions;
	gif: GIFExportOptions;
	video: VideoExportOptions;
	svg: SVGExportOptions;
};

export type TXTOverlayDefaults = Pick<TXTExportOptions, 'preserveTrailingSpaces' | 'emptyCharacter'>;
export type JSONOverlayDefaults = Pick<JSONExportOptions, 'target' | 'pretty' | 'includeMetadata' | 'colorMode'>;
export type ImageOverlayDefaults = Pick<ImageExportOptions, 'format' | 'scale'>;
export type SVGOverlayDefaults = Pick<SVGExportOptions, 'includeBackgroundRectangles' | 'drawMode' | 'strokeWidth'>;
export type GIFOverlayDefaults = Pick<GIFExportOptions, 'frameCount' | 'frameRate' | 'scale' | 'repeat'>;
export type VideoOverlayDefaults = Pick<
	VideoExportOptions,
	| 'format'
	| 'frameCount'
	| 'frameRate'
	| 'bitrateMode'
	| 'latencyMode'
	| 'hardwareAcceleration'
	| 'keyFrameInterval'
	| 'transparent'
> & {
	bitrate?: VideoBitratePreset;
};

/**
 * Curated default options for every export format.
 *
 * Each sub-object contains the library-chosen default values for the fields
 * that the overlay exposes as inputs.  These are the values applied when the
 * overlay first mounts and after a {@link OverlayController.resetDefaults}.
 */
export type ExportDefaults = {
	format: ExportFormat;
	txt: TXTOverlayDefaults;
	json: JSONOverlayDefaults;
	image: ImageOverlayDefaults;
	svg: SVGOverlayDefaults;
	gif: GIFOverlayDefaults;
	video: VideoOverlayDefaults;
};

/**
 * Partial patch accepted by {@link OverlayController.setDefaults}.
 *
 * Every supplied sub-object is deep-merged into the corresponding format's
 * curated defaults.  Omitted keys keep their current value.
 */
export type ExportDefaultsPatch = {
	format?: ExportFormat;
} & {
	[K in ExportFormat]?: Partial<ExportDefaults[K]>;
};
