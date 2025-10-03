import type { ImageExportOptions, ImageFormat } from '../../exporters/image';
import { IMAGE_EXTENSIONS } from '../../exporters/image';
import { overlayClasses } from '../utils/classes';
import { SelectInput } from '../components/inputs/SelectInput';
import { NumberInput } from '../components/inputs/NumberInput';
import { Field } from '../components/base/Field';
import { Container } from '../components/base/Container';
import type { BladeConfig } from './Blade';
import { Blade } from './Blade';

export class ImageBlade extends Blade<ImageExportOptions> {
  private formatSelect = this._manageComponent(
    new SelectInput<ImageFormat>({
    id: 'textmode-export-image-format',
    options: [
      { value: 'png', label: `PNG (${IMAGE_EXTENSIONS.png})` },
      { value: 'jpg', label: `JPG (${IMAGE_EXTENSIONS.jpg})` },
      { value: 'webp', label: `WEBP (${IMAGE_EXTENSIONS.webp})` },
    ],
    defaultValue: 'png',
    }),
  );

  private scaleInput = this._manageComponent(
    new NumberInput({
    defaultValue: '1',
    attributes: { min: '0.1', step: '0.1' },
    }),
  );

  constructor(config: BladeConfig<ImageExportOptions>) {
    super(config);
  }

  render(): HTMLElement {
    const container = document.createElement('div');
    container.classList.add(overlayClasses.stack);

    const row = new Container('row');
    row.mount(container);

    const formatField = new Field({
      label: 'image format',
      labelFor: 'textmode-export-image-format',
      variant: 'compact',
    });
    formatField.mount(row.root);
    this.formatSelect.mount(formatField.root);

    const scaleField = new Field({
      label: 'scale',
      labelFor: 'textmode-export-image-scale',
      variant: 'dense',
    });
    scaleField.mount(row.root);
    this.scaleInput.mount(scaleField.root);
    this.scaleInput.inputElement.id = 'textmode-export-image-scale';

    return container;
  }

  getOptions(): ImageExportOptions {
    const parsedScale = Number.parseFloat(this.scaleInput.value);
    return {
      format: this.formatSelect.value,
      scale: Number.isFinite(parsedScale) ? parsedScale : (this._config.defaultOptions?.scale ?? 1),
    };
  }

  reset(): void {
    this.applyDefaults();
    this.scaleInput.refresh();
  }

  validate(): boolean {
    const scale = Number.parseFloat(this.scaleInput.value);
    return Number.isFinite(scale) && scale > 0;
  }

  private applyDefaults(): void {
    const defaults = this._config.defaultOptions ?? {};
    this.formatSelect.value = (defaults.format as ImageFormat) ?? 'png';
    const scale = defaults.scale ?? 1;
    this.scaleInput.value = String(scale);
  }
}
