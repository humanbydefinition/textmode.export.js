import type { ExportFormat } from '../types';
import type { GIFExportProgress } from '../../exporters/gif';
import type { VideoExportProgress } from '../../exporters/video';
export interface OverlayEvents extends Record<string, unknown> {
    'format:change': {
        format: ExportFormat;
    };
    'export:request': {
        format: ExportFormat;
    };
    'export:progress': {
        format: ExportFormat;
        progress?: GIFExportProgress | VideoExportProgress;
    };
    'export:success': {
        format: ExportFormat;
    };
    'export:error': {
        format: ExportFormat;
        error: Error;
    };
    'clipboard:request': {
        format: ExportFormat;
    };
}
//# sourceMappingURL=OverlayEvents.d.ts.map