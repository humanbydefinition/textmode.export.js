import type { ExportFormat } from '../types';
import type { GIFExportProgress, GIFRecordingState } from '../../exporters/gif';
import type { VideoExportProgress, VideoRecordingState } from '../../exporters/video';

export interface RecordingStateSnapshot {
  gif: GIFRecordingState;
  video: VideoRecordingState;
}

export interface OverlayState {
  format: ExportFormat;
  isBusy: boolean;
  gifProgress?: GIFExportProgress;
  videoProgress?: VideoExportProgress;
  error?: Error;
}

export const createInitialOverlayState = (defaultFormat: ExportFormat): OverlayState => ({
  format: defaultFormat,
  isBusy: false,
});
