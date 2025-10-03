import { Component } from './Component';
export type ContainerVariant = 'stack' | 'stackDense' | 'stackCompact' | 'row' | 'section';
export declare class Container extends Component<void> {
    private readonly variant;
    private readonly additionalClasses;
    constructor(variant?: ContainerVariant, additionalClasses?: string[]);
    render(): HTMLElement;
}
//# sourceMappingURL=Container.d.ts.map