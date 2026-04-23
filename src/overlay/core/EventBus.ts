type Listener<T> = (payload: T) => void;

type EventMap = Record<string, unknown>;
type ListenerRegistry<TEvents extends EventMap> = {
	[K in keyof TEvents]?: Set<Listener<TEvents[K]>>;
};

export class EventBus<TEvents extends EventMap> {
	private readonly _listeners: ListenerRegistry<TEvents> = {};

	private _getPool<K extends keyof TEvents>(event: K): Set<Listener<TEvents[K]>> {
		const existing = this._listeners[event];
		if (existing) {
			return existing;
		}

		const pool = new Set<Listener<TEvents[K]>>();
		this._listeners[event] = pool;
		return pool;
	}

	public $on<K extends keyof TEvents>(event: K, listener: Listener<TEvents[K]>): () => void {
		const pool = this._getPool(event);
		pool.add(listener);

		return () => {
			pool.delete(listener);
			if (pool.size === 0) {
				delete this._listeners[event];
			}
		};
	}

	public $emit<K extends keyof TEvents>(event: K, payload: TEvents[K]): void {
		const pool = this._listeners[event];
		if (!pool) {
			return;
		}

		for (const listener of [...pool]) {
			try {
				listener(payload);
			} catch (error) {
				console.error('[textmode-export] Event handler failed', error);
			}
		}
	}

	public $clear(): void {
		for (const event of Object.keys(this._listeners) as Array<keyof TEvents>) {
			delete this._listeners[event];
		}
	}
}
