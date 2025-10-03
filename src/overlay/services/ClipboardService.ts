import type { ExportFormat } from '../types';
import type { TextmodeExportAPI } from '../../types';

export class ClipboardService {
  private readonly api: TextmodeExportAPI;

  constructor(api: TextmodeExportAPI) {
    this.api = api;
  }

  async $copy(format: ExportFormat, options: unknown): Promise<void> {
    switch (format) {
      case 'txt': {
        const content = this.api.toString(options as any);
        await navigator.clipboard.writeText(content);
        break;
      }
      case 'svg': {
        const content = this.api.toSVG(options as any);
        await navigator.clipboard.writeText(content);
        break;
      }
      case 'image': {
        await this.api.copyCanvas(options as any);
        break;
      }
      default:
        throw new Error(`Clipboard not supported for ${format}`);
    }
  }
}
