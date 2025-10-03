import { Component } from '../base/Component';

export interface RangeInputProps {
  defaultValue: string;
  attributes?: Partial<HTMLInputElement>;
  formatValue?: (value: number, input: HTMLInputElement) => string;
}

const WRAPPER_CLASS = 'textmode-export-range-input';
const FIELD_CLASS = `${WRAPPER_CLASS}__field`;
const TOOLTIP_CLASS = `${WRAPPER_CLASS}__tooltip`;
const TOOLTIP_VISIBLE_CLASS = `${WRAPPER_CLASS}__tooltip--visible`;

const parseNumber = (value: string | null | undefined, fallback: number): number => {
  if (typeof value !== 'string' || value.length === 0) {
    return fallback;
  }
  const numeric = Number.parseFloat(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export class RangeInput extends Component<RangeInputProps> {
  private props: RangeInputProps;
  private input!: HTMLInputElement;
  private tooltip!: HTMLDivElement;
  private hoverActive = false;
  private focusActive = false;
  private pointerActive = false;
  private suppressFocusFromPointer = false;
  private activePointerId: number | undefined;
  private disabledObserver?: MutationObserver;
  private resizeObserver?: ResizeObserver;

  constructor(props: RangeInputProps) {
    super();
    this.props = props;
  }

  render(): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.className = WRAPPER_CLASS;

    this.input = document.createElement('input');
    this.input.type = 'range';
    this.input.value = this.props.defaultValue;
    Object.assign(this.input, this.props.attributes);
    this.input.className = FIELD_CLASS;

    this.tooltip = document.createElement('div');
    this.tooltip.className = TOOLTIP_CLASS;

    wrapper.appendChild(this.input);
    wrapper.appendChild(this.tooltip);

    this.bindEvents(wrapper);
    this.updateTooltip();
    this.syncDisabledState(wrapper);

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
    this.updateTooltip();
  }

  protected _onDestroy(): void {
    this.disabledObserver?.disconnect();
    this.resizeObserver?.disconnect();
  }

  private bindEvents(wrapper: HTMLElement): void {
    this.input.addEventListener('pointerenter', () => {
      this.hoverActive = true;
      this.refreshTooltipVisibility();
    });

    this.input.addEventListener('pointerleave', () => {
      this.hoverActive = false;
      this.refreshTooltipVisibility();
    });

    this.input.addEventListener('focus', () => {
      let allowFocusTooltip = false;
      try {
        allowFocusTooltip = this.input.matches(':focus-visible');
      } catch (error) {
        allowFocusTooltip = !this.suppressFocusFromPointer;
      }

      if (!this.suppressFocusFromPointer && allowFocusTooltip && !this.input.disabled) {
        this.focusActive = true;
      } else {
        this.focusActive = false;
      }
      this.suppressFocusFromPointer = false;
      this.refreshTooltipVisibility();
    });

    this.input.addEventListener('blur', () => {
      this.focusActive = false;
      this.refreshTooltipVisibility();
    });

    this.input.addEventListener('pointerdown', (event) => {
      this.pointerActive = true;
      this.suppressFocusFromPointer = true;
      this.hoverActive = true;
      this.refreshTooltipVisibility();
      try {
        this.input.setPointerCapture(event.pointerId);
        this.activePointerId = event.pointerId;
      } catch (error) {
        this.activePointerId = undefined;
      }
    });

    const handlePointerEnd = () => {
      this.pointerActive = false;
      this.suppressFocusFromPointer = false;
      this.hoverActive = this.input.matches(':hover');
      this.releasePointerCapture();
      this.refreshTooltipVisibility();
    };

    this.input.addEventListener('pointerup', handlePointerEnd);
    this.input.addEventListener('pointercancel', handlePointerEnd);
    this.input.addEventListener('lostpointercapture', handlePointerEnd);

    this.input.addEventListener('input', () => {
      if (this.hoverActive || this.focusActive || this.pointerActive) {
        this.updateTooltip();
      }
      this.props.defaultValue = this.input.value;
    });

    this.input.addEventListener('change', () => {
      if (!this.pointerActive) {
        this.updateTooltip();
      }
      this.props.defaultValue = this.input.value;
    });

    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        if (this.tooltip.classList.contains(TOOLTIP_VISIBLE_CLASS)) {
          this.updateTooltipPosition();
        }
      });
      this.resizeObserver.observe(wrapper);
    }
  }

  private refreshTooltipVisibility(): void {
    const shouldShow = (this.hoverActive || this.focusActive || this.pointerActive) && !this.input.disabled;
    if (shouldShow) {
      this.updateTooltip();
    }
    this.tooltip.classList.toggle(TOOLTIP_VISIBLE_CLASS, shouldShow);
  }

  private syncDisabledState(wrapper: HTMLElement): void {
    const apply = () => {
      const disabled = this.input.disabled;
      wrapper.classList.toggle('is-disabled', disabled);
      if (disabled) {
        this.hoverActive = false;
        this.focusActive = false;
        this.pointerActive = false;
        this.suppressFocusFromPointer = false;
        this.releasePointerCapture();
        this.tooltip.classList.remove(TOOLTIP_VISIBLE_CLASS);
      }
    };

    if (typeof MutationObserver !== 'undefined') {
      this.disabledObserver = new MutationObserver(apply);
      this.disabledObserver.observe(this.input, { attributes: true, attributeFilter: ['disabled'] });
    }

    apply();
  }

  private releasePointerCapture(): void {
    if (this.activePointerId === undefined) {
      return;
    }
    try {
      this.input.releasePointerCapture(this.activePointerId);
    } catch (error) {
      // Ignore
    }
    this.activePointerId = undefined;
  }

  private updateTooltip(): void {
    this.updateTooltipContent();
    this.updateTooltipPosition();
  }

  private updateTooltipContent(): void {
    const formatter = this.props.formatValue ?? ((value: number) => `${value}`);
    const value = this.getCurrentValue();
    this.tooltip.textContent = formatter(value, this.input);
  }

  private updateTooltipPosition(): void {
    const min = this.getMin();
    const max = this.getMax();
    const current = clamp(this.getCurrentValue(), min, max);
    const denominator = max - min;
    const percent = denominator === 0 ? 0 : (current - min) / denominator;
    this.tooltip.style.left = `${percent * 100}%`;
  }

  private getMin(): number {
    return parseNumber(this.input.min, 0);
  }

  private getMax(): number {
    return parseNumber(this.input.max, 100);
  }

  private getCurrentValue(): number {
    return parseNumber(this.input.value, parseNumber(this.props.defaultValue, 0));
  }
}
