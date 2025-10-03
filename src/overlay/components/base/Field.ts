import { overlayClasses } from '../../utils/classes';
import { Component } from './Component';

export interface FieldProps {
  label: string;
  labelFor?: string;
  description?: string;
  variant?: 'default' | 'compact' | 'dense' | 'full' | 'channel';
}

export class Field extends Component<FieldProps> {
  private props: FieldProps;

  constructor(props: FieldProps) {
    super();
    this.props = props;
  }

  render(): HTMLElement {
    const element = document.createElement('div');
    element.classList.add(overlayClasses.field);
    this.applyVariant(element, this.props.variant);

    const label = document.createElement('label');
    label.classList.add(overlayClasses.label);
    label.textContent = this.props.label;
    if (this.props.labelFor) {
      label.htmlFor = this.props.labelFor;
    }
    element.appendChild(label);

    if (this.props.description) {
      const description = document.createElement('span');
      description.classList.add(overlayClasses.muted);
      description.textContent = this.props.description;
      element.appendChild(description);
    }

    return element;
  }

  attachControl(controlElement: HTMLElement): void {
    this.root.appendChild(controlElement);
  }

  update(props: FieldProps): void {
    this.props = props;
    super.update(props);
  }

  protected onUpdate(props: FieldProps): void {
    const element = this.root;
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
    this.props = props;
    element.classList.add(overlayClasses.field);
    this.applyVariant(element, props.variant);

    const label = document.createElement('label');
    label.classList.add(overlayClasses.label);
    label.textContent = props.label;
    if (props.labelFor) {
      label.htmlFor = props.labelFor;
    }
    element.appendChild(label);
    if (props.description) {
      const description = document.createElement('span');
      description.classList.add(overlayClasses.muted);
      description.textContent = props.description;
      element.appendChild(description);
    }
  }

  private applyVariant(element: HTMLElement, variant: FieldProps['variant']): void {
    element.classList.remove(
      overlayClasses.fieldCompact,
      overlayClasses.fieldDense,
      overlayClasses.fieldFull,
      overlayClasses.fieldChannel,
    );

    switch (variant) {
      case 'compact':
        element.classList.add(overlayClasses.fieldCompact);
        break;
      case 'dense':
        element.classList.add(overlayClasses.fieldDense);
        break;
      case 'full':
        element.classList.add(overlayClasses.fieldFull);
        break;
      case 'channel':
        element.classList.add(overlayClasses.fieldChannel);
        break;
      default:
        break;
    }
  }
}
