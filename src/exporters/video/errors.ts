import type { VideoExportErrorCode } from './types';

export class VideoExportError extends Error {
	public readonly code: VideoExportErrorCode;
	public readonly cause?: unknown;

	constructor(code: VideoExportErrorCode, message: string, cause?: unknown) {
		super(message);
		this.name = 'VideoExportError';
		this.code = code;
		this.cause = cause;
	}
}

export function createAbortError(): VideoExportError {
	return new VideoExportError('VIDEO_EXPORT_ABORTED', 'Video export was cancelled.');
}

export function createTimeoutError(message: string, cause?: unknown): VideoExportError {
	return new VideoExportError('VIDEO_EXPORT_TIMEOUT', message, cause);
}

export function isAbortError(error: unknown): boolean {
	if (error instanceof VideoExportError) {
		return error.code === 'VIDEO_EXPORT_ABORTED';
	}
	return error instanceof DOMException && error.name === 'AbortError';
}
