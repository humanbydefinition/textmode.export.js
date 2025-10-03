export type StateListener<TState> = (state: Readonly<TState>) => void;
export declare class StateManager<TState extends object> {
    private _state;
    private readonly _listeners;
    constructor(initial: TState);
    get snapshot(): Readonly<TState>;
    $set(partial: Partial<TState>): void;
    $subscribe(listener: StateListener<TState>): () => void;
    $reset(state: TState): void;
}
//# sourceMappingURL=StateManager.d.ts.map