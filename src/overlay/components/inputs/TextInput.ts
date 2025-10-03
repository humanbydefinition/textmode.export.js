import { Component } from '../base/Component';
import { overlayClasses } from '../../utils/classes';

export interface TextInputProps {
  id?: string;
  defaultValue?: string;
  maxLength?: number;
}

export class TextInput extends Component<TextInputProps> {
  private props: TextInputProps;
  private input!: HTMLInputElement;
  private readonly handleInput = () => {
    this.props.defaultValue = this.input.value;
  };

  constructor(props: TextInputProps) {
    super();
    this.props = props;
  }

  render(): HTMLElement {
    this.input = document.createElement('input');
    this.input.type = 'text';
    this.input.classList.add(overlayClasses.input);
    if (this.props.id) {
      this.input.id = this.props.id;
    }
    if (this.props.maxLength !== undefined) {
      this.input.maxLength = this.props.maxLength;
    }
    if (this.props.defaultValue !== undefined) {
      this.input.value = this.props.defaultValue;
    }
    this.input.addEventListener('input', this.handleInput);
    return this.input;
  }

  get inputElement(): HTMLInputElement {
    return this.input;
  }

  get value(): string {
    return this.input.value;
  }

  set value(next: string) {
    this.input.value = next;
  }

  protected _onUnmount(): void {
    this.input.removeEventListener('input', this.handleInput);
  }

  protected onUpdate(props: TextInputProps): void {
    this.props = props;
    if (props.id) {
      this.input.id = props.id;
    }
    if (props.maxLength !== undefined) {
      this.input.maxLength = props.maxLength;
    }
    if (props.defaultValue !== undefined) {
      this.input.value = props.defaultValue;
    }
  }
}
