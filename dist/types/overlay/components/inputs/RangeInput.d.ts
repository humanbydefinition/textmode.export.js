import { Component } from '../base/Component';
export interface RangeInputProps {
    defaultValue: string;
    attributes?: Partial<HTMLInputElement>;
    formatValue?: (value: number, input: HTMLInputElement) => string;
}
export declare class RangeInput extends Component<RangeInputProps> {
    private props;
    private input;
    private tooltip;
    private hoverActive;
    private focusActive;
    private pointerActive;
    private suppressFocusFromPointer;
    private activePointerId;
    private disabledObserver?;
    private resizeObserver?;
    constructor(props: RangeInputProps);
    render(): HTMLElement;
    get inputElement(): HTMLInputElement;
    get value(): string;
    set value(next: string);
    protected _onDestroy(): void;
    private bindEvents;
    private refreshTooltipVisibility;
    private syncDisabledState;
    private releasePointerCapture;
    private updateTooltip;
    private updateTooltipContent;
    private updateTooltipPosition;
    private getMin;
    private getMax;
    private getCurrentValue;
}
//# sourceMappingURL=RangeInput.d.ts.map