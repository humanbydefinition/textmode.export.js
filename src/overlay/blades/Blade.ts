import type { ExportFormat } from '../types';
import { Component } from '../components/base/Component';

export interface BladeConfig<TOptions> {
  label: string;
  supportsClipboard: boolean;
  format: ExportFormat;
  defaultOptions: TOptions;
}

export abstract class Blade<TOptions> extends Component<void> {
  protected readonly _config: BladeConfig<TOptions>;
  private readonly _managedComponents = new Set<Component<any>>();

  constructor(config: BladeConfig<TOptions>) {
    super();
    this._config = config;
  }

  abstract getOptions(): TOptions;
  abstract reset(): void;
  abstract validate(): boolean;

  protected _manageComponent<TComponent extends Component<any>>(component: TComponent): TComponent {
    this._managedComponents.add(component);
    return component;
  }

  protected _onUnmount(): void {
    for (const component of this._managedComponents) {
      component.unmount();
    }
  }

  protected _onDestroy(): void {
    for (const component of this._managedComponents) {
      component.destroy();
    }
    this._managedComponents.clear();
  }
}
