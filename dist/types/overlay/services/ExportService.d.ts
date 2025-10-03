import type { ExportFormat } from '../types';
import type { TextmodeExportAPI } from '../../types';
import type { OverlayEvents } from '../models/OverlayEvents';
import type { GIFExportProgress } from '../../exporters/gif';
import type { VideoExportProgress } from '../../exporters/video';
import { EventBus } from '../core/EventBus';
export interface ExportHooks {
    onGIFProgress?: (progress: GIFExportProgress) => void;
    onVideoProgress?: (progress: VideoExportProgress) => void;
}
export declare class ExportService {
    private readonly api;
    private readonly events;
    constructor(api: TextmodeExportAPI, events: EventBus<OverlayEvents>);
    $requestExport(format: ExportFormat, options: unknown, hooks?: ExportHooks): Promise<void>;
    private _execute;
}
//# sourceMappingURL=ExportService.d.ts.map