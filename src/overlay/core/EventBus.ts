type Listener<T> = (payload: T) => void;

type EventMap = Record<string, unknown>;

export class EventBus<TEvents extends EventMap> {
  private readonly _listeners = new Map<keyof TEvents, Set<Listener<any>>>();

  public $on<K extends keyof TEvents>(event: K, listener: Listener<TEvents[K]>): () => void {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set());
    }
    const pool = this._listeners.get(event)!;
    pool.add(listener as Listener<any>);

    return () => {
      pool.delete(listener as Listener<any>);
      if (pool.size === 0) {
        this._listeners.delete(event);
      }
    };
  }

  public $emit<K extends keyof TEvents>(event: K, payload: TEvents[K]): void {
    const pool = this._listeners.get(event);
    if (!pool) {
      return;
    }

    for (const listener of [...pool]) {
      try {
        (listener as Listener<TEvents[K]>)(payload);
      } catch (error) {
        console.error('[textmode-export] Event handler failed', error);
      }
    }
  }

  public $clear(): void {
    this._listeners.clear();
  }
}
