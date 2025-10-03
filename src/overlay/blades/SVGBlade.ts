import type { SVGExportOptions } from '../../exporters/svg';
import { overlayClasses } from '../utils/classes';
import { CheckboxInput } from '../components/inputs/CheckboxInput';
import { SelectInput } from '../components/inputs/SelectInput';
import { NumberInput } from '../components/inputs/NumberInput';
import { Field } from '../components/base/Field';
import { Container } from '../components/base/Container';
import type { BladeConfig } from './Blade';
import { Blade } from './Blade';

export class SVGBlade extends Blade<SVGExportOptions> {
  private includeBackground = this._manageComponent(
    new CheckboxInput({
    id: 'textmode-export-svg-include-backgrounds',
    label: 'include cell backgrounds',
    defaultChecked: true,
    }),
  );

  private drawMode = this._manageComponent(
    new SelectInput<NonNullable<SVGExportOptions['drawMode']>>({
    id: 'textmode-export-svg-draw-mode',
    options: [
      { value: 'fill', label: 'fill' },
      { value: 'stroke', label: 'stroke' },
    ],
    defaultValue: 'fill',
    }),
  );

  private strokeWidth = this._manageComponent(
    new NumberInput({
    defaultValue: '1',
    attributes: { min: '0', step: '0.1' },
    }),
  );

  constructor(config: BladeConfig<SVGExportOptions>) {
    super(config);
  }

  render(): HTMLElement {
    const container = document.createElement('div');
    container.classList.add(overlayClasses.stack);

    this.includeBackground.mount(container);

    const row = new Container('row');
    row.mount(container);

    const drawModeField = new Field({
      label: 'draw mode',
      labelFor: 'textmode-export-svg-draw-mode',
      variant: 'compact',
    });
    drawModeField.mount(row.root);
    this.drawMode.mount(drawModeField.root);

    const strokeWidthField = new Field({
      label: 'stroke width',
      labelFor: 'textmode-export-svg-stroke-width',
      variant: 'compact',
    });
    strokeWidthField.mount(row.root);
    this.strokeWidth.mount(strokeWidthField.root);
    this.strokeWidth.inputElement.id = 'textmode-export-svg-stroke-width';

    this.drawMode.selectElement.addEventListener('change', () => this.updateStrokeControls());
    this.updateStrokeControls();

    return container;
  }

  getOptions(): SVGExportOptions {
    return {
      includeBackgroundRectangles: this.includeBackground.checked,
      drawMode: this.drawMode.value,
      strokeWidth: Number.parseFloat(this.strokeWidth.value),
    };
  }

  reset(): void {
    this.applyDefaults();
    this.updateStrokeControls();
  }

  validate(): boolean {
    const value = Number.parseFloat(this.strokeWidth.value);
    if (this.drawMode.value === 'stroke') {
      return Number.isFinite(value) && value >= 0;
    }
    return true;
  }

  private updateStrokeControls(): void {
    const isStroke = this.drawMode.value === 'stroke';
    this.strokeWidth.inputElement.disabled = !isStroke;
    this.strokeWidth.refresh();
  }

  private applyDefaults(): void {
    const defaults = this._config.defaultOptions ?? {};
    this.includeBackground.checked = defaults.includeBackgroundRectangles ?? true;
    this.drawMode.value = (defaults.drawMode as NonNullable<SVGExportOptions['drawMode']>) ?? 'fill';
    const strokeWidth = defaults.strokeWidth ?? 1;
    this.strokeWidth.value = String(strokeWidth);
    this.strokeWidth.refresh();
  }
}
