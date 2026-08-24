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
		expect(options.quality).toBe('medium');
		expect(downloadSpy).toHaveBeenCalledWith(expect.any(Blob), 'capture.mp4');
	});

	it('uses WebM when saveVideo receives format webm', async () => {
		await new VideoExporter(createTextmodifier(), registerPostDrawHook).$saveVideo({
			format: 'webm',
			filename: 'capture',
			quality: { bitrate: 4_000_000, bitrateMode: 'constant' },
			hardwareAcceleration: 'prefer-software',
			keyFrameInterval: 1,
		});
		const options = recordSpy.mock.calls[0]?.[0] as VideoGenerationOptions;

		expect(options).toMatchObject({
			format: 'webm',
			quality: { bitrate: 4_000_000, bitrateMode: 'constant' },
			hardwareAcceleration: 'prefer-software',
			keyFrameInterval: 1,
		});
		expect(downloadSpy).toHaveBeenCalledWith(expect.any(Blob), 'capture.webm');
	});

	it('downloads saveVideo without invoking the native save picker', async () => {
		const showSaveFilePicker = vi.fn();
		Object.defineProperty(globalThis, 'showSaveFilePicker', { value: showSaveFilePicker, configurable: true });

		await new VideoExporter(createTextmodifier(), registerPostDrawHook).$saveVideo({
			format: 'webm',
			filename: 'streamed',
		});

		expect(showSaveFilePicker).not.toHaveBeenCalled();
		expect(recordSpy.mock.calls[0]?.[3]).toEqual({ kind: 'blob' });
		expect(downloadSpy).toHaveBeenCalledWith(expect.any(Blob), 'streamed.webm');
	});

	it('preserves a positive fractional output frame rate', async () => {
		await new VideoExporter(createTextmodifier(), registerPostDrawHook).$saveVideo({
			frameRate: 30000 / 1001,
		});

		expect(recordSpy.mock.calls[0]?.[0].frameRate).toBe(30000 / 1001);
	});

	it('streams through a positioned writable when file-system output is requested', async () => {
		const file = { write: vi.fn().mockResolvedValue(undefined), close: vi.fn(), abort: vi.fn() };
		const showSaveFilePicker = vi.fn().mockResolvedValue({ createWritable: vi.fn().mockResolvedValue(file) });
		Object.defineProperty(globalThis, 'showSaveFilePicker', { value: showSaveFilePicker, configurable: true });
		await new VideoExporter(createTextmodifier(), registerPostDrawHook).$saveVideo({
			format: 'webm',
			filename: 'large-export',
			destination: 'file-system',
		});

		expect(showSaveFilePicker).toHaveBeenCalledWith(
			expect.objectContaining({ suggestedName: 'large-export.webm' })
		);
		expect(recordSpy.mock.calls[0]?.[3]).toMatchObject({ kind: 'stream', writable: expect.any(WritableStream) });
		expect(downloadSpy).not.toHaveBeenCalled();
	});

	it('aborts a selected file when encoder probing fails before the stream starts', async () => {
		const failure = new Error('encoder unavailable');
		recordSpy.mockRestore();
		recordSpy = vi
			.spyOn(VideoRecorder.prototype, '$record')
			.mockRejectedValue(failure) as unknown as typeof recordSpy;
		const file = { write: vi.fn(), close: vi.fn(), abort: vi.fn().mockResolvedValue(undefined) };
		Object.defineProperty(globalThis, 'showSaveFilePicker', {
			value: vi.fn().mockResolvedValue({ createWritable: vi.fn().mockResolvedValue(file) }),
			configurable: true,
		});

		await expect(
			new VideoExporter(createTextmodifier(), registerPostDrawHook).$saveVideo({ destination: 'file-system' })
		).rejects.toBe(failure);

		expect(file.abort).toHaveBeenCalledWith(failure);
		expect(file.close).not.toHaveBeenCalled();
	});

	it('rejects removed custom quality levels before rendering', async () => {
		await expect(
			new VideoExporter(createTextmodifier(), registerPostDrawHook).$saveVideo({
				quality: 'ultra',
			} as never)
		).rejects.toThrow('Video quality');
		expect(recordSpy.mock.calls).toHaveLength(0);
	});
});
