import type { Textmodifier } from 'textmode.js';
import { createFrameSequenceAbortError } from './errors';
import { frameTiming } from './FrameSchedule';
import type { FrameSequenceRenderOptions, FrameSequenceStagingSurface, PostDrawSubscription } from './types';
import { withAbortableFrameTimeout } from './withAbortableTimeout';

const FRAME_RENDER_TIMEOUT_MS = 30_000;

type FrameSequenceTextmodifier = Textmodifier & {
	frameCount: number;
	millis: number;
	secs?: number;
	noLoop(): void;
	loop(): void;
	redraw(count?: number): void;
	isLooping(): boolean;
	deltaTime(): number;
	frameRate(fps?: number): number | void;
	resizeCanvas(width: number, height: number): void;
};

type MethodKey = 'deltaTime' | 'frameRate' | 'resizeCanvas';
type TimingPropertyKey = 'frameCount' | 'millis' | 'secs';

interface MethodSnapshot<K extends MethodKey> {
	key: K;
	hadOwnProperty: boolean;
	value: FrameSequenceTextmodifier[K];
}

interface PropertySnapshot {
	key: TimingPropertyKey;
	hadOwnProperty: boolean;
	descriptor?: PropertyDescriptor;
}

interface FrameRenderRequest {
	frameIndex: number;
	resolve(): void;
	reject(error: unknown): void;
}

/** Drives deterministic export frames through public textmode.js lifecycle APIs. */
export class FrameSequenceDriver {
	public readonly canvas: HTMLCanvasElement;

	private readonly _textmodifier: FrameSequenceTextmodifier;
	private readonly _registerPostDrawHook: PostDrawSubscription;
	private readonly _context: CanvasRenderingContext2D | null;
	private readonly _sourceCanvas: HTMLCanvasElement;
	private _pendingFrame: FrameRenderRequest | null = null;
	private _syntheticFrameCount = 0;
	private _syntheticMillis = 0;

	constructor(
		textmodifier: Textmodifier,
		registerPostDrawHook: PostDrawSubscription,
		stagingSurface?: FrameSequenceStagingSurface
	) {
		this._textmodifier = textmodifier as FrameSequenceTextmodifier;
		this._registerPostDrawHook = registerPostDrawHook;
		this._sourceCanvas = textmodifier.canvas;
		this.canvas = stagingSurface ? this._createStagingCanvas(stagingSurface) : this._sourceCanvas;

		if (stagingSurface) {
			const context = this.canvas.getContext('2d');
			if (!context) throw new Error('Frame-sequence export requires a 2D canvas context for staging frames.');
			context.imageSmoothingEnabled = false;
			this._context = context;
		} else {
			this._context = null;
		}
	}

	public async $render(options: FrameSequenceRenderOptions): Promise<void> {
		this._throwIfAborted(options.signal);
		const textmodifier = this._textmodifier;
		const originalLooping = textmodifier.isLooping();
		const originalFrameCount = textmodifier.frameCount;
		const originalMillis = textmodifier.millis;
		const hadSecs = 'secs' in textmodifier;
		const originalFrameRate = textmodifier.frameRate();
		const methodSnapshots = this._captureMethodSnapshots();
		const propertySnapshots = this._capturePropertySnapshots();
		const stopHook = this._registerPostDrawHook(() => this._capturePendingFrame());

		try {
			textmodifier.noLoop();
			this._syntheticFrameCount = originalFrameCount;
			this._syntheticMillis = originalMillis;
			this._shadowTimingProperties(hadSecs);
			this._shadowTimingMethods(options.frameRate, 1000 / options.frameRate);
			this._shadowResizeCanvas();

			for (let frameIndex = 0; frameIndex < options.frameCount; frameIndex++) {
				this._throwIfAborted(options.signal);
				const timing = frameTiming(frameIndex, options.frameRate);
				this._syntheticFrameCount = originalFrameCount + frameIndex + 1;
				this._syntheticMillis = timing.startSeconds * 1000;
				await options.prepareFrame?.({
					frameIndex,
					frameCount: options.frameCount,
					startSeconds: timing.startSeconds,
					centerSeconds: timing.centerSeconds,
					endSeconds: timing.endSeconds,
					timeSeconds: timing.startSeconds,
					frameRate: options.frameRate,
					signal: options.signal,
				});
				this._throwIfAborted(options.signal);
				await this._renderOneFrame(frameIndex, options.signal);
				this._throwIfAborted(options.signal);
				await options.onFrame({ frameIndex, canvas: this.canvas });
				this._throwIfAborted(options.signal);
			}
		} finally {
			try {
				stopHook();
			} catch {
				// State restoration must not be skipped by subscription cleanup failures.
			}
			this._pendingFrame?.reject(new Error('Frame-sequence rendering was interrupted.'));
			this._pendingFrame = null;
			this._restoreProperties(propertySnapshots);
			this._restoreMethods(methodSnapshots);
			if (typeof originalFrameRate === 'number') textmodifier.frameRate(originalFrameRate);
			if (originalLooping) textmodifier.loop();
			else textmodifier.noLoop();
		}
	}

	private _renderOneFrame(frameIndex: number, signal?: AbortSignal): Promise<void> {
		if (this._pendingFrame) throw new Error('A frame-sequence render is already pending.');
		const renderPromise = new Promise<void>((resolve, reject) => {
			this._pendingFrame = { frameIndex, resolve, reject };
			try {
				this._textmodifier.redraw(1);
			} catch (error) {
				this._pendingFrame = null;
				reject(error);
			}
		});

		return withAbortableFrameTimeout(
			renderPromise,
			`Frame ${frameIndex + 1} did not render within ${FRAME_RENDER_TIMEOUT_MS}ms.`,
			signal,
			FRAME_RENDER_TIMEOUT_MS
		).catch((error: unknown) => {
			if (this._pendingFrame?.frameIndex === frameIndex) this._pendingFrame = null;
			throw error;
		});
	}

	private _capturePendingFrame(): void {
		const pendingFrame = this._pendingFrame;
		if (!pendingFrame) return;
		try {
			if (this._context) {
				this._context.clearRect(0, 0, this.canvas.width, this.canvas.height);
				this._context.drawImage(
					this._sourceCanvas,
					0,
					0,
					this._sourceCanvas.width,
					this._sourceCanvas.height,
					0,
					0,
					this.canvas.width,
					this.canvas.height
				);
			}
			this._pendingFrame = null;
			pendingFrame.resolve();
		} catch (error) {
			this._pendingFrame = null;
			pendingFrame.reject(error);
		}
	}

	private _createStagingCanvas(surface: FrameSequenceStagingSurface): HTMLCanvasElement {
		const canvas = document.createElement('canvas');
		canvas.width = Math.max(1, Math.round(surface.width));
		canvas.height = Math.max(1, Math.round(surface.height));
		return canvas;
	}

	private _captureMethodSnapshots(): Array<MethodSnapshot<MethodKey>> {
		return (['deltaTime', 'frameRate', 'resizeCanvas'] as const).map((key) => ({
			key,
			hadOwnProperty: Object.prototype.hasOwnProperty.call(this._textmodifier, key),
			value: this._textmodifier[key],
		}));
	}

	private _capturePropertySnapshots(): PropertySnapshot[] {
		return (['frameCount', 'millis', 'secs'] as const).map((key) => ({
			key,
			hadOwnProperty: Object.prototype.hasOwnProperty.call(this._textmodifier, key),
			descriptor: Object.getOwnPropertyDescriptor(this._textmodifier, key),
		}));
	}

	private _shadowTimingProperties(includeSecs: boolean): void {
		Object.defineProperty(this._textmodifier, 'frameCount', {
			configurable: true,
			enumerable: true,
			get: () => this._syntheticFrameCount,
			set: (value: number) => {
				this._syntheticFrameCount = value;
			},
		});
		Object.defineProperty(this._textmodifier, 'millis', {
			configurable: true,
			enumerable: true,
			get: () => this._syntheticMillis,
			set: (value: number) => {
				this._syntheticMillis = value;
			},
		});
		if (includeSecs) {
			Object.defineProperty(this._textmodifier, 'secs', {
				configurable: true,
				enumerable: true,
				get: () => this._syntheticMillis / 1000,
				set: (value: number) => {
					this._syntheticMillis = value * 1000;
				},
			});
		}
	}

	private _shadowTimingMethods(frameRate: number, deltaTime: number): void {
		const originalFrameRate = this._textmodifier.frameRate;
		this._textmodifier.deltaTime = () => deltaTime;
		this._textmodifier.frameRate = function (fps?: number): number | void {
			if (fps === undefined) return frameRate;
			return originalFrameRate.call(this, fps);
		};
	}

	private _shadowResizeCanvas(): void {
		this._textmodifier.resizeCanvas = () => undefined;
	}

	private _restoreMethods(snapshots: Array<MethodSnapshot<MethodKey>>): void {
		const textmodifier = this._textmodifier as unknown as Record<MethodKey, unknown>;
		for (const snapshot of snapshots) {
			if (snapshot.hadOwnProperty) textmodifier[snapshot.key] = snapshot.value;
			else delete textmodifier[snapshot.key];
		}
	}

	private _restoreProperties(snapshots: PropertySnapshot[]): void {
		for (const snapshot of snapshots) {
			if (snapshot.hadOwnProperty && snapshot.descriptor) {
				Object.defineProperty(this._textmodifier, snapshot.key, snapshot.descriptor);
			} else {
				delete this._textmodifier[snapshot.key];
			}
		}
	}

	private _throwIfAborted(signal?: AbortSignal): void {
		if (signal?.aborted) throw createFrameSequenceAbortError();
	}
}
