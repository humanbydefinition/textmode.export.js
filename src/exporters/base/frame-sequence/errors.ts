export type FrameSequenceErrorCode =
	'FRAME_SEQUENCE_ABORTED' | 'FRAME_SEQUENCE_TIMEOUT' | 'FRAME_SEQUENCE_BUSY' | 'FRAME_SEQUENCE_DISPOSED';

/** Internal error used by deterministic capture infrastructure. */
export class FrameSequenceError extends Error {
	public readonly code: FrameSequenceErrorCode;
	public override readonly cause?: unknown;

	constructor(code: FrameSequenceErrorCode, message: string, cause?: unknown) {
		super(message);
		this.name = code === 'FRAME_SEQUENCE_ABORTED' ? 'AbortError' : 'FrameSequenceError';
		this.code = code;
		this.cause = cause;
	}
}

export function createFrameSequenceAbortError(): FrameSequenceError {
	return new FrameSequenceError('FRAME_SEQUENCE_ABORTED', 'Frame-sequence capture was cancelled.');
}

export function createFrameSequenceTimeoutError(message: string, cause?: unknown): FrameSequenceError {
	return new FrameSequenceError('FRAME_SEQUENCE_TIMEOUT', message, cause);
}

export function createFrameSequenceBusyError(): FrameSequenceError {
	return new FrameSequenceError(
		'FRAME_SEQUENCE_BUSY',
		'Another deterministic frame capture is already active for this textmode instance.'
	);
}

export function createFrameSequenceDisposedError(): FrameSequenceError {
	return new FrameSequenceError('FRAME_SEQUENCE_DISPOSED', 'The textmode export plugin has been disposed.');
}

export function isFrameSequenceAbortError(error: unknown): boolean {
	return (
		(error instanceof FrameSequenceError && error.code === 'FRAME_SEQUENCE_ABORTED') ||
		(error instanceof DOMException && error.name === 'AbortError')
	);
}
