import type { ExportFormat } from '../types';
import type { TextmodeExportAPI } from '../../types';
import type { OverlayEvents } from '../models/OverlayEvents';
import type { GIFExportOptions, GIFExportProgress } from '../../exporters/gif';
import type { VideoExportOptions, VideoExportProgress } from '../../exporters/video';
import type { ImageExportOptions } from '../../exporters/image';
import type { SVGExportOptions } from '../../exporters/svg';
import type { TXTExportOptions } from '../../exporters/txt';
import { EventBus } from '../core/EventBus';

export interface ExportHooks {
  onGIFProgress?: (progress: GIFExportProgress) => void;
  onVideoProgress?: (progress: VideoExportProgress) => void;
}

export class ExportService {
  private readonly api: TextmodeExportAPI;
  private readonly events: EventBus<OverlayEvents>;

  constructor(api: TextmodeExportAPI, events: EventBus<OverlayEvents>) {
    this.api = api;
    this.events = events;
  }

  public async $requestExport(format: ExportFormat, options: unknown, hooks: ExportHooks = {}): Promise<void> {
    this.events.$emit('export:request', { format });
    try {
      const forwardingHooks: ExportHooks = {
        onGIFProgress: hooks.onGIFProgress
          ? (progress) => {
              hooks.onGIFProgress?.(progress);
              this.events.$emit('export:progress', { format, progress });
            }
          : (format === 'gif'
              ? (progress) => this.events.$emit('export:progress', { format, progress })
              : undefined),
        onVideoProgress: hooks.onVideoProgress
          ? (progress) => {
              hooks.onVideoProgress?.(progress);
              this.events.$emit('export:progress', { format, progress });
            }
          : (format === 'video'
              ? (progress) => this.events.$emit('export:progress', { format, progress })
              : undefined),
      };

      await this._execute(format, options, forwardingHooks);
      this.events.$emit('export:success', { format });
    } catch (error) {
      this.events.$emit('export:error', { format, error: error as Error });
      throw error;
    }
  }

  private _execute(format: ExportFormat, options: unknown, hooks: ExportHooks): Promise<void> | void {
    switch (format) {
      case 'txt':
        return Promise.resolve(this.api.saveStrings(options as TXTExportOptions));
      case 'image':
        return this.api.saveCanvas(options as ImageExportOptions);
      case 'svg':
        return Promise.resolve(this.api.saveSVG(options as SVGExportOptions));
      case 'gif': {
        const payload: GIFExportOptions = {
          ...(options as GIFExportOptions),
          onProgress: hooks.onGIFProgress,
        };
        return this.api.saveGIF(payload);
      }
      case 'video': {
        const payload: VideoExportOptions = {
          ...(options as VideoExportOptions),
          onProgress: hooks.onVideoProgress,
        };
        return this.api.saveWEBM(payload);
      }
    }
  }
}
