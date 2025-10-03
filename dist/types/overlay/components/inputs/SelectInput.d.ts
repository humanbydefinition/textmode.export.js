import { Component } from '../base/Component';
export interface SelectOption<TValue extends string = string> {
    value: TValue;
    label: string;
}
export interface SelectInputProps<TValue extends string = string> {
    id?: string;
    options: SelectOption<TValue>[];
    defaultValue?: TValue;
}
export declare class SelectInput<TValue extends string = string> extends Component<SelectInputProps<TValue>> {
    private props;
    private select;
    private readonly handleChange;
    constructor(props: SelectInputProps<TValue>);
    render(): HTMLElement;
    get selectElement(): HTMLSelectElement;
    get value(): TValue;
    set value(next: TValue);
    protected _onUnmount(): void;
    protected onUpdate(props: SelectInputProps<TValue>): void;
    update(partial: Partial<SelectInputProps<TValue>>): void;
    private populateOptions;
}
//# sourceMappingURL=SelectInput.d.ts.map