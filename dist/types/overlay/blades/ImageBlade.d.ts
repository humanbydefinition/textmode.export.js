import type { ImageExportOptions } from '../../exporters/image';
import type { BladeConfig } from './Blade';
import { Blade } from './Blade';
export declare class ImageBlade extends Blade<ImageExportOptions> {
    private formatSelect;
    private scaleInput;
    constructor(config: BladeConfig<ImageExportOptions>);
    render(): HTMLElement;
    getOptions(): ImageExportOptions;
    reset(): void;
    validate(): boolean;
    private applyDefaults;
}
//# sourceMappingURL=ImageBlade.d.ts.map