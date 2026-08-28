import type { VideoExportErrorCode } from './types';
import { FrameSequenceError, isFrameSequenceAbortError } from '../base';

export class VideoExportError extends Error {
	public readonly code: VideoExportErrorCode;
	public override readonly cause?: unknown;

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
	return isFrameSequenceAbortError(error);
}

export function normalizeVideoExportError(error: unknown): VideoExportError {
	if (error instanceof VideoExportError) return error;
	if (isFrameSequenceAbortError(error)) return createAbortError();
	if (error instanceof FrameSequenceError && error.code === 'FRAME_SEQUENCE_TIMEOUT') {
		return createTimeoutError(error.message, error);
	}
	return new VideoExportError(
		'VIDEO_EXPORT_FAILED',
		error instanceof Error ? error.message : 'Video export failed.',
		error
	);
}
