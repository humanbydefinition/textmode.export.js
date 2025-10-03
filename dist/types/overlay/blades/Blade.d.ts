import type { ExportFormat } from '../types';
import { Component } from '../components/base/Component';
export interface BladeConfig<TOptions> {
    label: string;
    supportsClipboard: boolean;
    format: ExportFormat;
    defaultOptions: TOptions;
}
export declare abstract class Blade<TOptions> extends Component<void> {
    protected readonly _config: BladeConfig<TOptions>;
    private readonly _managedComponents;
    constructor(config: BladeConfig<TOptions>);
    abstract getOptions(): TOptions;
    abstract reset(): void;
    abstract validate(): boolean;
    protected _manageComponent<TComponent extends Component<any>>(component: TComponent): TComponent;
    protected _onUnmount(): void;
    protected _onDestroy(): void;
}
//# sourceMappingURL=Blade.d.ts.map