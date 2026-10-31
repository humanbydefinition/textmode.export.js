import type { TextmodeLayer, Textmodifier } from 'textmode.js';
import { DEFAULT_TEXTMODE_DOCUMENT_LIMITS } from '@textmode/document';
import type { TextmodeDocumentFrame, TextmodeDocumentJSON } from '@textmode/document';
import {
	FileHandler,
	FrameSequenceDriver,
	FrameSequenceError,
	getLayerTargetOptions,
	isFrameSequenceAbortError,
	resolveLayerStackExportTargets,
} from '../base';
import type { FrameSequenceDriverLike, PostDrawSubscription } from '../base';
import { JSONExporter } from './JSONExporter';
import type { JSONSequenceExportErrorCode, JSONSequenceExportOptions, JSONSequenceExportProgress } from './types';

/**
 * Error raised by JSON sequence capture.
 *
 * @category JSON frame-sequence export
 * @see {@link https://code.textmode.art/api/textmode.export.js/classes/JSONSequenceExportError | JSONSequenceExportError API reference}
 */
export class JSONSequenceExportError extends Error {
	public override readonly cause?: unknown;
	constructor(
		public readonly code: JSONSequenceExportErrorCode,
		message: string,
		cause?: unknown
	) {
		super(message);
		this.name = code === 'JSON_SEQUENCE_ABORTED' ? 'AbortError' : 'JSONSequenceExportError';
		this.cause = cause;
	}
}

export function normalizeJSONSequenceError(error: unknown): JSONSequenceExportError {
	if (error instanceof JSONSequenceExportError) return error;
	if (isFrameSequenceAbortError(error))
		return new JSONSequenceExportError('JSON_SEQUENCE_ABORTED', 'JSON sequence capture was cancelled.', error);
	if (error instanceof FrameSequenceError) {
		const code = error.code.replace('FRAME_SEQUENCE_', 'JSON_SEQUENCE_') as JSONSequenceExportErrorCode;
		return new JSONSequenceExportError(code, error.message, error);
	}
	return new JSONSequenceExportError(
		'JSON_SEQUENCE_FAILED',
		error instanceof Error ? error.message : 'JSON sequence capture failed.',
		error
	);
}

/** Captures independent layer snapshots into one JSON document. */
export class JSONSequenceExporter {
	constructor(
		private readonly modifier: Textmodifier,
		private readonly subscribe: PostDrawSubscription,
		private readonly createDriver?: () => FrameSequenceDriverLike
	) {}

	public async $save(options: JSONSequenceExportOptions = {}): Promise<void> {
		await this.$generateBlob(options, (blob) => new FileHandler().$downloadFile(blob, options.filename, '.json'));
	}

	public async $generateBlob(options: JSONSequenceExportOptions = {}, onReady?: (blob: Blob) => void): Promise<Blob> {
		const frameCount = options.frameCount ?? 300;
		const frameRate = options.frameRate ?? 60;
		let done = 0;
		const progress = (state: JSONSequenceExportProgress['state'], message?: string) =>
			options.onProgress?.({
				state,
				frameIndex: done,
				totalFrames: frameCount,
				progress: Number.isFinite(frameCount) && frameCount > 0 ? done / frameCount : 0,
				...(message ? { message } : {}),
			});
		const checkAbort = () => {
			if (options.signal?.aborted) throw normalizeJSONSequenceError(new DOMException('Aborted', 'AbortError'));
		};
		try {
			const limits = DEFAULT_TEXTMODE_DOCUMENT_LIMITS;
			const duration = 1000 / frameRate;
			if (
				!Number.isSafeInteger(frameCount) ||
				frameCount < 1 ||
				frameCount > limits.maxFrames ||
				!Number.isFinite(frameRate) ||
				frameRate <= 0 ||
				!Number.isFinite(duration) ||
				duration <= 0 ||
				duration > Number.MAX_SAFE_INTEGER / frameCount
			)
				throw new JSONSequenceExportError(
					'JSON_SEQUENCE_INVALID_OPTIONS',
					'Invalid JSON sequence frame count or frame rate.'
				);
			checkAbort();
			const selected = options.target === 'all' ? undefined : (options.layer ?? this.modifier.layers.base);
			const ids = new WeakMap<TextmodeLayer, string>();
			const initial = getLayerTargetOptions(this.modifier);
			for (const target of initial) ids.set(target.layer, target.id);
			let next = initial.length;
			const resolveId = (layer: TextmodeLayer) => {
				let id = ids.get(layer);
				if (!id) {
					id = `layer-${next++}`;
					ids.set(layer, id);
				}
				return id;
			};
			const exporter = new JSONExporter();
			const driver = this.createDriver?.() ?? new FrameSequenceDriver(this.modifier, this.subscribe);
			const frames: TextmodeDocumentFrame[] = [];
			let document: TextmodeDocumentJSON | undefined;
			let totalLayers = 0;
			let totalCells = 0;
			const createdAt = new Date();
			progress('capturing');
			await driver.$render({
				frameCount,
				frameRate,
				prepareFrame: options.prepareFrame,
				signal: options.signal,
				onFrame: ({ frameIndex }) => {
					checkAbort();
					const targets = resolveLayerStackExportTargets(this.modifier, selected ? [selected] : undefined);
					if (targets.length > limits.maxLayers || targets.length > limits.maxTotalLayers - totalLayers)
						throw new JSONSequenceExportError(
							'JSON_SEQUENCE_LIMIT_EXCEEDED',
							'JSON sequence layer budget exceeded.'
						);
					totalLayers += targets.length;
					for (const target of targets) {
						const count = target.grid.cols * target.grid.rows;
						if (!Number.isSafeInteger(count) || count > limits.maxCells - totalCells)
							throw new JSONSequenceExportError(
								'JSON_SEQUENCE_LIMIT_EXCEEDED',
								'JSON sequence cell budget exceeded.'
							);
						totalCells += count;
					}
					const snapshot = exporter.$generateJSONData(
						this.modifier,
						{ ...options, layer: selected },
						createdAt,
						resolveId
					);
					document ??= snapshot;
					frames.push({ durationMs: duration, layers: snapshot.frames[0].layers });
					done = frameIndex + 1;
					progress('capturing');
				},
			});
			checkAbort();
			if (!document || frames.length !== frameCount)
				throw new Error('Frame capture did not produce the requested sequence.');
			document.frames = frames;
			progress('finalizing');
			checkAbort();
			const indent = typeof options.pretty === 'number' ? options.pretty : options.pretty === false ? 0 : 2;
			const blob = new Blob([JSON.stringify(document, null, indent)], { type: 'application/json;charset=utf-8' });
			checkAbort();
			onReady?.(blob);
			checkAbort();
			progress('completed');
			return blob;
		} catch (error) {
			const normalized = normalizeJSONSequenceError(error);
			try {
				progress('error', normalized.message);
			} catch {
				/* Preserve the original failure. */
			}
			throw normalized;
		}
	}
}
