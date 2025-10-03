import { Component } from '../base/Component';

export interface NumberInputProps {
  defaultValue: string;
  attributes?: Partial<HTMLInputElement>;
  formatDisplay?: (numericValue: number, rawValue: string, input: HTMLInputElement) => string | null | undefined;
}

const WRAPPER_CLASS = 'textmode-export-number-input';
const FIELD_CLASS = `${WRAPPER_CLASS}__field`;
const CONTROLS_CLASS = `${WRAPPER_CLASS}__controls`;
const CONTROL_CLASS = `${WRAPPER_CLASS}__control`;
const DISPLAY_CLASS = `${WRAPPER_CLASS}__display`;
const DISPLAY_VISIBLE_CLASS = `${DISPLAY_CLASS}--visible`;

const dispatchInputEvents = (target: HTMLInputElement) => {
  target.dispatchEvent(new Event('input', { bubbles: true }));
  target.dispatchEvent(new Event('change', { bubbles: true }));
};

const createStepperButton = (direction: 1 | -1): HTMLButtonElement => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = CONTROL_CLASS;
  button.textContent = direction > 0 ? '▲' : '▼';
  return button;
};

export class NumberInput extends Component<NumberInputProps> {
  private props: NumberInputProps;
  private input!: HTMLInputElement;
  private display!: HTMLDivElement;
  private incrementButton!: HTMLButtonElement;
  private decrementButton!: HTMLButtonElement;
  private suppressClickAfterPointer = new WeakMap<HTMLButtonElement, boolean>();
  private holdTimeoutId: number | undefined;
  private holdIntervalId: number | undefined;
  private activePointerId: number | undefined;
  private disabledObserver?: MutationObserver;

  constructor(props: NumberInputProps) {
    super();
    this.props = props;
  }

  render(): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.className = WRAPPER_CLASS;

    this.input = document.createElement('input');
    this.input.type = 'number';
    this.input.value = this.props.defaultValue;
    Object.assign(this.input, this.props.attributes);
    this.input.className = FIELD_CLASS;

    this.display = document.createElement('div');
    this.display.className = DISPLAY_CLASS;

    const controls = document.createElement('div');
    controls.className = CONTROLS_CLASS;
    this.incrementButton = createStepperButton(1);
    this.decrementButton = createStepperButton(-1);
    controls.appendChild(this.incrementButton);
    controls.appendChild(this.decrementButton);

    wrapper.appendChild(this.input);
    wrapper.appendChild(this.display);
    wrapper.appendChild(controls);

    this.bindStepControls();
    this.bindHoldBehavior();
    this.bindInputListeners();
    this.observeDisabledState(wrapper);

    this.updateDisplay();

    return wrapper;
  }

  get inputElement(): HTMLInputElement {
    return this.input;
  }

  get value(): string {
    return this.input.value;
  }

  set value(next: string) {
    this.input.value = next;
    this.updateDisplay();
  }

  refresh(): void {
    this.updateDisplay();
  }

  protected _onDestroy(): void {
    this.clearHoldTimers();
    this.disabledObserver?.disconnect();
  }

  private bindStepControls(): void {
    const handleStep = (direction: 1 | -1) => () => {
      if (this.input.disabled) {
        return;
      }

      const previousValue = this.input.value;
      const stepAttribute = this.input.getAttribute('step');
      if (stepAttribute && stepAttribute !== 'any') {
        direction > 0 ? this.input.stepUp() : this.input.stepDown();
      } else {
        const delta = direction > 0 ? 1 : -1;
        const numericValue = Number.parseFloat(this.input.value || '0');
        const nextValue = Number.isFinite(numericValue) ? numericValue + delta : delta;
        this.input.value = String(nextValue);
      }

      if (this.input.value !== previousValue) {
        dispatchInputEvents(this.input);
      }

      this.updateDisplay();
      this.input.focus({ preventScroll: true });
    };

    const increment = handleStep(1);
    const decrement = handleStep(-1);

    const createClickHandler = (button: HTMLButtonElement, action: () => void) => (event: MouseEvent) => {
      if (this.suppressClickAfterPointer.get(button)) {
        this.suppressClickAfterPointer.set(button, false);
        event.preventDefault();
        return;
      }
      action();
    };

    this.incrementButton.addEventListener('click', createClickHandler(this.incrementButton, increment));
    this.decrementButton.addEventListener('click', createClickHandler(this.decrementButton, decrement));
  }

  private bindHoldBehavior(): void {
    const attachHoldBehavior = (button: HTMLButtonElement, direction: 1 | -1) => {
      const performStep = direction > 0 ? () => this.incrementButton.click() : () => this.decrementButton.click();

      button.addEventListener('pointerdown', (event) => {
        if (event.button !== 0) {
          return;
        }
        event.preventDefault();
        this.suppressClickAfterPointer.set(button, true);
        this.activePointerId = event.pointerId;
        try {
          button.setPointerCapture(event.pointerId);
        } catch (error) {
          // Ignore capture errors
        }
        performStep();
        this.holdTimeoutId = window.setTimeout(() => {
          this.holdIntervalId = window.setInterval(performStep, 80);
        }, 380);
      });

      const releasePointerCapture = () => {
        if (this.activePointerId !== undefined) {
          try {
            button.releasePointerCapture(this.activePointerId);
          } catch (error) {
            // Ignore
          }
          this.activePointerId = undefined;
        }
      };

      const finalizePointerSequence = () => {
        this.clearHoldTimers();
        releasePointerCapture();
      };

      button.addEventListener('pointerup', finalizePointerSequence);
      button.addEventListener('pointerleave', finalizePointerSequence);
      button.addEventListener('pointercancel', finalizePointerSequence);
    };

    attachHoldBehavior(this.incrementButton, 1);
    attachHoldBehavior(this.decrementButton, -1);
  }

  private bindInputListeners(): void {
    const handleUpdate = () => {
      this.props.defaultValue = this.input.value;
      this.updateDisplay();
    };
    this.input.addEventListener('input', handleUpdate);
    this.input.addEventListener('change', handleUpdate);
  }

  private observeDisabledState(wrapper: HTMLDivElement): void {
    const syncDisabled = () => {
      const disabled = this.input.disabled;
      this.incrementButton.disabled = disabled;
      this.decrementButton.disabled = disabled;
      wrapper.classList.toggle('is-disabled', disabled);
      if (disabled) {
        this.display.classList.remove(DISPLAY_VISIBLE_CLASS);
        this.input.style.removeProperty('color');
        this.input.style.removeProperty('caretColor');
      } else {
        this.updateDisplay();
      }
    };

    if (typeof MutationObserver !== 'undefined') {
      this.disabledObserver = new MutationObserver(syncDisabled);
      this.disabledObserver.observe(this.input, { attributes: true, attributeFilter: ['disabled'] });
    }
    syncDisabled();
  }

  private updateDisplay(): void {
    const formatter = this.props.formatDisplay;
    if (!formatter) {
      this.display.textContent = '';
      this.display.classList.remove(DISPLAY_VISIBLE_CLASS);
      this.input.style.removeProperty('color');
      this.input.style.removeProperty('caretColor');
      return;
    }

    const rawValue = this.input.value;
    const numericValue = Number.parseFloat(rawValue);
    const formatted = formatter(Number.isFinite(numericValue) ? numericValue : Number.NaN, rawValue, this.input);

    if (formatted) {
      this.display.textContent = formatted;
      this.display.classList.add(DISPLAY_VISIBLE_CLASS);
      this.input.style.color = 'transparent';
      this.input.style.caretColor = '#f8fafc';
    } else {
      this.display.textContent = '';
      this.display.classList.remove(DISPLAY_VISIBLE_CLASS);
      this.input.style.removeProperty('color');
      this.input.style.removeProperty('caretColor');
    }
  }

  private clearHoldTimers(): void {
    if (this.holdTimeoutId !== undefined) {
      window.clearTimeout(this.holdTimeoutId);
      this.holdTimeoutId = undefined;
    }
    if (this.holdIntervalId !== undefined) {
      window.clearInterval(this.holdIntervalId);
      this.holdIntervalId = undefined;
    }
  }
}
