import { Component } from '../base/Component';
import { overlayClasses } from '../../utils/classes';

export interface CheckboxInputProps {
  id?: string;
  label: string;
  defaultChecked?: boolean;
}

export class CheckboxInput extends Component<CheckboxInputProps> {
  private props: CheckboxInputProps;
  private checkbox!: HTMLInputElement;
  private labelElement!: HTMLLabelElement;
  private readonly handleChange = () => {
    this.props.defaultChecked = this.checkbox.checked;
  };

  constructor(props: CheckboxInputProps) {
    super();
    this.props = props;
  }

  render(): HTMLElement {
    this.labelElement = document.createElement('label');
    this.labelElement.classList.add(overlayClasses.checkbox);

    this.checkbox = document.createElement('input');
    this.checkbox.type = 'checkbox';
    if (this.props.id) {
      this.checkbox.id = this.props.id;
    }
    this.checkbox.checked = Boolean(this.props.defaultChecked);
  this.checkbox.addEventListener('change', this.handleChange);

    const text = document.createElement('span');
    text.textContent = this.props.label;

    this.labelElement.htmlFor = this.props.id ?? '';
    this.labelElement.appendChild(this.checkbox);
    this.labelElement.appendChild(text);

    return this.labelElement;
  }

  get inputElement(): HTMLInputElement {
    return this.checkbox;
  }

  get checked(): boolean {
    return this.checkbox.checked;
  }

  set checked(value: boolean) {
    this.checkbox.checked = value;
  }

  protected _onUnmount(): void {
    this.checkbox.removeEventListener('change', this.handleChange);
  }

  protected onUpdate(props: CheckboxInputProps): void {
    this.props = props;
    if (props.id) {
      this.checkbox.id = props.id;
      this.labelElement.htmlFor = props.id;
    }
    this.checkbox.checked = Boolean(props.defaultChecked);
    if (this.labelElement.lastElementChild) {
      this.labelElement.lastElementChild.textContent = props.label;
    }
  }
}
