import { Component } from '../base/Component';
import { overlayClasses } from '../../utils/classes';

export type ButtonVariant = 'primary' | 'secondary';

export interface ButtonProps {
  label: string;
  disabled?: boolean;
  fullWidth?: boolean;
  variant?: ButtonVariant;
}

export class Button extends Component<ButtonProps> {
  private props: ButtonProps;
  private button!: HTMLButtonElement;

  constructor(props: ButtonProps) {
    super();
    this.props = props;
  }

  render(): HTMLElement {
    this.button = document.createElement('button');
    this.button.type = 'button';
    this.button.textContent = this.props.label;
    this.button.classList.add(overlayClasses.button);
    if (this.props.variant === 'secondary') {
      this.button.classList.add(overlayClasses.buttonSecondary);
    } else {
      this.button.classList.add(overlayClasses.buttonPrimary);
    }
    if (this.props.fullWidth) {
      this.button.classList.add(overlayClasses.buttonFull);
    }
    this.button.disabled = Boolean(this.props.disabled);
    return this.button;
  }

  get buttonElement(): HTMLButtonElement {
    return this.button;
  }

  setLabel(label: string): void {
    this.props.label = label;
    this.button.textContent = label;
  }

  setDisabled(disabled: boolean): void {
    this.props.disabled = disabled;
    this.button.disabled = disabled;
  }

  protected onUpdate(props: ButtonProps): void {
    this.props = props;
    this.button.textContent = props.label;
    this.button.disabled = Boolean(props.disabled);
    if (props.variant === 'secondary') {
      this.button.classList.add(overlayClasses.buttonSecondary);
      this.button.classList.remove(overlayClasses.buttonPrimary);
    } else {
      this.button.classList.add(overlayClasses.buttonPrimary);
      this.button.classList.remove(overlayClasses.buttonSecondary);
    }
    this.button.classList.toggle(overlayClasses.buttonFull, Boolean(props.fullWidth));
  }
}
