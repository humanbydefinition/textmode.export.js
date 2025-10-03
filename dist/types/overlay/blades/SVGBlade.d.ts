import type { SVGExportOptions } from '../../exporters/svg';
import type { BladeConfig } from './Blade';
import { Blade } from './Blade';
export declare class SVGBlade extends Blade<SVGExportOptions> {
    private includeBackground;
    private drawMode;
    private strokeWidth;
    constructor(config: BladeConfig<SVGExportOptions>);
    render(): HTMLElement;
    getOptions(): SVGExportOptions;
    reset(): void;
    validate(): boolean;
    private updateStrokeControls;
    private applyDefaults;
}
//# sourceMappingURL=SVGBlade.d.ts.map