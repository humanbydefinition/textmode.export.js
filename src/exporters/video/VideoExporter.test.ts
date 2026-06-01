// @vitest-environment jsdom

import type { Textmodifier, TextmodePluginContext } from 'textmode.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FileHandler } from '../base';
import { VideoExporter, VideoRecorder, type VideoGenerationOptions } from '.';

function createTextmodifier(): Textmodifier {
	const canvas = document.createElement('canvas');
	canvas.width = 640;
	canvas.height = 360;

	return {
		canvas,
		pixelDensity: () => 1,
	} as unknown as Textmodifier;
}

const registerPostDrawHook: TextmodePluginContext['registerPostDrawHook'] = () => () => undefined;

describe('VideoExporter', () => {
	const context = {
		clearRect: vi.fn(),
		drawImage: vi.fn(),
		imageSmoothingEnabled: true,
	};
	let getContextSpy: { mockRestore(): void };
	let downloadSpy: ReturnType<typeof vi.spyOn>;
	let recordSpy: {
		mock: { calls: Array<[VideoGenerationOptions]> };
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
});
