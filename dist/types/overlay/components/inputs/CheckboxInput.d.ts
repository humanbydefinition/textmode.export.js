import { Component } from '../base/Component';
export interface CheckboxInputProps {
    id?: string;
    label: string;
    defaultChecked?: boolean;
}
export declare class CheckboxInput extends Component<CheckboxInputProps> {
    private props;
    private checkbox;
    private labelElement;
    private readonly handleChange;
    constructor(props: CheckboxInputProps);
    render(): HTMLElement;
    get inputElement(): HTMLInputElement;
    get checked(): boolean;
    set checked(value: boolean);
    protected _onUnmount(): void;
    protected onUpdate(props: CheckboxInputProps): void;
}
//# sourceMappingURL=CheckboxInput.d.ts.map