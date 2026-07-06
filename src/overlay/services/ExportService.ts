import type { ExportFormat } from '../types';
import type { TextmodeExportAPI } from '../../types';
import type { OverlayEvents } from '../models/OverlayEvents';
import type { GIFExportOptions, GIFExportProgress } from '../../exporters/gif';
import type { VideoExportOptions, VideoExportProgress } from '../../exporters/video';
import type { ImageExportOptions } from '../../exporters/image';
import type { SVGExportOptions } from '../../exporters/svg';
import type { TXTExportOptions } from '../../exporters/txt';
import type { JSONExportOptions } from '../../exporters/json';
import { EventBus } from '../core/EventBus';

export interface ExportHooks {
	onGIFProgress?: (progress: GIFExportProgress) => void;
	onVideoProgress?: (progress: VideoExportProgress) => void;
}

type Executor = (api: TextmodeExportAPI, options: unknown, hooks: ExportHooks) => Promise<void> | void;

const EXECUTORS: Record<ExportFormat, Executor> = {
	txt: (api, options) => Promise.resolve(api.saveStrings(options as TXTExportOptions)),
	json: (api, options) => Promise.resolve(api.saveJSON(options as JSONExportOptions)),
	image: (api, options) => api.saveCanvas(options as ImageExportOptions),
	svg: (api, options) => Promise.resolve(api.saveSVG(options as SVGExportOptions)),
	gif: (api, options, hooks) => {
		const payload: GIFExportOptions = {
			...(options as GIFExportOptions),
			onProgress: hooks.onGIFProgress,
		};
		return api.saveGIF(payload);
	},
	video: (api, options, hooks) => {
		const payload: VideoExportOptions = {
			...(options as VideoExportOptions),
			onProgress: hooks.onVideoProgress,
		};
		return api.saveVideo(payload);
	},
};

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
					: format === 'gif'
						? (progress) => this.events.$emit('export:progress', { format, progress })
						: undefined,
				onVideoProgress: hooks.onVideoProgress
					? (progress) => {
							hooks.onVideoProgress?.(progress);
							this.events.$emit('export:progress', { format, progress });
						}
					: format === 'video'
						? (progress) => this.events.$emit('export:progress', { format, progress })
						: undefined,
			};

			await EXECUTORS[format](this.api, options, forwardingHooks);
			this.events.$emit('export:success', { format });
		} catch (error) {
			this.events.$emit('export:error', { format, error: error as Error });
			throw error;
		}
	}
}
