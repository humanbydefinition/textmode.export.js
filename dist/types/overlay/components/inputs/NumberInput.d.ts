import { Component } from '../base/Component';
export interface NumberInputProps {
    defaultValue: string;
    attributes?: Partial<HTMLInputElement>;
    formatDisplay?: (numericValue: number, rawValue: string, input: HTMLInputElement) => string | null | undefined;
}
export declare class NumberInput extends Component<NumberInputProps> {
    private props;
    private input;
    private display;
    private incrementButton;
    private decrementButton;
    private suppressClickAfterPointer;
    private holdTimeoutId;
    private holdIntervalId;
    private activePointerId;
    private disabledObserver?;
    constructor(props: NumberInputProps);
    render(): HTMLElement;
    get inputElement(): HTMLInputElement;
    get value(): string;
    set value(next: string);
    refresh(): void;
    protected _onDestroy(): void;
    private bindStepControls;
    private bindHoldBehavior;
    private bindInputListeners;
    private observeDisabledState;
    private updateDisplay;
    private clearHoldTimers;
}
//# sourceMappingURL=NumberInput.d.ts.map