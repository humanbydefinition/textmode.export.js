// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest';
import { VideoRecorder } from './VideoRecorder';
import type { VideoFrameDriverLike, VideoGenerationOptions } from './types';

const mediabunnyMock = vi.hoisted(() => ({
	canvasSourceConfigs: [] as Array<Record<string, unknown>>,
	canvasSourceAdds: [] as Array<{ timestamp: number; duration: number }>,
	trackMetadata: [] as Array<Record<string, unknown>>,
	addImpl: vi.fn(async () => undefined as void),
	outputStart: vi.fn(async () => undefined as void),
	outputFinalize: vi.fn(async () => undefined as void),
	outputCancel: vi.fn(async () => undefined as void),
	canEncodeVideo: vi.fn(async () => true),
	qualityOptions: [] as unknown[],
	closed: 0,
}));

vi.mock('mediabunny', () => ({
	BufferTarget: class BufferTarget {
		public buffer = new Uint8Array([1, 2, 3]).buffer;
	},
	Quality: class Quality {
		public readonly options: unknown;
		constructor(options: unknown) {
			this.options = options;
			mediabunnyMock.qualityOptions.push(options);
		}
	},
	CanvasSource: class CanvasSource {
		constructor(_canvas: HTMLCanvasElement, config: Record<string, unknown>) {
			mediabunnyMock.canvasSourceConfigs.push(config);
		}

		public add(timestamp: number, duration: number): Promise<void> {
			mediabunnyMock.canvasSourceAdds.push({ timestamp, duration });
			return mediabunnyMock.addImpl();
		}

		public close(): void {
			mediabunnyMock.closed += 1;
		}
	},
	Mp4OutputFormat: class Mp4OutputFormat {
		public mimeType = 'video/mp4';
		public getSupportedVideoCodecs(): string[] {
			return ['avc'];
		}
	},
	WebMOutputFormat: class WebMOutputFormat {
		public mimeType = 'video/webm';
		public getSupportedVideoCodecs(): string[] {
			return ['vp9', 'vp8'];
		}
	},
	Output: class Output {
		public addVideoTrack(_source: unknown, metadata: Record<string, unknown>): void {
			mediabunnyMock.trackMetadata.push(metadata);
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
	StreamTarget: class StreamTarget {},
	canEncodeVideo: mediabunnyMock.canEncodeVideo,
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
		frameCount: 3,
		bitrate: 'medium',
		bitrateMode: 'variable',
		contentHint: 'text',
		latencyMode: 'quality',
		hardwareAcceleration: 'no-preference',
		keyFrameInterval: 2,
		pixelDensity: 1,
		width: 640,
		height: 360,
		transparent: false,
		debugLogging: false,
		allowLargeInMemory: false,
		...overrides,
	};
}

function createFrameDriver(onFrame?: VideoFrameDriverLike['$render']): VideoFrameDriverLike {
	return { canvas: createCanvas(), $render: onFrame ?? (async () => undefined) };
}

function qualityOptions(): Record<string, unknown> {
	return mediabunnyMock.qualityOptions.at(-1) as Record<string, unknown>;
}

describe('VideoRecorder', () => {
	afterEach(() => {
		setWebCodecsAvailable(false);
		mediabunnyMock.canvasSourceConfigs.length = 0;
		mediabunnyMock.canvasSourceAdds.length = 0;
		mediabunnyMock.trackMetadata.length = 0;
		mediabunnyMock.qualityOptions.length = 0;
		mediabunnyMock.closed = 0;
		mediabunnyMock.addImpl.mockReset();
		mediabunnyMock.addImpl.mockResolvedValue(undefined);
		mediabunnyMock.outputStart.mockReset();
		mediabunnyMock.outputStart.mockResolvedValue(undefined);
		mediabunnyMock.outputFinalize.mockReset();
		mediabunnyMock.outputFinalize.mockResolvedValue(undefined);
		mediabunnyMock.outputCancel.mockReset();
		mediabunnyMock.outputCancel.mockResolvedValue(undefined);
		mediabunnyMock.canEncodeVideo.mockReset();
		mediabunnyMock.canEncodeVideo.mockResolvedValue(true);
	});

	it('fails before rendering when WebCodecs encoding is unavailable', async () => {
		setWebCodecsAvailable(false);
		const render = vi.fn();
		await expect(new VideoRecorder().$record(createOptions(), createFrameDriver(render))).rejects.toMatchObject({
			code: 'VIDEO_EXPORT_UNSUPPORTED',
		});
		expect(render).not.toHaveBeenCalled();
	});

	it('rejects transparent MP4 and odd MP4 dimensions before rendering', async () => {
		setWebCodecsAvailable(true);
		const render = vi.fn();
		await expect(
			new VideoRecorder().$record(createOptions({ format: 'mp4', transparent: true }), createFrameDriver(render))
		).rejects.toMatchObject({ code: 'VIDEO_TRANSPARENCY_UNSUPPORTED' });
		await expect(
			new VideoRecorder().$record(createOptions({ format: 'mp4', width: 641 }), createFrameDriver(render))
		).rejects.toMatchObject({ code: 'VIDEO_DIMENSIONS_UNSUPPORTED' });
		expect(render).not.toHaveBeenCalled();
	});

	it('maps named presets to Mediabunny Quality and passes the complete source configuration', async () => {
		setWebCodecsAvailable(true);
		const canvas = createCanvas();
		await new VideoRecorder().$record(
			createOptions({
				bitrate: 'high',
				bitrateMode: 'constant',
				latencyMode: 'realtime',
				hardwareAcceleration: 'prefer-hardware',
				keyFrameInterval: 0.5,
			}),
			createFrameDriver(async ({ onFrame }) => onFrame?.({ frameIndex: 0, canvas }))
		);

		expect(qualityOptions()).toBe('very-high');
		expect(mediabunnyMock.canvasSourceConfigs[0]).toMatchObject({
			quality: expect.objectContaining({ options: 'very-high' }),
			contentHint: 'text',
			latencyMode: 'realtime',
			hardwareAcceleration: 'prefer-hardware',
			keyFrameInterval: 0.5,
			sizeChangeBehavior: 'deny',
		});
		expect(mediabunnyMock.trackMetadata[0]).toEqual({ frameRate: 60 });
	});

	it('maps ultra to quantizer zero with a frame-rate-aware fallback', async () => {
		setWebCodecsAvailable(true);
		await new VideoRecorder().$record(createOptions({ bitrate: 'ultra', frameRate: 30 }), createFrameDriver());
		expect(qualityOptions()).toEqual({ bitrate: 3_456_000, bitrateMode: 'variable', quantizer: 0 });
		expect(mediabunnyMock.canEncodeVideo).toHaveBeenCalledWith(
			'vp9',
			expect.objectContaining({ quality: expect.anything(), contentHint: 'text' })
		);
	});

	it('preserves numeric bitrates and bitrate mode through Quality', async () => {
		setWebCodecsAvailable(true);
		await new VideoRecorder().$record(
			createOptions({ bitrate: 1_500_001, bitrateMode: 'constant' }),
			createFrameDriver()
		);
		expect(qualityOptions()).toEqual({ bitrate: 1_500_001, bitrateMode: 'constant' });
	});

	it('awaits each source add before requesting the next rendered frame', async () => {
		setWebCodecsAvailable(true);
		let resolveFirst!: () => void;
		mediabunnyMock.addImpl.mockImplementationOnce(
			() =>
				new Promise<void>((resolve) => {
					resolveFirst = resolve;
				})
		);
		const render = async ({
			frameCount,
			onFrame,
		}: {
			frameCount: number;
			onFrame: NonNullable<Parameters<VideoFrameDriverLike['$render']>[0]['onFrame']>;
		}) => {
			for (let frameIndex = 0; frameIndex < frameCount; frameIndex++)
				await onFrame({ frameIndex, canvas: createCanvas() });
		};
		const exportPromise = new VideoRecorder().$record(createOptions({ frameCount: 2 }), createFrameDriver(render));
		await vi.waitFor(() => expect(mediabunnyMock.canvasSourceAdds).toHaveLength(1));
		resolveFirst();
		await exportPromise;
		expect(mediabunnyMock.canvasSourceAdds).toHaveLength(2);
		expect(mediabunnyMock.canvasSourceAdds.map(({ timestamp }) => timestamp)).toEqual([0, 1 / 60]);
	});

	it('closes the source before finalizing and cancels once on an aborted add', async () => {
		setWebCodecsAvailable(true);
		await new VideoRecorder().$record(createOptions({ frameCount: 1 }), createFrameDriver());
		expect(mediabunnyMock.closed).toBe(1);
		expect(mediabunnyMock.outputFinalize).toHaveBeenCalledTimes(1);

		const controller = new AbortController();
		mediabunnyMock.addImpl.mockImplementation(() => new Promise<void>(() => undefined));
		const exportPromise = new VideoRecorder().$record(
			createOptions({ signal: controller.signal }),
			createFrameDriver(async ({ onFrame }) => onFrame?.({ frameIndex: 0, canvas: createCanvas() }))
		);
		await vi.waitFor(() => expect(mediabunnyMock.canvasSourceAdds).toHaveLength(1));
		controller.abort();
		await expect(exportPromise).rejects.toMatchObject({ code: 'VIDEO_EXPORT_ABORTED' });
		expect(mediabunnyMock.outputCancel).toHaveBeenCalledTimes(1);
	});

	it('times out during finalization and cancels the output', async () => {
		vi.useFakeTimers();
		setWebCodecsAvailable(true);
		mediabunnyMock.outputFinalize.mockImplementation(() => new Promise<void>(() => undefined));
		const exportPromise = new VideoRecorder().$record(createOptions({ frameCount: 1 }), createFrameDriver());
		const expectation = expect(exportPromise).rejects.toMatchObject({ code: 'VIDEO_EXPORT_TIMEOUT' });
		await vi.advanceTimersByTimeAsync(30_000);
		await expectation;
		expect(mediabunnyMock.outputCancel).toHaveBeenCalledTimes(1);
		vi.useRealTimers();
	});
});
