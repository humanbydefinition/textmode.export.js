import GIFEncoderWorker from './GIFEncoderWorker.ts?worker&inline';

interface WorkerResponse {
	id: number;
	type: 'ready' | 'frame-complete' | 'complete' | 'error';
	buffer?: ArrayBuffer;
	message?: string;
}

interface PendingRequest {
	resolve: (response: WorkerResponse) => void;
	reject: (error: Error) => void;
}

/** One-at-a-time worker bridge that bounds captured GIF memory to one RGBA frame. */
export class GIFWorkerClient {
	private readonly _worker: Worker;
	private readonly _pending = new Map<number, PendingRequest>();
	private readonly _ready: Promise<WorkerResponse>;
	private _requestId = 0;
	private _disposed = false;

	constructor(width: number, height: number, frameRate: number, repeat: number, signal?: AbortSignal) {
		this._worker = new GIFEncoderWorker();
		this._worker.addEventListener('message', this._handleMessage);
		this._worker.addEventListener('error', this._handleError);
		signal?.addEventListener('abort', this.dispose, { once: true });
		this._ready = this._request({
			type: 'init',
			width,
			height,
			delay: Math.round(1000 / frameRate),
			repeat,
		});
	}

	public async encodeFrame(buffer: ArrayBuffer, frameIndex: number): Promise<void> {
		await this._ready;
		await this._request({ type: 'frame', buffer, frameIndex }, [buffer]);
	}

	public async finish(): Promise<ArrayBuffer> {
		await this._ready;
		const response = await this._request({ type: 'finish' });
		if (!response.buffer) {
			throw new Error('GIF worker returned no encoded output.');
		}
		return response.buffer;
	}

	public dispose = (): void => {
		if (this._disposed) return;
		this._disposed = true;
		this._worker.terminate();
		for (const request of this._pending.values()) {
			request.reject(new DOMException('GIF export was cancelled.', 'AbortError'));
		}
		this._pending.clear();
	};

	private _request(
		message: Omit<Parameters<Worker['postMessage']>[0], 'id'>,
		transfer: Transferable[] = []
	): Promise<WorkerResponse> {
		if (this._disposed) {
			return Promise.reject(new DOMException('GIF export was cancelled.', 'AbortError'));
		}

		const id = ++this._requestId;
		return new Promise((resolve, reject) => {
			this._pending.set(id, { resolve, reject });
			this._worker.postMessage({ ...message, id }, transfer);
		});
	}

	private _handleMessage = (event: MessageEvent<WorkerResponse>): void => {
		const response = event.data;
		const pending = this._pending.get(response.id);
		if (!pending) return;
		this._pending.delete(response.id);
		if (response.type === 'error') {
			pending.reject(new Error(response.message ?? 'GIF worker failed'));
			return;
		}
		pending.resolve(response);
	};

	private _handleError = (event: ErrorEvent): void => {
		const error = new Error(event.message || 'GIF worker failed');
		for (const request of this._pending.values()) request.reject(error);
		this._pending.clear();
	};
}
