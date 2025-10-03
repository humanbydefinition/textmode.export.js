export type StateListener<TState> = (state: Readonly<TState>) => void;

export class StateManager<TState extends object> {
  private _state: TState;
  private readonly _listeners = new Set<StateListener<TState>>();

  constructor(initial: TState) {
    this._state = initial;
  }

  get snapshot(): Readonly<TState> {
    return Object.freeze({ ...this._state });
  }

  public $set(partial: Partial<TState>): void {
    this._state = Object.assign({}, this._state, partial);
    const snapshot = this.snapshot;
    for (const listener of [...this._listeners]) {
      try {
        listener(snapshot);
      } catch (error) {
        console.error('[textmode-export] State listener failed', error);
      }
    }
  }

  public $subscribe(listener: StateListener<TState>): () => void {
    this._listeners.add(listener);
    listener(this.snapshot);
    return () => {
      this._listeners.delete(listener);
    };
  }

  public $reset(state: TState): void {
    this._state = state;
    const snapshot = this.snapshot;
    for (const listener of [...this._listeners]) {
      listener(snapshot);
    }
  }
}
