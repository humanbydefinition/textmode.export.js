import { Component } from '../base/Component';
export type StatusVariant = 'neutral' | 'active' | 'alert';
export interface StatusDisplayProps {
    title: string;
    message: string;
    variant?: StatusVariant;
    context?: 'gif' | 'video' | 'default';
}
export declare class StatusDisplay extends Component<StatusDisplayProps> {
    private props;
    private container;
    private messageElement;
    constructor(props: StatusDisplayProps);
    render(): HTMLElement;
    setMessage(message: string, variant?: StatusVariant): void;
    protected onUpdate(props: StatusDisplayProps): void;
    private applyVariant;
}
//# sourceMappingURL=StatusDisplay.d.ts.map