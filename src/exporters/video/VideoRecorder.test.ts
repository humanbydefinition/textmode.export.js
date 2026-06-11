// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest';
import { VideoExportError, VideoRecorder, type VideoFrameDriverLike, type VideoGenerationOptions } from '.';

const mediabunnyMock = vi.hoisted(() => ({
	canvasSourceConfigs: [] as Array<Record<string, unknown>>,
	canvasSourceAdds: [] as Array<{ timestamp: number; duration: number }>,
	addImpl: vi.fn(async () => undefined as void),
	outputStart: vi.fn(async () => undefined as void),
	outputFinalize: vi.fn(async () => undefined as void),
	outputCancel: vi.fn(async () => undefined as void),
	getFirstEncodableVideoCodec: vi.fn(async (codecs: string[]) => codecs[0] ?? null),
}));

vi.mock('mediabunny', () => ({
	BufferTarget: class BufferTarget {
		public buffer = new Uint8Array([1, 2, 3]).buffer;
	},
	CanvasSource: class CanvasSource {
		constructor(_canvas: HTMLCanvasElement, config: Record<string, unknown>) {
			mediabunnyMock.canvasSourceConfigs.push(config);
		}

		public add(timestamp: number, duration: number): Promise<void> {
			mediabunnyMock.canvasSourceAdds.push({ timestamp, duration });
			return mediabunnyMock.addImpl();
		}
	},
	Mp4OutputFormat: class Mp4OutputFormat {
		public mimeType = 'video/mp4';

		public getSupportedVideoCodecs(): string[] {
			return ['avc'];
		}
	},
	Output: class Output {
		public addVideoTrack(): void {
			return undefined;
		}

		public async start(): Promise<void> {
			await mediabunnyMock.outputStart();
		}

		public async finalize(): Promise<void> {
			await mediabunnyMock.outputFinalize();
		}

		public async cancel(): Promise<void> {
			await mediabunnyMock.outputCancel();
		}
	},
	WebMOutputFormat: class WebMOutputFormat {
		public mimeType = 'video/webm';

		public getSupportedVideoCodecs(): string[] {
			return ['vp9', 'vp8'];
		}
	},
	getFirstEncodableVideoCodec: mediabunnyMock.getFirstEncodableVideoCodec,
}));

function setWebCodecsAvailable(available: boolean): void {
	Object.defineProperty(globalThis, 'VideoEncoder', {
		value: available ? function VideoEncoder() {} : undefined,
		configurable: true,
	});
	Object.defineProperty(globalThis, 'VideoFrame', {
		value: available ? function VideoFrame() {} : undefined,
		configurable: true,
	});
}

function createCanvas(): HTMLCanvasElement {
	const canvas = document.createElement('canvas');
	canvas.width = 640;
	canvas.height = 360;
	return canvas;
}

function createOptions(overrides: Partial<VideoGenerationOptions> = {}): VideoGenerationOptions {
	return {
		filename: 'test-video',
		format: 'webm',
		frameRate: 60,
		frameCount: 12,
		bitrate: 'medium',
		bitrateMode: 'variable',
		latencyMode: 'quality',
		hardwareAcceleration: 'no-preference',
		keyFrameInterval: 2,
		pixelDensity: 1,
		width: 640,
		height: 360,
		transparent: false,
		debugLogging: false,
		...overrides,
	};
}

function createFrameDriver(): VideoFrameDriverLike {
	return {
		canvas: createCanvas(),
		$render: async () => {
			throw new Error('frame driver should not be called');
		},
	};
}

function createDeferred(): {
	promise: Promise<void>;
	resolve: () => void;
	reject: (error: unknown) => void;
} {
	let resolve!: () => void;
	let reject!: (error: unknown) => void;
	const promise = new Promise<void>((resolvePromise, rejectPromise) => {
		resolve = resolvePromise;
		reject = rejectPromise;
	});
	return { promise, resolve, reject };
}

async function waitFor(condition: () => boolean): Promise<void> {
	for (let index = 0; index < 250; index++) {
		if (condition()) return;
		await Promise.resolve();
	}
	throw new Error('Timed out waiting for test condition.');
}

async function waitForMacrotask(condition: () => boolean): Promise<void> {
	for (let index = 0; index < 50; index++) {
		if (condition()) return;
		await new Promise((resolve) => setTimeout(resolve, 10));
	}
	throw new Error('Timed out waiting for test condition.');
}

describe('VideoRecorder', () => {
	afterEach(() => {
		vi.useRealTimers();
		setWebCodecsAvailable(false);
		mediabunnyMock.canvasSourceConfigs.length = 0;
		mediabunnyMock.canvasSourceAdds.length = 0;
		mediabunnyMock.addImpl.mockReset();
		mediabunnyMock.addImpl.mockResolvedValue(undefined);
		mediabunnyMock.outputStart.mockReset();
		mediabunnyMock.outputStart.mockResolvedValue(undefined);
		mediabunnyMock.outputFinalize.mockClear();
		mediabunnyMock.outputCancel.mockClear();
		mediabunnyMock.getFirstEncodableVideoCodec.mockClear();
	});

	it('fails before rendering when WebCodecs encoding is unavailable', async () => {
		setWebCodecsAvailable(false);

		await expect(new VideoRecorder().$record(createOptions(), createFrameDriver())).rejects.toMatchObject({
			code: 'VIDEO_EXPORT_UNSUPPORTED',
		});
	});

	it('rejects transparent MP4 exports before rendering', async () => {
		setWebCodecsAvailable(true);

		await expect(
			new VideoRecorder().$record(createOptions({ format: 'mp4', transparent: true }), createFrameDriver())
		).rejects.toBeInstanceOf(VideoExportError);
		await expect(
			new VideoRecorder().$record(createOptions({ format: 'mp4', transparent: true }), createFrameDriver())
		).rejects.toMatchObject({
			code: 'VIDEO_TRANSPARENCY_UNSUPPORTED',
		});
	});

	it('forwards curated Mediabunny encoder options to CanvasSource', async () => {
		setWebCodecsAvailable(true);
		const canvas = createCanvas();
		const frameDriver: VideoFrameDriverLike = {
			canvas,
			$render: async ({ onFrame }) => {
				await onFrame({ frameIndex: 0, canvas });
			},
		};

		await new VideoRecorder().$record(
			createOptions({
				bitrate: 'high',
				bitrateMode: 'constant',
				latencyMode: 'realtime',
				hardwareAcceleration: 'prefer-hardware',
				keyFrameInterval: 0.5,
				transparent: true,
			}),
			frameDriver
		);

		expect(mediabunnyMock.canvasSourceConfigs).toHaveLength(1);
		expect(mediabunnyMock.canvasSourceConfigs[0]).toMatchObject({
			alpha: 'keep',
			bitrateMode: 'constant',
			latencyMode: 'realtime',
			hardwareAcceleration: 'prefer-hardware',
			keyFrameInterval: 0.5,
			sizeChangeBehavior: 'deny',
		});
	});

	it('queues rendered frames before waiting for slow encoder backpressure', async () => {
		setWebCodecsAvailable(true);
		const canvas = createCanvas();
		const deferreds = Array.from({ length: 4 }, () => createDeferred());
		let addIndex = 0;
		mediabunnyMock.addImpl.mockImplementation(() => deferreds[addIndex++]!.promise);
		const frameDriver: VideoFrameDriverLike = {
			canvas,
			$render: async ({ frameCount, onFrame }) => {
				for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
					await onFrame({ frameIndex, canvas });
				}
			},
		};

		const exportPromise = new VideoRecorder().$record(createOptions({ frameCount: 4 }), frameDriver);

		await waitFor(() => mediabunnyMock.canvasSourceAdds.length === 4);
		expect(mediabunnyMock.outputFinalize).not.toHaveBeenCalled();

		deferreds.forEach((deferred) => deferred.resolve());
		await exportPromise;

		expect(mediabunnyMock.outputFinalize).toHaveBeenCalledTimes(1);
		expect(mediabunnyMock.canvasSourceAdds.map((entry) => entry.timestamp)).toEqual([0, 1 / 60, 2 / 60, 3 / 60]);
	});

	it('keeps unresolved encoder work bounded before accepting more frames', async () => {
		setWebCodecsAvailable(true);
		const canvas = createCanvas();
		const deferreds = Array.from({ length: 5 }, () => createDeferred());
		let addIndex = 0;
		mediabunnyMock.addImpl.mockImplementation(() => deferreds[addIndex++]!.promise);
		const frameDriver: VideoFrameDriverLike = {
			canvas,
			$render: async ({ frameCount, onFrame }) => {
				for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
					await onFrame({ frameIndex, canvas });
				}
			},
		};

		const exportPromise = new VideoRecorder().$record(createOptions({ frameCount: 5 }), frameDriver);

		await waitFor(() => mediabunnyMock.canvasSourceAdds.length === 4);
		await Promise.resolve();
		expect(mediabunnyMock.canvasSourceAdds).toHaveLength(4);
		expect(mediabunnyMock.outputFinalize).not.toHaveBeenCalled();

		deferreds[0]!.resolve();
		await waitForMacrotask(() => mediabunnyMock.canvasSourceAdds.length === 5);
		deferreds.slice(1).forEach((deferred) => deferred.resolve());
		await exportPromise;

		expect(mediabunnyMock.outputFinalize).toHaveBeenCalledTimes(1);
	});

	it('keeps frame progress monotonic while draining bounded encoder backpressure', async () => {
		setWebCodecsAvailable(true);
		const canvas = createCanvas();
		const progressFrames: number[] = [];
		const frameDriver: VideoFrameDriverLike = {
			canvas,
			$render: async ({ frameCount, onFrame }) => {
				for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
					await onFrame({ frameIndex, canvas });
				}
			},
		};

		const exportPromise = new VideoRecorder().$record(
			createOptions({ frameCount: 33 }),
			frameDriver,
			(progress) => {
				if (progress.frameIndex != null) {
					progressFrames.push(progress.frameIndex);
				}
			}
		);

		await waitForMacrotask(() => mediabunnyMock.canvasSourceAdds.length === 33);
		await exportPromise;

		expect(progressFrames).toEqual([...progressFrames].sort((a, b) => a - b));
		expect(progressFrames.at(-1)).toBe(33);
	});

	it('reports a typed timeout instead of hanging while draining encoder backpressure', async () => {
		vi.useFakeTimers();
		setWebCodecsAvailable(true);
		const canvas = createCanvas();
		mediabunnyMock.addImpl.mockImplementation(() => new Promise<void>(() => undefined));
		const frameDriver: VideoFrameDriverLike = {
			canvas,
			$render: async ({ onFrame }) => {
				await onFrame({ frameIndex: 0, canvas });
			},
		};

		const exportPromise = new VideoRecorder().$record(createOptions({ frameCount: 1 }), frameDriver);
		const expectation = expect(exportPromise).rejects.toMatchObject({
			code: 'VIDEO_EXPORT_TIMEOUT',
		});
		await vi.advanceTimersByTimeAsync(0);
		await waitFor(() => mediabunnyMock.canvasSourceAdds.length === 1);
		await vi.advanceTimersByTimeAsync(30_000);

		await expectation;
		expect(mediabunnyMock.outputCancel).toHaveBeenCalledTimes(1);
	});

	it('reports a typed timeout instead of hanging while finalizing output', async () => {
		vi.useFakeTimers();
		setWebCodecsAvailable(true);
		const canvas = createCanvas();
		mediabunnyMock.outputFinalize.mockImplementation(() => new Promise<void>(() => undefined));
		const frameDriver: VideoFrameDriverLike = {
			canvas,
			$render: async ({ onFrame }) => {
				await onFrame({ frameIndex: 0, canvas });
			},
		};

		const exportPromise = new VideoRecorder().$record(createOptions({ frameCount: 1 }), frameDriver);
		const expectation = expect(exportPromise).rejects.toMatchObject({
			code: 'VIDEO_EXPORT_TIMEOUT',
		});
		await vi.advanceTimersByTimeAsync(0);
		await waitFor(() => mediabunnyMock.outputFinalize.mock.calls.length === 1);
		await vi.advanceTimersByTimeAsync(30_000);

		await expectation;
		expect(mediabunnyMock.outputCancel).toHaveBeenCalledTimes(1);
	});
});
