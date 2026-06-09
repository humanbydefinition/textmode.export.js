// @vitest-environment jsdom

import type { Textmodifier, TextmodePluginContext } from 'textmode.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { VideoExportError, VideoFrameDriver } from '.';

type PostDrawHook = Parameters<TextmodePluginContext['registerPostDrawHook']>[0];

interface FakeTextmodifier extends Partial<Textmodifier> {
	canvas: HTMLCanvasElement;
	frameCount: number;
	millis: number;
	secs: number;
	looping: boolean;
	noLoop: ReturnType<typeof vi.fn>;
	loop: ReturnType<typeof vi.fn>;
	redraw: ReturnType<typeof vi.fn>;
	isLooping: ReturnType<typeof vi.fn>;
	deltaTime: ReturnType<typeof vi.fn>;
	frameRate: ReturnType<typeof vi.fn>;
	resizeCanvas: ReturnType<typeof vi.fn>;
}

function createCanvas(width = 800, height = 600): HTMLCanvasElement {
	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	canvas.style.width = '100%';
	canvas.style.height = 'auto';
	return canvas;
}

function createHarness() {
	const sourceCanvas = createCanvas();
	let postDrawHook: PostDrawHook | undefined;

	const textmodifier: FakeTextmodifier = {
		canvas: sourceCanvas,
		frameCount: 7,
		millis: 1234,
		secs: 1.234,
		looping: true,
		noLoop: vi.fn(function (this: FakeTextmodifier) {
			this.looping = false;
		}),
		loop: vi.fn(function (this: FakeTextmodifier) {
			this.looping = true;
		}),
		redraw: vi.fn(function (this: FakeTextmodifier) {
			postDrawHook?.();
		}),
		isLooping: vi.fn(function (this: FakeTextmodifier) {
			return this.looping;
		}),
		deltaTime: vi.fn(() => 12),
		frameRate: vi.fn((fps?: number) => (fps === undefined ? 83 : undefined)),
		resizeCanvas: vi.fn(),
	};

	const registerPostDrawHook: TextmodePluginContext['registerPostDrawHook'] = (callback) => {
		postDrawHook = callback;
		return () => {
			if (postDrawHook === callback) {
				postDrawHook = undefined;
			}
		};
	};

	return { sourceCanvas, textmodifier, registerPostDrawHook };
}

function asTextmodifier(textmodifier: FakeTextmodifier): Textmodifier {
	return textmodifier as unknown as Textmodifier;
}

describe('VideoFrameDriver', () => {
	const context = {
		clearRect: vi.fn(),
		drawImage: vi.fn(),
		imageSmoothingEnabled: true,
	};
	let getContextSpy: { mockRestore(): void };

	beforeEach(() => {
		context.clearRect.mockClear();
		context.drawImage.mockClear();
		context.imageSmoothingEnabled = true;
		getContextSpy = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation((type) => {
			return type === '2d' ? (context as unknown as CanvasRenderingContext2D) : null;
		});
	});

	afterEach(() => {
		getContextSpy.mockRestore();
	});

	it('renders synthetic frames into a staging canvas without mutating the visible canvas', async () => {
		const { sourceCanvas, textmodifier, registerPostDrawHook } = createHarness();
		const driver = new VideoFrameDriver(asTextmodifier(textmodifier), registerPostDrawHook, 320, 240);
		const frames: Array<{ frameIndex: number; frameCount: number; millis: number; secs: number }> = [];

		await driver.$render({
			frameCount: 2,
			frameRate: 60,
			onFrame: async ({ frameIndex, canvas }) => {
				frames.push({
					frameIndex,
					frameCount: textmodifier.frameCount,
					millis: textmodifier.millis,
					secs: textmodifier.secs,
				});
				expect(canvas).toBe(driver.canvas);
				expect(canvas.width).toBe(320);
				expect(canvas.height).toBe(240);
				expect(textmodifier.deltaTime()).toBeCloseTo(1000 / 60);
				expect(textmodifier.frameRate()).toBe(60);
			},
		});

		expect(frames).toEqual([
			{ frameIndex: 0, frameCount: 8, millis: 0, secs: 0 },
			{ frameIndex: 1, frameCount: 9, millis: 1000 / 60, secs: 1 / 60 },
		]);
		expect(context.drawImage).toHaveBeenCalledTimes(2);
		expect(sourceCanvas.width).toBe(800);
		expect(sourceCanvas.height).toBe(600);
		expect(sourceCanvas.style.width).toBe('100%');
		expect(sourceCanvas.style.height).toBe('auto');
	});

	it('restores loop state, timing, and shadowed methods after success', async () => {
		const { textmodifier, registerPostDrawHook } = createHarness();
		const originalDeltaTime = textmodifier.deltaTime;
		const originalFrameRate = textmodifier.frameRate;
		const originalResizeCanvas = textmodifier.resizeCanvas;

		const driver = new VideoFrameDriver(asTextmodifier(textmodifier), registerPostDrawHook, 320, 240);
		await driver.$render({ frameCount: 1, frameRate: 30, onFrame: () => undefined });

		expect(textmodifier.loop).toHaveBeenCalledTimes(1);
		expect(textmodifier.frameCount).toBe(7);
		expect(textmodifier.millis).toBe(1234);
		expect(textmodifier.secs).toBe(1.234);
		expect(textmodifier.deltaTime).toBe(originalDeltaTime);
		expect(textmodifier.frameRate).toBe(originalFrameRate);
		expect(textmodifier.resizeCanvas).toBe(originalResizeCanvas);
	});

	it('restores state after abort and reports a typed error', async () => {
		const { textmodifier, registerPostDrawHook } = createHarness();
		const controller = new AbortController();
		const driver = new VideoFrameDriver(asTextmodifier(textmodifier), registerPostDrawHook, 320, 240);

		await expect(
			driver.$render({
				frameCount: 2,
				frameRate: 60,
				signal: controller.signal,
				onFrame: () => {
					controller.abort();
				},
			})
		).rejects.toMatchObject({
			code: 'VIDEO_EXPORT_ABORTED',
		} satisfies Partial<VideoExportError>);

		expect(textmodifier.frameCount).toBe(7);
		expect(textmodifier.millis).toBe(1234);
		expect(textmodifier.looping).toBe(true);
	});

	it('ignores resizeCanvas calls during export and restores the original method', async () => {
		const { textmodifier, registerPostDrawHook } = createHarness();
		const originalResizeCanvas = textmodifier.resizeCanvas;
		const driver = new VideoFrameDriver(asTextmodifier(textmodifier), registerPostDrawHook, 320, 240);

		await driver.$render({
			frameCount: 1,
			frameRate: 60,
			onFrame: () => {
				textmodifier.resizeCanvas(1, 1);
			},
		});

		expect(originalResizeCanvas).not.toHaveBeenCalled();
		textmodifier.resizeCanvas(2, 2);
		expect(originalResizeCanvas).toHaveBeenCalledWith(2, 2);
	});

	it('keeps a previously paused sketch paused after export', async () => {
		const { textmodifier, registerPostDrawHook } = createHarness();
		textmodifier.looping = false;
		const driver = new VideoFrameDriver(asTextmodifier(textmodifier), registerPostDrawHook, 320, 240);

		await driver.$render({ frameCount: 1, frameRate: 60, onFrame: () => undefined });

		expect(textmodifier.noLoop).toHaveBeenCalledTimes(2);
		expect(textmodifier.loop).not.toHaveBeenCalled();
		expect(textmodifier.looping).toBe(false);
	});
});
