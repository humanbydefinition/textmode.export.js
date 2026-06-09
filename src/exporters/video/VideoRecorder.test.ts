// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest';
import { VideoExportError, VideoRecorder, type VideoFrameDriverLike, type VideoGenerationOptions } from '.';

const mediabunnyMock = vi.hoisted(() => ({
	canvasSourceConfigs: [] as Array<Record<string, unknown>>,
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

		public async add(): Promise<void> {
			return undefined;
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
			return undefined;
		}

		public async finalize(): Promise<void> {
			return undefined;
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

describe('VideoRecorder', () => {
	afterEach(() => {
		setWebCodecsAvailable(false);
		mediabunnyMock.canvasSourceConfigs.length = 0;
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
});
