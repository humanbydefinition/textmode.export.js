import { createFrameSequenceAbortError, createFrameSequenceTimeoutError } from './errors';

export function withAbortableFrameTimeout<T>(
	promise: Promise<T>,
	message: string,
	signal: AbortSignal | undefined,
	timeoutMs: number
): Promise<T> {
	return new Promise((resolve, reject) => {
		if (signal?.aborted) {
			reject(createFrameSequenceAbortError());
			return;
		}

		let settled = false;
		const cleanup = () => {
			clearTimeout(timeoutId);
			signal?.removeEventListener('abort', abort);
		};
		const settle = (callback: () => void) => {
			if (settled) return;
			settled = true;
			cleanup();
			callback();
		};
		const abort = () => settle(() => reject(createFrameSequenceAbortError()));
		const timeoutId = setTimeout(() => settle(() => reject(createFrameSequenceTimeoutError(message))), timeoutMs);

		signal?.addEventListener('abort', abort, { once: true });
		promise.then(
			(value) => settle(() => resolve(value)),
			(error) => settle(() => reject(error))
		);
	});
}
