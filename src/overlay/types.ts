import type { ImageExportOptions } from '../exporters/image';
import type { TXTExportOptions } from '../exporters/txt';
import type { SVGExportOptions } from '../exporters/svg';
import type { GIFExportOptions } from '../exporters/gif';
import type { VideoExportOptions } from '../exporters/video';

export type ExportFormat = 'txt' | 'image' | 'gif' | 'video' | 'svg';

export type ExportOptionsMap = {
  txt: TXTExportOptions;
  image: ImageExportOptions;
  gif: GIFExportOptions;
  video: VideoExportOptions;
  svg: SVGExportOptions;
};
