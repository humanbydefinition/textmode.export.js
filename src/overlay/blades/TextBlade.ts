import type { TXTExportOptions } from '../../exporters/txt';
import { overlayClasses } from '../utils/classes';
import { CheckboxInput } from '../components/inputs/CheckboxInput';
import { TextInput } from '../components/inputs/TextInput';
import { Field } from '../components/base/Field';
import type { BladeConfig } from './Blade';
import { Blade } from './Blade';

export class TextBlade extends Blade<TXTExportOptions> {
  private trailingSpaces = this._manageComponent(
    new CheckboxInput({
    label: 'preserve trailing spaces',
    defaultChecked: false,
    }),
  );

  private emptyCharacter = this._manageComponent(
    new TextInput({
    id: 'textmode-export-empty-character',
    defaultValue: ' ',
    maxLength: 1,
    }),
  );

  constructor(config: BladeConfig<TXTExportOptions>) {
    super(config);
  }

  render(): HTMLElement {
    const container = document.createElement('div');
    container.classList.add(overlayClasses.stack);

    this.trailingSpaces.mount(container);

    const emptyField = new Field({
      label: 'empty character',
      labelFor: 'textmode-export-empty-character',
      variant: 'full',
    });
    emptyField.mount(container);
    this.emptyCharacter.mount(emptyField.root);

    return container;
  }

  getOptions(): TXTExportOptions {
  const defaults = this._config.defaultOptions ?? {};
  const value = this.emptyCharacter.value || defaults.emptyCharacter || ' ';
    return {
      preserveTrailingSpaces: this.trailingSpaces.checked,
      emptyCharacter: value,
    };
  }

  reset(): void {
    this.applyDefaults();
  }

  validate(): boolean {
    const value = this.emptyCharacter.value;
    return value.length <= 1;
  }

  private applyDefaults(): void {
    const defaults = this._config.defaultOptions ?? {};
    this.trailingSpaces.checked = defaults.preserveTrailingSpaces ?? false;
    this.emptyCharacter.value = defaults.emptyCharacter ?? ' ';
  }
}
