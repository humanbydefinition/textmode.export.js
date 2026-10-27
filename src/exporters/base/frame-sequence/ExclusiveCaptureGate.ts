import { createFrameSequenceBusyError, createFrameSequenceDisposedError } from './errors';

/** Rejects overlapping deterministic captures for one installed plugin instance. */
export class ExclusiveCaptureGate {
	private _active = false;
	private _disposed = false;

	public acquire(): () => void {
		if (this._disposed) throw createFrameSequenceDisposedError();
		if (this._active) throw createFrameSequenceBusyError();
		this._active = true;
		let released = false;
		return () => {
			if (released) return;
			released = true;
			this._active = false;
		};
	}

	public dispose(): void {
		this._disposed = true;
	}
}
