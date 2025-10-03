import type { TXTExportOptions } from '../../exporters/txt';
import type { BladeConfig } from './Blade';
import { Blade } from './Blade';
export declare class TextBlade extends Blade<TXTExportOptions> {
    private trailingSpaces;
    private emptyCharacter;
    constructor(config: BladeConfig<TXTExportOptions>);
    render(): HTMLElement;
    getOptions(): TXTExportOptions;
    reset(): void;
    validate(): boolean;
    private applyDefaults;
}
//# sourceMappingURL=TextBlade.d.ts.map