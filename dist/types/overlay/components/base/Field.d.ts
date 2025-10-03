import { Component } from './Component';
export interface FieldProps {
    label: string;
    labelFor?: string;
    description?: string;
    variant?: 'default' | 'compact' | 'dense' | 'full' | 'channel';
}
export declare class Field extends Component<FieldProps> {
    private props;
    constructor(props: FieldProps);
    render(): HTMLElement;
    attachControl(controlElement: HTMLElement): void;
    update(props: FieldProps): void;
    protected onUpdate(props: FieldProps): void;
    private applyVariant;
}
//# sourceMappingURL=Field.d.ts.map