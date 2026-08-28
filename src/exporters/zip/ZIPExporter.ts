import type { Textmodifier } from 'textmode.js';
import {
	FileHandler,
	FilenamePolicy,
	FrameSequenceDriver,
	type FrameSequenceDriverLike,
	type PostDrawSubscription,
} from '../base';
import { createZIPFrameSerializerRegistry } from './FrameSerializerRegistry';
import { createZIPAbortError, normalizeZIPExportError, ZIPExportError } from './errors';
import { ZIPArchiveWriter } from './ZIPArchiveWriter';
import { createZIPFramePath, createZIPManifest, encodeZIPManifest } from './ZIPManifest';
import type {
	ZIPExportOptions,
	ZIPExportProgress,
	ZIPFrameFormat,
	ZIPFrameSerializer,
	ZIPGenerationOptions,
} from './types';

const DEFAULT_FRAME_COUNT = 300;
const DEFAULT_FRAME_RATE = 60;
const MAX_FRAME_COUNT = 65_534;
const SUPPORTED_FORMATS: ReadonlySet<string> = new Set<ZIPFrameFormat>(['png', 'jpg', 'webp', 'svg', 'json', 'txt']);

interface ZIPExporterDependencies {
	createDriver?: () => FrameSequenceDriverLike;
	createWriter?: (createdAt: Date) => ZIPArchiveWriterLike;
	resolveSerializer?: (format: ZIPFrameFormat) => ZIPFrameSerializer;
	now?: () => Date;
}

interface ZIPArchiveWriterLike {
	$addEntry(path: string, data: Uint8Array, compression: 'store' | 'deflate'): Promise<void>;
	$finalize(): Promise<Blob>;
	$abort(reason?: unknown): void;
}

/** Captures deterministic frames and archives them in capture order. */
export class ZIPExporter {
	private readonly _dependencies: ZIPExporterDependencies;

	constructor(
		private readonly _textmodifier: Textmodifier,
		private readonly _registerPostDrawHook: PostDrawSubscription,
		dependencies: ZIPExporterDependencies = {}
	) {
		this._dependencies = dependencies;
	}

	public async $saveZIP(options: ZIPExportOptions): Promise<void> {
		await this._export(options, ({ blob, filename }) => {
			new FileHandler().$downloadFile(blob, filename, '.zip');
		});
	}

	/** Generates a deterministic ZIP archive without initiating a download. */
	public async $generateZIPBlob(options: ZIPExportOptions): Promise<Blob> {
		return (await this._export(options)).blob;
	}

	private async _export(
		options: ZIPExportOptions,
		onReady?: (result: { blob: Blob; filename: string }) => void | Promise<void>
	): Promise<{ blob: Blob; filename: string }> {
		try {
			return await this._executeExport(options, onReady);
		} catch (error) {
			const exportError = normalizeZIPExportError(error);
			if (exportError.code === 'ZIP_EXPORT_INVALID_OPTIONS') {
				try {
					options?.onProgress?.({
						state: 'error',
						frameIndex: 0,
						totalFrames: this._progressFrameCount(options?.frameCount),
						progress: 0,
						message: exportError.message,
					});
				} catch (progressError) {
					throw normalizeZIPExportError(progressError);
				}
			}
			throw exportError;
		}
	}

	private async _executeExport(
		options: ZIPExportOptions,
		onReady?: (result: { blob: Blob; filename: string }) => void | Promise<void>
	): Promise<{ blob: Blob; filename: string }> {
		const generationOptions = this._validateAndNormalize(options);
		const createdAt = this._dependencies.now?.() ?? new Date();
		const filenamePolicy = new FilenamePolicy();
		const filename = filenamePolicy.$resolve(generationOptions.filename, '.zip', createdAt);
		const rootStem = filename.slice(0, -'.zip'.length);
		let writer: ZIPArchiveWriterLike | undefined;
		let completed = false;
		let completedFrames = 0;

		try {
			this._throwIfAborted(generationOptions.signal);
			const registry = createZIPFrameSerializerRegistry(this._textmodifier);
			const serializer =
				this._dependencies.resolveSerializer?.(generationOptions.format) ?? registry[generationOptions.format];
			writer = this._dependencies.createWriter?.(createdAt) ?? new ZIPArchiveWriter(createdAt);
			const archiveWriter = writer;
			const driver =
				this._dependencies.createDriver?.() ??
				new FrameSequenceDriver(this._textmodifier, this._registerPostDrawHook);
			this._emitProgress(generationOptions, {
				state: 'capturing',
				frameIndex: 0,
				totalFrames: generationOptions.frameCount,
				progress: 0,
			});
			this._throwIfAborted(generationOptions.signal);
			const manifest = createZIPManifest({
				createdAt,
				format: generationOptions.format,
				frameCount: generationOptions.frameCount,
				frameRate: generationOptions.frameRate,
				extension: serializer.extension,
			});
			await archiveWriter.$addEntry(`${rootStem}/manifest.json`, encodeZIPManifest(manifest), 'deflate');
			this._throwIfAborted(generationOptions.signal);

			await driver.$render({
				frameCount: generationOptions.frameCount,
				frameRate: generationOptions.frameRate,
				prepareFrame: generationOptions.prepareFrame,
				signal: generationOptions.signal,
				onFrame: async ({ frameIndex, canvas }) => {
					this._throwIfAborted(generationOptions.signal);
					const bytes = await serializer.serialize({
						canvas,
						frameOptions: generationOptions.frameOptions,
					});
					this._throwIfAborted(generationOptions.signal);
					await archiveWriter.$addEntry(
						createZIPFramePath(rootStem, frameIndex, serializer.extension),
						bytes,
						serializer.compression
					);
					this._throwIfAborted(generationOptions.signal);
					const frameIndexCompleted = frameIndex + 1;
					completedFrames = frameIndexCompleted;
					this._emitProgress(generationOptions, {
						state: 'capturing',
						frameIndex: frameIndexCompleted,
						totalFrames: generationOptions.frameCount,
						progress: frameIndexCompleted / generationOptions.frameCount,
					});
					await this._yieldToBrowser(generationOptions.signal);
				},
			});

			this._throwIfAborted(generationOptions.signal);
			this._emitProgress(generationOptions, {
				state: 'finalizing',
				frameIndex: generationOptions.frameCount,
				totalFrames: generationOptions.frameCount,
				progress: 1,
			});
			this._throwIfAborted(generationOptions.signal);
			const blob = await archiveWriter.$finalize();
			this._throwIfAborted(generationOptions.signal);
			await onReady?.({ blob, filename });
			this._throwIfAborted(generationOptions.signal);
			this._emitProgress(generationOptions, {
				state: 'completed',
				frameIndex: generationOptions.frameCount,
				totalFrames: generationOptions.frameCount,
				progress: 1,
			});
			completed = true;
			return { blob, filename };
		} catch (error) {
			const exportError = normalizeZIPExportError(error);
			try {
				this._emitProgress(generationOptions, {
					state: 'error',
					frameIndex: completedFrames,
					totalFrames: generationOptions.frameCount,
					progress: completedFrames / generationOptions.frameCount,
					message: exportError.message,
				});
			} catch {
				// Preserve the primary capture or callback failure.
			}
			throw exportError;
		} finally {
			if (!completed) writer?.$abort();
		}
	}

	private _validateAndNormalize(options: ZIPExportOptions): ZIPGenerationOptions {
		if (!options || typeof options !== 'object') {
			throw new ZIPExportError('ZIP_EXPORT_INVALID_OPTIONS', 'ZIP export options are required.');
		}
		const format = (options as { format?: unknown }).format;
		if (typeof format !== 'string' || !SUPPORTED_FORMATS.has(format)) {
			throw new ZIPExportError(
				'ZIP_EXPORT_INVALID_OPTIONS',
				"ZIP frame format must be one of 'png', 'jpg', 'webp', 'svg', 'json', or 'txt'."
			);
		}
		const frameCount = options.frameCount ?? DEFAULT_FRAME_COUNT;
		if (
			!Number.isFinite(frameCount) ||
			!Number.isInteger(frameCount) ||
			frameCount < 1 ||
			frameCount > MAX_FRAME_COUNT
		) {
			throw new ZIPExportError(
				'ZIP_EXPORT_INVALID_OPTIONS',
				`ZIP frameCount must be an integer from 1 through ${MAX_FRAME_COUNT}.`
			);
		}
		const frameRate = options.frameRate ?? DEFAULT_FRAME_RATE;
		if (!Number.isFinite(frameRate) || frameRate <= 0) {
			throw new ZIPExportError(
				'ZIP_EXPORT_INVALID_OPTIONS',
				'ZIP frameRate must be finite and greater than zero.'
			);
		}
		return {
			format: format as ZIPFrameFormat,
			filename: options.filename,
			frameCount,
			frameRate,
			frameOptions: options.frameOptions,
			prepareFrame: options.prepareFrame,
			signal: options.signal,
			onProgress: options.onProgress,
		};
	}

	private _emitProgress(options: ZIPGenerationOptions, progress: ZIPExportProgress): void {
		options.onProgress?.(progress);
	}

	private _progressFrameCount(frameCount: number | undefined): number {
		return Number.isInteger(frameCount) && (frameCount as number) >= 1 && (frameCount as number) <= MAX_FRAME_COUNT
			? (frameCount as number)
			: DEFAULT_FRAME_COUNT;
	}

	private _throwIfAborted(signal?: AbortSignal): void {
		if (signal?.aborted) throw createZIPAbortError();
	}

	private _yieldToBrowser(signal?: AbortSignal): Promise<void> {
		return new Promise((resolve, reject) => {
			if (signal?.aborted) {
				reject(createZIPAbortError());
				return;
			}
			let settled = false;
			const abort = () => {
				if (settled) return;
				settled = true;
				reject(createZIPAbortError());
			};
			signal?.addEventListener('abort', abort, { once: true });
			setTimeout(() => {
				if (settled) return;
				settled = true;
				signal?.removeEventListener('abort', abort);
				resolve();
			}, 0);
		});
	}
}
