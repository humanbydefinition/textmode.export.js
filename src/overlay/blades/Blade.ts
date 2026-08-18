import type { ExportFormat } from '../types';
import { Component } from '../components/base/Component';
import type { LayerTargetProvider } from '../../exporters/base';

interface ManagedComponent {
	unmount(): void;
	destroy(): void;
}

export interface BladeCapabilities {
	clipboard: boolean;
	layerTarget: boolean;
	recording: boolean;
}

export interface BladeConfig<TOptions> {
	label: string;
	supportsClipboard: boolean;
	format: ExportFormat;
	defaultOptions: TOptions;
	layerTargetProvider?: LayerTargetProvider;
	videoDimensionsProvider?: () => { width: number; height: number };
}

export abstract class Blade<TOptions> extends Component<void> {
	readonly capabilities: BladeCapabilities;
	protected _config: BladeConfig<TOptions>;
	private readonly _managedComponents = new Set<ManagedComponent>();

	constructor(config: BladeConfig<TOptions>, capabilities?: Partial<BladeCapabilities>) {
		super();
		this._config = config;
		this.capabilities = {
			clipboard: config.supportsClipboard,
			layerTarget: !!config.layerTargetProvider,
			recording: false,
			...capabilities,
		};
	}

	abstract getOptions(): TOptions;
	abstract reset(): void;
	abstract validate(): boolean;
	abstract setDefaults(values: Partial<TOptions>): void;

	protected _manageComponent<TComponent extends ManagedComponent>(component: TComponent): TComponent {
		this._managedComponents.add(component);
		return component;
	}

	protected override _onUnmount(): void {
		for (const component of this._managedComponents) {
			component.unmount();
		}
	}

	protected override _onDestroy(): void {
		for (const component of this._managedComponents) {
			component.destroy();
		}
		this._managedComponents.clear();
	}
}
