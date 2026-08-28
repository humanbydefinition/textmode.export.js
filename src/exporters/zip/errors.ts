import { FrameSequenceError, isFrameSequenceAbortError } from '../base';
import type { ZIPExportErrorCode } from './types';

/**
 * Error raised by ZIP frame-sequence validation, capture, or archive creation.
 *
 * @category ZIP frame-sequence export
 * @see {@link https://code.textmode.art/api/textmode.export.js/classes/ZIPExportError | ZIPExportError API reference}
 */
export class ZIPExportError extends Error {
	public readonly code: ZIPExportErrorCode;
	public override readonly cause?: unknown;

	constructor(code: ZIPExportErrorCode, message: string, cause?: unknown) {
		super(message);
		this.name = code === 'ZIP_EXPORT_ABORTED' ? 'AbortError' : 'ZIPExportError';
		this.code = code;
		this.cause = cause;
	}
}

export function createZIPAbortError(cause?: unknown): ZIPExportError {
	return new ZIPExportError('ZIP_EXPORT_ABORTED', 'ZIP frame-sequence export was cancelled.', cause);
}

export function normalizeZIPExportError(error: unknown): ZIPExportError {
	if (error instanceof ZIPExportError) return error;
	if (isFrameSequenceAbortError(error)) return createZIPAbortError(error);
	if (error instanceof FrameSequenceError) {
		if (error.code === 'FRAME_SEQUENCE_TIMEOUT')
			return new ZIPExportError('ZIP_EXPORT_TIMEOUT', error.message, error);
		if (error.code === 'FRAME_SEQUENCE_BUSY') return new ZIPExportError('ZIP_EXPORT_BUSY', error.message, error);
		if (error.code === 'FRAME_SEQUENCE_DISPOSED') {
			return new ZIPExportError('ZIP_EXPORT_DISPOSED', error.message, error);
		}
	}
	return new ZIPExportError(
		'ZIP_EXPORT_FAILED',
		error instanceof Error ? error.message : 'ZIP frame-sequence export failed.',
		error
	);
}
