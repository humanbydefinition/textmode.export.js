import type { JSONExportColorMode, JSONExportOptions, JSONExportTarget } from '../../exporters/json';
import { overlayClasses } from '../utils/classes';
import { CheckboxInput } from '../components/inputs/CheckboxInput';
import { Field } from '../components/base/Field';
import { SelectInput } from '../components/inputs/SelectInput';
import { LayerTargetSelect } from '../components/inputs/LayerTargetSelect';
import type { BladeConfig } from './Blade';
import { Blade } from './Blade';

export class JSONBlade extends Blade<JSONExportOptions> {
	private readonly layerTarget?: LayerTargetSelect;
	private layerTargetContainer?: HTMLElement;

	private target = this._manageComponent(
		new SelectInput<JSONExportTarget>({
			id: 'textmode-export-json-target',
			options: [
				{ value: 'selected', label: 'selected layer' },
				{ value: 'all', label: 'all layers' },
			],
			defaultValue: 'selected',
		})
	);

	private prettyPrint = this._manageComponent(
		new CheckboxInput({
			id: 'textmode-export-json-pretty',
			label: 'pretty print',
			defaultChecked: true,
		})
	);

	private includeMetadata = this._manageComponent(
		new CheckboxInput({
			id: 'textmode-export-json-metadata',
			label: 'include metadata',
			defaultChecked: true,
		})
	);

	private colorMode = this._manageComponent(
		new SelectInput<JSONExportColorMode>({
			id: 'textmode-export-json-color-mode',
			options: [
				{ value: 'hex', label: 'hex' },
				{ value: 'rgba', label: 'rgba' },
			],
			defaultValue: 'hex',
		})
	);

	constructor(config: BladeConfig<JSONExportOptions>) {
		super(config);
		if (config.layerTargetProvider) {
			this.layerTarget = this._manageComponent(
				new LayerTargetSelect({
					id: 'textmode-export-json-layer',
					provider: config.layerTargetProvider,
				})
			);
		}
	}

	render(): HTMLElement {
		const container = document.createElement('div');
		container.classList.add(overlayClasses.stack);

		const targetField = new Field({
			label: 'target',
			labelFor: 'textmode-export-json-target',
			variant: 'full',
		});
		targetField.mount(container);
		this.target.mount(targetField.root);
		this.target.selectElement.addEventListener('change', () => this.updateLayerTargetVisibility());

		if (this.layerTarget) {
			this.layerTargetContainer = document.createElement('div');
			this.layerTarget.mount(this.layerTargetContainer);
			container.appendChild(this.layerTargetContainer);
		}

		this.prettyPrint.mount(container);
		this.includeMetadata.mount(container);

		const colorField = new Field({
			label: 'color mode',
			labelFor: 'textmode-export-json-color-mode',
			variant: 'full',
		});
		colorField.mount(container);
		this.colorMode.mount(colorField.root);
		this.updateLayerTargetVisibility();

		return container;
	}

	getOptions(): JSONExportOptions {
		const target = this.target.value;
		return {
			target,
			layer: target === 'selected' ? this.layerTarget?.layer : undefined,
			pretty: this.prettyPrint.checked,
			includeMetadata: this.includeMetadata.checked,
			colorMode: this.colorMode.value,
		};
	}

	reset(): void {
		this.applyDefaults();
	}

	validate(): boolean {
		return true;
	}

	refreshLayerTargets(): void {
		this.layerTarget?.refresh();
	}

	private applyDefaults(): void {
		const defaults = this._config.defaultOptions ?? {};
		this.target.value = defaults.target ?? 'selected';
		this.prettyPrint.checked =
			typeof defaults.pretty === 'number' ? defaults.pretty > 0 : (defaults.pretty ?? true);
		this.includeMetadata.checked = defaults.includeMetadata ?? true;
		this.colorMode.value = defaults.colorMode ?? 'hex';
		this.updateLayerTargetVisibility();
	}

	private updateLayerTargetVisibility(): void {
		const isSelectedTarget = this.target.value === 'selected';
		if (this.layerTargetContainer) {
			this.layerTargetContainer.style.display = isSelectedTarget ? '' : 'none';
		}
		this.layerTarget?.setDisabled(!isSelectedTarget);
	}
}
