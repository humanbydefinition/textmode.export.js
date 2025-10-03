import { Component } from '../base/Component';
export type ButtonVariant = 'primary' | 'secondary';
export interface ButtonProps {
    label: string;
    disabled?: boolean;
    fullWidth?: boolean;
    variant?: ButtonVariant;
}
export declare class Button extends Component<ButtonProps> {
    private props;
    private button;
    constructor(props: ButtonProps);
    render(): HTMLElement;
    get buttonElement(): HTMLButtonElement;
    setLabel(label: string): void;
    setDisabled(disabled: boolean): void;
    protected onUpdate(props: ButtonProps): void;
}
//# sourceMappingURL=Button.d.ts.map