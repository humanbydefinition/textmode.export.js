// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { unzipSync } from 'fflate';
import type { FrameSequenceRenderOptions } from '../base';
import { FileHandler } from '../base';
import { IMAGE_MIME_TYPES, ImageExporter } from '../image';
import { JSONExporter } from '../json';
import { SVGExporter } from '../svg';
import { TXTExporter } from '../txt';
import { ZIPExporter } from './ZIPExporter';
import type { ZIPEntryCompression, ZIPExportProgress, ZIPFrameSerializer } from './types';

class FakeWriter {
	public readonly entries: Array<{ path: string; data: Uint8Array; compression: ZIPEntryCompression }> = [];
	public aborted = false;
	public readonly blob = new Blob([new Uint8Array([80, 75])], { type: 'application/zip' });

	public async $addEntry(path: string, data: Uint8Array, compression: ZIPEntryCompression): Promise<void> {
		this.entries.push({ path, data, compression });
	}

	public async $finalize(): Promise<Blob> {
		return this.blob;
	}

	public $abort(): void {
		this.aborted = true;
	}
}

function createDriver(render: (options: FrameSequenceRenderOptions) => Promise<void>) {
	const canvas = document.createElement('canvas');
	canvas.width = 640;
	canvas.height = 480;
	return {
		canvas,
		$render: vi.fn(render),
	};
}

function frameDimensions() {
	return { width: 640, height: 480 };
}

function createTextmodifierMock() {
	const canvas = document.createElement('canvas');
	canvas.width = 640;
	canvas.height = 480;
	const base = {
		grid: { width: 640, height: 480 },
		font: {},
		drawFramebuffer: {},
		isVisible: () => true,
	};
	return { canvas, layers: { base, all: [] } } as never;
}

describe('ZIPExporter', () => {
	beforeEach(() => vi.restoreAllMocks());

	it('writes manifest first, serializes frames sequentially, and reports the stable progress sequence', async () => {
		const writer = new FakeWriter();
		const callOrder: string[] = [];
		const serializer: ZIPFrameSerializer = {
			extension: '.png',
			compression: 'store',
			getDimensions: () => ({ width: 1280, height: 960 }),
			serialize: vi.fn(async () => {
				callOrder.push('serialize');
				return new Uint8Array([callOrder.length]);
			}),
		};
		const driver = createDriver(async ({ frameCount, onFrame }) => {
			for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
				callOrder.push(`render-${frameIndex}`);
				await onFrame({ frameIndex, canvas: document.createElement('canvas') });
			}
		});
		const progress: ZIPExportProgress[] = [];
		const exporter = new ZIPExporter({ canvas: driver.canvas } as never, vi.fn() as never, {
			createDriver: () => driver,
			createWriter: () => writer,
			resolveSerializer: () => serializer,
			now: () => new Date('2026-08-28T12:00:00.000Z'),
		});

		const blob = await exporter.$generateZIPBlob({
			format: 'png',
			filename: '../orbit:frames.zip',
			frameCount: 2,
			frameRate: 24,
			onProgress: (event) => progress.push(event),
		});

		expect(blob).toBe(writer.blob);
		expect(writer.entries.map(({ path }) => path)).toEqual([
			'orbit_frames/manifest.json',
			'orbit_frames/frames/frame-000001.png',
			'orbit_frames/frames/frame-000002.png',
		]);
		expect(writer.entries.map(({ compression }) => compression)).toEqual(['deflate', 'store', 'store']);
		expect(callOrder).toEqual(['render-0', 'serialize', 'render-1', 'serialize']);
		expect(progress.map(({ state, frameIndex, progress: ratio }) => [state, frameIndex, ratio])).toEqual([
			['capturing', 0, 0],
			['capturing', 1, 0.5],
			['capturing', 2, 1],
			['finalizing', 2, 1],
			['completed', 2, 1],
		]);
		const manifest = JSON.parse(new TextDecoder().decode(writer.entries[0]!.data)) as Record<string, unknown>;
		expect(manifest).toMatchObject({
			createdAt: '2026-08-28T12:00:00.000Z',
			format: 'png',
			frameCount: 2,
			frameRate: 24,
			width: 1280,
			height: 960,
			filePattern: 'frames/frame-%06d.png',
		});
	});

	it('composes the real archive writer into an independently extractable archive', async () => {
		let serializedFrame = 0;
		const exporter = new ZIPExporter({ canvas: document.createElement('canvas') } as never, vi.fn() as never, {
			createDriver: () =>
				createDriver(async ({ frameCount, onFrame }) => {
					for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
						await onFrame({ frameIndex, canvas: document.createElement('canvas') });
					}
				}),
			resolveSerializer: () => ({
				extension: '.txt',
				compression: 'deflate',
				getDimensions: frameDimensions,
				serialize: async () => new TextEncoder().encode(`frame ${++serializedFrame}`),
			}),
			now: () => new Date('2026-08-28T12:00:00.000Z'),
		});

		const blob = await exporter.$generateZIPBlob({
			format: 'txt',
			filename: 'sequence',
			frameCount: 2,
			frameRate: 24,
		});
		const extracted = unzipSync(new Uint8Array(await blob.arrayBuffer()));
		expect(Object.keys(extracted)).toEqual([
			'sequence/manifest.json',
			'sequence/frames/frame-000001.txt',
			'sequence/frames/frame-000002.txt',
		]);
		expect(new TextDecoder().decode(extracted['sequence/frames/frame-000002.txt'])).toBe('frame 2');
	});

	it('composes all six public formats with their canonical paths and compression policies', async () => {
		vi.spyOn(ImageExporter.prototype, '$toImageBlob').mockImplementation(async (_canvas, options) => {
			const format = options?.format ?? 'png';
			return new Blob([new Uint8Array([1])], { type: IMAGE_MIME_TYPES[format] });
		});
		vi.spyOn(SVGExporter.prototype, '$generateSVG').mockReturnValue('<svg/>');
		vi.spyOn(JSONExporter.prototype, '$generateJSONString').mockReturnValue('{}');
		vi.spyOn(TXTExporter.prototype, '$generateTXT').mockReturnValue('A');
		const policies = [
			['png', '.png', 'store'],
			['jpg', '.jpg', 'store'],
			['webp', '.webp', 'store'],
			['svg', '.svg', 'deflate'],
			['json', '.json', 'deflate'],
			['txt', '.txt', 'deflate'],
		] as const;

		for (const [format, extension, compression] of policies) {
			const writer = new FakeWriter();
			const exporter = new ZIPExporter(createTextmodifierMock(), vi.fn() as never, {
				createDriver: () =>
					createDriver(async ({ onFrame }) => {
						await onFrame({ frameIndex: 0, canvas: document.createElement('canvas') });
					}),
				createWriter: () => writer,
			});
			await exporter.$generateZIPBlob({ format, filename: format, frameCount: 1 });
			expect(writer.entries[1]).toMatchObject({
				path: `${format}/frames/frame-000001${extension}`,
				compression,
			});
		}
	});

	it('applies defaults and rejects invalid input before allocating capture resources', async () => {
		const writer = new FakeWriter();
		let receivedOptions: FrameSequenceRenderOptions | undefined;
		const createDriverFactory = vi.fn(() =>
			createDriver(async (options) => {
				receivedOptions = options;
			})
		);
		const exporter = new ZIPExporter({ canvas: document.createElement('canvas') } as never, vi.fn() as never, {
			createDriver: createDriverFactory,
			createWriter: () => writer,
			resolveSerializer: () => ({
				extension: '.txt',
				compression: 'deflate',
				getDimensions: frameDimensions,
				serialize: async () => new Uint8Array(),
			}),
		});

		await exporter.$generateZIPBlob({ format: 'txt' });
		expect(receivedOptions).toMatchObject({ frameCount: 300, frameRate: 60 });

		for (const options of [
			{ format: 'gif' },
			{ format: 'png', frameCount: 0 },
			{ format: 'png', frameCount: 1.5 },
			{ format: 'png', frameCount: 65_535 },
			{ format: 'png', frameRate: Number.NaN },
			{ format: 'png', frameRate: 0 },
		]) {
			const invalidDriver = vi.fn();
			const progress = vi.fn();
			const invalidExporter = new ZIPExporter(
				{ canvas: document.createElement('canvas') } as never,
				vi.fn() as never,
				{ createDriver: invalidDriver }
			);
			await expect(
				invalidExporter.$generateZIPBlob({ ...options, onProgress: progress } as never)
			).rejects.toMatchObject({
				code: 'ZIP_EXPORT_INVALID_OPTIONS',
			});
			expect(invalidDriver).not.toHaveBeenCalled();
			expect(progress).toHaveBeenCalledOnce();
			expect(progress).toHaveBeenCalledWith(expect.objectContaining({ state: 'error' }));
		}
	});

	it('aborts after serialization, emits one terminal error, and never finalizes', async () => {
		const controller = new AbortController();
		const writer = new FakeWriter();
		const finalize = vi.spyOn(writer, '$finalize');
		const progress: ZIPExportProgress[] = [];
		const exporter = new ZIPExporter({ canvas: document.createElement('canvas') } as never, vi.fn() as never, {
			createDriver: () =>
				createDriver(async ({ onFrame }) => {
					await onFrame({ frameIndex: 0, canvas: document.createElement('canvas') });
				}),
			createWriter: () => writer,
			resolveSerializer: () => ({
				extension: '.png',
				compression: 'store',
				getDimensions: frameDimensions,
				serialize: async () => {
					controller.abort();
					return new Uint8Array([1]);
				},
			}),
		});

		await expect(
			exporter.$generateZIPBlob({
				format: 'png',
				frameCount: 1,
				signal: controller.signal,
				onProgress: (event) => progress.push(event),
			})
		).rejects.toMatchObject({ name: 'AbortError', code: 'ZIP_EXPORT_ABORTED' });
		expect(progress.filter(({ state }) => state === 'error')).toHaveLength(1);
		expect(finalize).not.toHaveBeenCalled();
		expect(writer.aborted).toBe(true);
	});

	it('downloads the same generated blob with the canonical ZIP extension', async () => {
		const writer = new FakeWriter();
		const download = vi.spyOn(FileHandler.prototype, '$downloadFile').mockImplementation(() => undefined);
		const exporter = new ZIPExporter({ canvas: document.createElement('canvas') } as never, vi.fn() as never, {
			createDriver: () => createDriver(async () => undefined),
			createWriter: () => writer,
			resolveSerializer: () => ({
				extension: '.txt',
				compression: 'deflate',
				getDimensions: frameDimensions,
				serialize: async () => new Uint8Array(),
			}),
		});

		await exporter.$saveZIP({ format: 'txt', filename: 'sequence.ZIP', frameCount: 1 });
		expect(download).toHaveBeenCalledWith(writer.blob, 'sequence.zip', '.zip');
	});

	it('reports a download setup failure instead of emitting completed progress', async () => {
		const writer = new FakeWriter();
		const failure = new Error('download blocked');
		vi.spyOn(FileHandler.prototype, '$downloadFile').mockImplementation(() => {
			throw failure;
		});
		const progress: ZIPExportProgress[] = [];
		const exporter = new ZIPExporter({ canvas: document.createElement('canvas') } as never, vi.fn() as never, {
			createDriver: () => createDriver(async () => undefined),
			createWriter: () => writer,
			resolveSerializer: () => ({
				extension: '.txt',
				compression: 'deflate',
				getDimensions: frameDimensions,
				serialize: async () => new Uint8Array(),
			}),
		});

		await expect(
			exporter.$saveZIP({
				format: 'txt',
				frameCount: 1,
				onProgress: (event) => progress.push(event),
			})
		).rejects.toMatchObject({ code: 'ZIP_EXPORT_FAILED', cause: failure });
		expect(progress.at(-1)?.state).toBe('error');
		expect(progress.some(({ state }) => state === 'completed')).toBe(false);
	});
});
