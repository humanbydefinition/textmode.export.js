type Listener<T> = (payload: T) => void;
type EventMap = Record<string, unknown>;
export declare class EventBus<TEvents extends EventMap> {
    private readonly _listeners;
    $on<K extends keyof TEvents>(event: K, listener: Listener<TEvents[K]>): () => void;
    $emit<K extends keyof TEvents>(event: K, payload: TEvents[K]): void;
    $clear(): void;
}
export {};
//# sourceMappingURL=EventBus.d.ts.map