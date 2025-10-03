import { Component } from '../base/Component';
import { overlayClasses } from '../../utils/classes';

export interface SelectOption<TValue extends string = string> {
  value: TValue;
  label: string;
}

export interface SelectInputProps<TValue extends string = string> {
  id?: string;
  options: SelectOption<TValue>[];
  defaultValue?: TValue;
}

export class SelectInput<TValue extends string = string> extends Component<SelectInputProps<TValue>> {
  private props: SelectInputProps<TValue>;
  private select!: HTMLSelectElement;
  private readonly handleChange = () => {
    this.props.defaultValue = this.select.value as TValue;
  };

  constructor(props: SelectInputProps<TValue>) {
    super();
    this.props = props;
  }

  render(): HTMLElement {
    this.select = document.createElement('select');
    this.select.classList.add(overlayClasses.input);
    if (this.props.id) {
      this.select.id = this.props.id;
    }
    this.populateOptions();
    this.select.addEventListener('change', this.handleChange);
    return this.select;
  }

  get selectElement(): HTMLSelectElement {
    return this.select;
  }

  get value(): TValue {
    return this.select.value as TValue;
  }

  set value(next: TValue) {
    if (this.select) {
      this.select.value = next;
    }
    this.props.defaultValue = next;
  }

  protected _onUnmount(): void {
    this.select.removeEventListener('change', this.handleChange);
  }

  protected onUpdate(props: SelectInputProps<TValue>): void {
    this.props = props;
    this.populateOptions();
    if (props.defaultValue) {
      this.select.value = props.defaultValue;
    }
  }

  update(partial: Partial<SelectInputProps<TValue>>): void {
    this.props = { ...this.props, ...partial };
    if (!this.select) {
      return;
    }
    if (partial.id) {
      this.select.id = partial.id;
    }
    if (partial.options) {
      this.populateOptions();
    }
    if (partial.defaultValue !== undefined) {
      this.select.value = partial.defaultValue;
    }
  }

  private populateOptions(): void {
    if (!this.select) {
      return;
    }
    this.select.innerHTML = '';
    for (const option of this.props.options) {
      const optionElement = document.createElement('option');
      optionElement.value = option.value;
      optionElement.textContent = option.label;
      this.select.appendChild(optionElement);
    }
    if (this.props.defaultValue) {
      this.select.value = this.props.defaultValue;
    }
  }
}
