import type { ExportFormat } from '../types';
import type { TextmodeExportAPI } from '../../types';
export declare class ClipboardService {
    private readonly api;
    constructor(api: TextmodeExportAPI);
    $copy(format: ExportFormat, options: unknown): Promise<void>;
}
//# sourceMappingURL=ClipboardService.d.ts.map