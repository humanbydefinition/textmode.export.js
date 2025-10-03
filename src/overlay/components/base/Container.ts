import { overlayClasses } from '../../utils/classes';
import { Component } from './Component';

export type ContainerVariant = 'stack' | 'stackDense' | 'stackCompact' | 'row' | 'section';

export class Container extends Component<void> {
  private readonly variant: ContainerVariant;
  private readonly additionalClasses: string[];

  constructor(variant: ContainerVariant = 'stack', additionalClasses: string[] = []) {
    super();
    this.variant = variant;
    this.additionalClasses = additionalClasses;
  }

  render(): HTMLElement {
    const element = document.createElement('div');
    const classes = [
      this.variant === 'stack' ? overlayClasses.stack : undefined,
      this.variant === 'stackDense' ? overlayClasses.stackDense : undefined,
      this.variant === 'stackCompact' ? overlayClasses.stackCompact : undefined,
      this.variant === 'row' ? overlayClasses.row : undefined,
      this.variant === 'section' ? overlayClasses.section : undefined,
      ...this.additionalClasses,
    ].filter(Boolean);

    element.classList.add(...(classes as string[]));
    return element;
  }
}
