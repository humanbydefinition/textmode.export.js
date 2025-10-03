import type { ExportFormat } from '../types';
import type { Blade } from '../blades';
export interface FormatDefinition<TFormat extends ExportFormat = ExportFormat, TBlade extends Blade<any> = Blade<any>> {
    readonly format: TFormat;
    readonly label: string;
    readonly supportsClipboard: boolean;
    createBlade(): TBlade;
}
//# sourceMappingURL=FormatDefinition.d.ts.map