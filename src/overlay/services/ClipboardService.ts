import type { ExportFormat, ExportOptionsMap } from '../types';
import type { TextmodeExportAPI } from '../../types';

type ClipboardExportFormat = Extract<ExportFormat, 'txt' | 'json' | 'svg' | 'image'>;

export class ClipboardService {
	private readonly api: TextmodeExportAPI;

	constructor(api: TextmodeExportAPI) {
		this.api = api;
	}

	async $copy(format: 'txt', options: ExportOptionsMap['txt']): Promise<void>;
	async $copy(format: 'json', options: ExportOptionsMap['json']): Promise<void>;
	async $copy(format: 'svg', options: ExportOptionsMap['svg']): Promise<void>;
	async $copy(format: 'image', options: ExportOptionsMap['image']): Promise<void>;
	async $copy(format: ClipboardExportFormat, options: ExportOptionsMap[ClipboardExportFormat]): Promise<void>;
	async $copy(format: ClipboardExportFormat, options: ExportOptionsMap[ClipboardExportFormat]): Promise<void> {
		switch (format) {
			case 'txt': {
				const content = this.api.toString(options as ExportOptionsMap['txt']);
				await navigator.clipboard.writeText(content);
				break;
			}
			case 'json': {
				const content = this.api.toJSONString(options as ExportOptionsMap['json']);
				await navigator.clipboard.writeText(content);
				break;
			}
			case 'svg': {
				const content = this.api.toSVG(options as ExportOptionsMap['svg']);
				await navigator.clipboard.writeText(content);
				break;
			}
			case 'image': {
				await this.api.copyCanvas(options as ExportOptionsMap['image']);
				break;
			}
			default:
				throw new Error(`Clipboard not supported for ${format}`);
		}
	}
}
