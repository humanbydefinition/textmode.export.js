// @vitest-environment jsdom

import type { Textmodifier } from 'textmode.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FileHandler } from '../base';
import { VideoExporter } from './VideoExporter';
import { VideoRecorder } from './VideoRecorder';
import type { VideoGenerationOptions } from './types';
import type { PostDrawSubscription } from './VideoFrameDriver';

function createTextmodifier(): Textmodifier {
	const canvas = document.createElement('canvas');
	canvas.width = 640;
	canvas.height = 360;

	return {
		canvas,
		pixelDensity: () => 1,
	} as unknown as Textmodifier;
}

const registerPostDrawHook: PostDrawSubscription = () => () => undefined;

describe('VideoExporter', () => {
	const context = {
		clearRect: vi.fn(),
		drawImage: vi.fn(),
		imageSmoothingEnabled: true,
	};
	let getContextSpy: { mockRestore(): void };
	let downloadSpy: ReturnType<typeof vi.spyOn>;
	let recordSpy: {
		mock: { calls: Array<[VideoGenerationOptions, unknown?, unknown?, unknown?]> };
		mockRestore(): void;
	};

	beforeEach(() => {
		getContextSpy = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation((type) => {
			return type === '2d' ? (context as unknown as CanvasRenderingContext2D) : null;
		});
		downloadSpy = vi.spyOn(FileHandler.prototype, '$downloadFile').mockImplementation(() => undefined);
		recordSpy = vi
			.spyOn(VideoRecorder.prototype, '$record')
			.mockImplementation(
				async () => new Blob([new Uint8Array([1])], { type: 'video/mock' })
			) as unknown as typeof recordSpy;
	});

	afterEach(() => {
		delete (globalThis as typeof globalThis & { showSaveFilePicker?: unknown }).showSaveFilePicker;
		getContextSpy.mockRestore();
		downloadSpy.mockRestore();
		recordSpy.mockRestore();
	});

	it('defaults saveVideo to MP4', async () => {
		await new VideoExporter(createTextmodifier(), registerPostDrawHook).$saveVideo({ filename: 'capture' });
		const options = recordSpy.mock.calls[0]?.[0] as VideoGenerationOptions;

		expect(options.format).toBe('mp4');
		expect(downloadSpy).toHaveBeenCalledWith(expect.any(Blob), 'capture.mp4');
	});

	it('uses WebM when saveVideo receives format webm', async () => {
		await new VideoExporter(createTextmodifier(), registerPostDrawHook).$saveVideo({
			format: 'webm',
			filename: 'capture',
			bitrateMode: 'constant',
			latencyMode: 'realtime',
			hardwareAcceleration: 'prefer-software',
			keyFrameInterval: 1,
		});
		const options = recordSpy.mock.calls[0]?.[0] as VideoGenerationOptions;

		expect(options).toMatchObject({
			format: 'webm',
			bitrateMode: 'constant',
			latencyMode: 'realtime',
			hardwareAcceleration: 'prefer-software',
			keyFrameInterval: 1,
		});
		expect(downloadSpy).toHaveBeenCalledWith(expect.any(Blob), 'capture.webm');
	});

	it('streams saveVideo through the File System Access API when available', async () => {
		const writable = new WritableStream();
		const createWritable = vi.fn(async () => writable);
		const showSaveFilePicker = vi.fn(async () => ({ createWritable }));
		Object.defineProperty(globalThis, 'showSaveFilePicker', { value: showSaveFilePicker, configurable: true });

		await new VideoExporter(createTextmodifier(), registerPostDrawHook).$saveVideo({
			format: 'webm',
			filename: 'streamed',
		});

		expect(showSaveFilePicker).toHaveBeenCalledWith(expect.objectContaining({ suggestedName: 'streamed.webm' }));
		expect(createWritable).toHaveBeenCalledTimes(1);
		expect(recordSpy.mock.calls[0]?.[3]).toMatchObject({ kind: 'stream', writable });
		expect(downloadSpy).not.toHaveBeenCalled();
	});

	it('normalizes a cancelled save picker to VIDEO_EXPORT_ABORTED without rendering', async () => {
		const showSaveFilePicker = vi.fn(async () => {
			throw new DOMException('The user cancelled the picker.', 'AbortError');
		});
		Object.defineProperty(globalThis, 'showSaveFilePicker', { value: showSaveFilePicker, configurable: true });

		await expect(new VideoExporter(createTextmodifier(), registerPostDrawHook).$saveVideo()).rejects.toMatchObject({
			code: 'VIDEO_EXPORT_ABORTED',
		});
		expect(recordSpy.mock.calls).toHaveLength(0);
	});

	it('rejects an unsafe Blob fallback before rendering', async () => {
		await expect(
			new VideoExporter(createTextmodifier(), registerPostDrawHook).$saveVideo({
				format: 'webm',
				frameCount: 3_600,
				frameRate: 60,
				bitrate: 'ultra',
				pixelDensity: 4,
			})
		).rejects.toMatchObject({ code: 'VIDEO_OUTPUT_TOO_LARGE' });
		expect(recordSpy.mock.calls).toHaveLength(0);
	});
});
