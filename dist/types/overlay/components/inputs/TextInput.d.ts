import { Component } from '../base/Component';
export interface TextInputProps {
    id?: string;
    defaultValue?: string;
    maxLength?: number;
}
export declare class TextInput extends Component<TextInputProps> {
    private props;
    private input;
    private readonly handleInput;
    constructor(props: TextInputProps);
    render(): HTMLElement;
    get inputElement(): HTMLInputElement;
    get value(): string;
    set value(next: string);
    protected _onUnmount(): void;
    protected onUpdate(props: TextInputProps): void;
}
//# sourceMappingURL=TextInput.d.ts.map