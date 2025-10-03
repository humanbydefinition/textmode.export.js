import { Component } from '../base/Component';
import { overlayClasses } from '../../utils/classes';

export type StatusVariant = 'neutral' | 'active' | 'alert';

const VARIANT_CLASS: Record<StatusVariant, string> = {
  neutral: 'textmode-export-overlay__status-value--neutral',
  active: 'textmode-export-overlay__status-value--active',
  alert: 'textmode-export-overlay__status-value--alert',
};

export interface StatusDisplayProps {
  title: string;
  message: string;
  variant?: StatusVariant;
  context?: 'gif' | 'video' | 'default';
}

export class StatusDisplay extends Component<StatusDisplayProps> {
  private props: StatusDisplayProps;
  private container!: HTMLDivElement;
  private messageElement!: HTMLSpanElement;

  constructor(props: StatusDisplayProps) {
    super();
    this.props = props;
  }

  render(): HTMLElement {
    this.container = document.createElement('div');
    this.container.classList.add(overlayClasses.status);
    if (this.props.context === 'gif') {
      this.container.classList.add(overlayClasses.statusGif);
    } else if (this.props.context === 'video') {
      this.container.classList.add(overlayClasses.statusVideo);
    }

    const title = document.createElement('span');
    title.classList.add(overlayClasses.statusTitle);
    title.textContent = this.props.title;

    this.messageElement = document.createElement('span');
    this.messageElement.classList.add(overlayClasses.statusValue);
    this.messageElement.textContent = this.props.message;
    this.applyVariant(this.props.variant ?? 'neutral');

    this.container.appendChild(title);
    this.container.appendChild(this.messageElement);
    return this.container;
  }

  setMessage(message: string, variant: StatusVariant = 'neutral'): void {
    this.messageElement.textContent = message;
    this.applyVariant(variant);
  }

  protected onUpdate(props: StatusDisplayProps): void {
    this.props = props;
    this.setMessage(props.message, props.variant ?? 'neutral');
  }

  private applyVariant(variant: StatusVariant): void {
    this.messageElement.classList.remove(...Object.values(VARIANT_CLASS));
    this.messageElement.classList.add(VARIANT_CLASS[variant]);
  }
}
