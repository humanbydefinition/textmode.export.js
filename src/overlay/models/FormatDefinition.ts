import type { ExportFormat, ExportOptionsMap } from '../types';
import type { Blade } from '../blades';

export interface FormatDefinition<TFormat extends ExportFormat = ExportFormat> {
	readonly format: TFormat;
	readonly label: string;
	readonly supportsClipboard: boolean;
	createBlade(): Blade<ExportOptionsMap[TFormat]>;
}
