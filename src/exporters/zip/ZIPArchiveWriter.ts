import { Zip, ZipDeflate, ZipPassThrough, type ZipInputFile } from 'fflate';
import { createZIPAbortError, ZIPExportError } from './errors';
import type { ZIPEntryCompression } from './types';

type WriterState = 'open' | 'finalizing' | 'closed' | 'failed';

/** Streaming ZIP wrapper that retains only compressed archive output chunks. */
export class ZIPArchiveWriter {
	private readonly _archive: Zip;
	private readonly _chunks: ArrayBuffer[] = [];
	private readonly _entryNames = new Set<string>();
	private readonly _modifiedAt: Date;
	private _state: WriterState = 'open';
	private _failure: unknown;
	private _resolveFinal?: (blob: Blob) => void;
	private _rejectFinal?: (error: unknown) => void;

	constructor(modifiedAt: Date) {
		this._modifiedAt = modifiedAt;
		this._archive = new Zip((error, chunk, final) => {
			if (this._state === 'failed') return;
			if (error) {
				this._fail(error);
				return;
			}
			if (chunk.byteLength > 0) {
				const copy = new Uint8Array(chunk.byteLength);
				copy.set(chunk);
				this._chunks.push(copy.buffer);
			}
			if (final && this._state === 'finalizing') {
				this._state = 'closed';
				const blob = new Blob(this._chunks, { type: 'application/zip' });
				this._chunks.length = 0;
				this._resolveFinal?.(blob);
				this._resolveFinal = undefined;
				this._rejectFinal = undefined;
			}
		});
	}

	public async $addEntry(path: string, data: Uint8Array, compression: ZIPEntryCompression): Promise<void> {
		this._assertOpen();
		this._validateEntryPath(path);
		if (this._entryNames.has(path)) {
			throw new ZIPExportError('ZIP_EXPORT_FAILED', `Duplicate ZIP entry: ${path}`);
		}
		if (this._entryNames.size >= 65_535) {
			throw new ZIPExportError(
				'ZIP_EXPORT_FAILED',
				'Classic ZIP archives cannot contain more than 65,535 entries.'
			);
		}

		const entry: ZipInputFile =
			compression === 'store' ? new ZipPassThrough(path) : new ZipDeflate(path, { level: 6 });
		entry.mtime = this._modifiedAt;
		this._entryNames.add(path);
		this._archive.add(entry);
		if (entry instanceof ZipPassThrough || entry instanceof ZipDeflate) entry.push(data, true);
		if (this._failure) throw this._failure;
		await Promise.resolve();
	}

	public $finalize(): Promise<Blob> {
		this._assertOpen();
		this._state = 'finalizing';
		return new Promise<Blob>((resolve, reject) => {
			this._resolveFinal = resolve;
			this._rejectFinal = reject;
			try {
				this._archive.end();
			} catch (error) {
				this._fail(error);
			}
		});
	}

	public $abort(reason: unknown = createZIPAbortError()): void {
		if (this._state === 'closed' || this._state === 'failed') return;
		this._state = 'failed';
		this._failure = reason;
		this._archive.terminate();
		this._chunks.length = 0;
		this._rejectFinal?.(reason);
		this._resolveFinal = undefined;
		this._rejectFinal = undefined;
	}

	private _assertOpen(): void {
		if (this._state !== 'open') {
			throw new ZIPExportError('ZIP_EXPORT_FAILED', `ZIP archive writer is ${this._state}.`, this._failure);
		}
	}

	private _validateEntryPath(path: string): void {
		const segments = path.split('/');
		if (
			!path ||
			path.startsWith('/') ||
			/^[A-Za-z]:/.test(path) ||
			path.includes('\\') ||
			path.includes('\0') ||
			segments.some((segment) => !segment || segment === '.' || segment === '..')
		) {
			throw new ZIPExportError('ZIP_EXPORT_FAILED', `Unsafe ZIP entry path: ${path}`);
		}
	}

	private _fail(error: unknown): void {
		if (this._state === 'failed') return;
		this._state = 'failed';
		this._failure = error;
		this._chunks.length = 0;
		this._archive.terminate();
		this._rejectFinal?.(error);
		this._resolveFinal = undefined;
		this._rejectFinal = undefined;
	}
}
