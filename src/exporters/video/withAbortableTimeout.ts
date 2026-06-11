import { createAbortError, createTimeoutError } from './errors';

export function withAbortableTimeout<T>(
	promise: Promise<T>,
	message: string,
	signal: AbortSignal | undefined,
	timeoutMs: number
): Promise<T> {
	return new Promise((resolve, reject) => {
		if (signal?.aborted) {
			reject(createAbortError());
			return;
		}

		let settled = false;
		const timeoutId = setTimeout(() => settle(() => reject(createTimeoutError(message))), timeoutMs);
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
		const abort = () => settle(() => reject(createAbortError()));

		signal?.addEventListener('abort', abort, { once: true });
		promise.then(
			(value) => settle(() => resolve(value)),
			(error) => settle(() => reject(error))
		);
	});
}
