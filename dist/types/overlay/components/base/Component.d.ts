export type ComponentUpdate<TProps> = (props: TProps) => void;
export declare abstract class Component<TProps = void> {
    protected element?: HTMLElement;
    private mounted;
    private destroyed;
    abstract render(): HTMLElement;
    mount(container: HTMLElement): void;
    unmount(): void;
    destroy(): void;
    update(props: TProps): void;
    protected onMount(): void;
    protected _onUnmount(): void;
    protected _onDestroy(): void;
    protected onUpdate(_props: TProps): void;
    get root(): HTMLElement;
    isMounted(): boolean;
}
//# sourceMappingURL=Component.d.ts.map