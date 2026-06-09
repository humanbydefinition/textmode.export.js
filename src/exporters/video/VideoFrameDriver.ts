import type { Textmodifier, TextmodePluginContext } from 'textmode.js';
import { createAbortError } from './errors';
import type { VideoRenderFrameOptions } from './types';

type VideoTextmodifier = Textmodifier & {
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
	value: VideoTextmodifier[K];
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

/**
 * Drives deterministic video export frames through public textmode APIs.
 *
 * The visible textmode canvas remains untouched. Each presented frame is copied
 * into a staging canvas sized for the requested video output.
 */
export class VideoFrameDriver {
	public readonly canvas: HTMLCanvasElement;

	private readonly _textmodifier: VideoTextmodifier;
	private readonly _registerPostDrawHook: TextmodePluginContext['registerPostDrawHook'];
	private readonly _context: CanvasRenderingContext2D;
	private readonly _sourceCanvas: HTMLCanvasElement;
	private _pendingFrame: FrameRenderRequest | null = null;
	private _syntheticFrameCount: number = 0;
	private _syntheticMillis: number = 0;

	constructor(
		textmodifier: Textmodifier,
		registerPostDrawHook: TextmodePluginContext['registerPostDrawHook'],
		width: number,
		height: number
	) {
		this._textmodifier = textmodifier as VideoTextmodifier;
		this._registerPostDrawHook = registerPostDrawHook;
		this._sourceCanvas = textmodifier.canvas;
		this.canvas = this._createStagingCanvas(width, height);

		const context = this.canvas.getContext('2d');
		if (!context) {
			throw new Error('Video export requires a 2D canvas context for staging frames.');
		}
		context.imageSmoothingEnabled = false;
		this._context = context;
	}

	public async $render(options: VideoRenderFrameOptions): Promise<void> {
		const textmodifier = this._textmodifier;
		const frameCount = Math.max(1, Math.round(options.frameCount));
		const frameRate = Math.max(1, Math.round(options.frameRate));
		const deltaTime = 1000 / frameRate;
		const originalLooping = textmodifier.isLooping();
		const originalFrameCount = textmodifier.frameCount;
		const originalMillis = textmodifier.millis;
		const hadSecs = 'secs' in textmodifier;
		const originalSecs = textmodifier.secs;
		const methodSnapshots = this._captureMethodSnapshots();
		const propertySnapshots = this._capturePropertySnapshots();

		const stopHook = this._registerPostDrawHook(() => {
			this._capturePendingFrame();
		});

		try {
			textmodifier.noLoop();
			this._syntheticFrameCount = originalFrameCount;
			this._syntheticMillis = originalMillis;
			this._shadowTimingProperties(hadSecs);
			this._shadowTimingMethods(frameRate, deltaTime);
			this._shadowResizeCanvas();

			for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
				this._throwIfAborted(options.signal);
				this._syntheticFrameCount = originalFrameCount + frameIndex + 1;
				this._syntheticMillis = (frameIndex * 1000) / frameRate;

				await this._renderOneFrame(frameIndex);
				this._throwIfAborted(options.signal);
				await options.onFrame({ frameIndex, canvas: this.canvas });
			}
		} finally {
			stopHook();
			this._pendingFrame?.reject(new Error('Video export frame rendering was interrupted.'));
			this._pendingFrame = null;
			this._restoreProperties(propertySnapshots);
			this._restoreMethods(methodSnapshots);
			textmodifier.frameCount = originalFrameCount;
			textmodifier.millis = originalMillis;
			if (hadSecs && originalSecs !== undefined) {
				textmodifier.secs = originalSecs;
			}
			if (originalLooping) {
				textmodifier.loop();
			} else {
				textmodifier.noLoop();
			}
		}
	}

	private _renderOneFrame(frameIndex: number): Promise<void> {
		if (this._pendingFrame) {
			throw new Error('A video export frame is already pending.');
		}

		const textmodifier = this._textmodifier;
		return new Promise((resolve, reject) => {
			this._pendingFrame = { frameIndex, resolve, reject };
			try {
				textmodifier.redraw(1);
			} catch (error) {
				this._pendingFrame = null;
				reject(error);
			}
		});
	}

	private _capturePendingFrame(): void {
		const pendingFrame = this._pendingFrame;
		if (!pendingFrame) {
			return;
		}

		try {
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
			this._pendingFrame = null;
			pendingFrame.resolve();
		} catch (error) {
			this._pendingFrame = null;
			pendingFrame.reject(error);
		}
	}

	private _createStagingCanvas(width: number, height: number): HTMLCanvasElement {
		const canvas = document.createElement('canvas');
		canvas.width = Math.max(1, Math.round(width));
		canvas.height = Math.max(1, Math.round(height));
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
		const textmodifier = this._textmodifier;
		const originalFrameRate = textmodifier.frameRate;

		textmodifier.deltaTime = () => deltaTime;
		textmodifier.frameRate = function (fps?: number): number | void {
			if (fps === undefined) {
				return frameRate;
			}
			return originalFrameRate.call(this, fps);
		};
	}

	private _shadowResizeCanvas(): void {
		this._textmodifier.resizeCanvas = () => {
			// Resizes requested during export are ignored so video capture never mutates live layout.
		};
	}

	private _restoreMethods(snapshots: Array<MethodSnapshot<MethodKey>>): void {
		const textmodifier = this._textmodifier as unknown as Record<MethodKey, unknown>;
		for (const snapshot of snapshots) {
			if (snapshot.hadOwnProperty) {
				textmodifier[snapshot.key] = snapshot.value;
			} else {
				delete textmodifier[snapshot.key];
			}
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
		if (signal?.aborted) {
			throw createAbortError();
		}
	}
}
