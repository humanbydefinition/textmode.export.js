export type ComponentUpdate<TProps> = (props: TProps) => void;

export abstract class Component<TProps = void> {
  protected element?: HTMLElement;
  private mounted = false;
  private destroyed = false;

  abstract render(): HTMLElement;

  mount(container: HTMLElement): void {
    if (this.destroyed) {
      throw new Error('Cannot mount a destroyed component');
    }
    if (this.mounted) {
      return;
    }
    const node = this.render();
    container.appendChild(node);
    this.element = node;
    this.onMount();
    this.mounted = true;
  }

  unmount(): void {
    if (!this.mounted || !this.element) {
      return;
    }
    this._onUnmount();
    this.element.remove();
    this.element = undefined;
    this.mounted = false;
  }

  destroy(): void {
    if (this.destroyed) {
      return;
    }
    this.unmount();
    this._onDestroy();
    this.destroyed = true;
  }

  update(props: TProps): void {
    if (!this.mounted) {
      return;
    }
    this.onUpdate(props);
  }

  protected onMount(): void {
    // Optional hook
  }

  protected _onUnmount(): void {
    // Optional hook
  }

  protected _onDestroy(): void {
    // Optional hook
  }

  protected onUpdate(_props: TProps): void {
    // Optional hook
  }

  get root(): HTMLElement {
    if (!this.element) {
      throw new Error('Component is not mounted yet');
    }
    return this.element;
  }

  isMounted(): boolean {
    return this.mounted;
  }
}
