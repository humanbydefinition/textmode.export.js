import type { TextmodeLayer } from 'textmode.js';
import type { LayerTargetProvider } from '../../../exporters/base';
import { Field } from '../base/Field';
import { Component } from '../base/Component';
import { SelectInput } from './SelectInput';

export interface LayerTargetSelectProps {
	id: string;
	provider: LayerTargetProvider;
}

export class LayerTargetSelect extends Component<void> {
	private readonly provider: LayerTargetProvider;
	private readonly field: Field;
	private readonly select: SelectInput<string>;

	constructor(props: LayerTargetSelectProps) {
		super();
		this.provider = props.provider;
		this.field = new Field({
			label: 'layer',
			labelFor: props.id,
			variant: 'full',
		});
		this.select = new SelectInput<string>({
			id: props.id,
			options: [],
			defaultValue: props.provider.getDefaultId(),
		});
	}

	render(): HTMLElement {
		const container = document.createElement('div');
		this.field.mount(container);
		this.refresh();
		this.select.mount(this.field.root);
		return container;
	}

	get layer(): TextmodeLayer | undefined {
		const layer = this.provider.getLayerById(this.select.value);
		if (layer) {
			return layer;
		}

		const fallback = this.provider.getDefaultId();
		this.select.value = fallback;
		return this.provider.getLayerById(fallback);
	}

	setDisabled(disabled: boolean): void {
		this.select.selectElement.disabled = disabled;
	}

	refresh(): void {
		const options = this.provider.getOptions();
		const currentValue = this.select.isMounted() ? this.select.value : this.provider.getDefaultId();
		const nextValue = options.some((option) => option.id === currentValue)
			? currentValue
			: this.provider.getDefaultId();
		this.select.update({
			options: options.map((option) => ({ value: option.id, label: option.label })),
			defaultValue: nextValue,
		});
		this.select.value = nextValue;
	}

	protected _onUnmount(): void {
		this.select.unmount();
		this.field.unmount();
	}

	protected _onDestroy(): void {
		this.select.destroy();
		this.field.destroy();
	}
}
