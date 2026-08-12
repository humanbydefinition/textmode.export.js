import type { Textmodifier } from 'textmode.js';
import { applyPalette, GIFEncoder, quantize, type GIFPalette } from 'gifenc';
import { FileHandler } from '../base';
import { VideoFrameDriver, type PostDrawSubscription } from '../video/VideoFrameDriver';
import { GIFWorkerClient } from './GIFWorkerClient';
import type { GIFExportOptions, GIFGenerationOptions } from './types';

/** Deterministic, bounded-memory GIF exporter. */
export class GIFExporter {
	constructor(
		private readonly _textmodifier: Textmodifier,
		private readonly _registerPostDrawHook: PostDrawSubscription
	) {}

	public async $saveGIF(options: GIFExportOptions = {}): Promise<void> {
		const blob = await this.$generateGIFBlob(options);
		new FileHandler().$downloadFile(blob, options.filename);
	}

	/** Generates a GIF blob without initiating a download. */
	public async $generateGIFBlob(options: GIFExportOptions = {}): Promise<Blob> {
		const generationOptions = this._applyDefaultOptions(options);
		const liveCanvas = this._textmodifier.canvas;
		const width = Math.max(1, Math.round(liveCanvas.width * generationOptions.scale));
		const height = Math.max(1, Math.round(liveCanvas.height * generationOptions.scale));
		const frameDriver = new VideoFrameDriver(this._textmodifier, this._registerPostDrawHook, width, height);
		const context = frameDriver.canvas.getContext('2d', { willReadFrequently: true });

		if (!context) {
			throw new Error('GIF export requires a 2D canvas context.');
		}

		const encoder = typeof Worker === 'undefined' ? GIFEncoder() : null;
		const worker =
			typeof Worker === 'undefined'
				? null
				: new GIFWorkerClient(
						width,
						height,
						generationOptions.frameRate,
						generationOptions.repeat,
						generationOptions.signal
					);
		try {
			this._throwIfAborted(generationOptions.signal);
			await frameDriver.$render({
				frameCount: generationOptions.frameCount,
				frameRate: generationOptions.frameRate,
				signal: generationOptions.signal,
				prepareFrame: generationOptions.prepareFrame,
				onFrame: async ({ frameIndex, canvas }) => {
					this._throwIfAborted(generationOptions.signal);
					const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
					if (worker) {
						await worker.encodeFrame(imageData.data.buffer as ArrayBuffer, frameIndex);
					} else if (encoder) {
						const rgbaBuffer = imageData.data;
						const palette: GIFPalette = quantize(rgbaBuffer, 256, {});
						const indexedPixels = applyPalette(rgbaBuffer, palette);
						encoder.writeFrame(indexedPixels, canvas.width, canvas.height, {
							palette,
							delay: Math.round(1000 / generationOptions.frameRate),
							repeat: frameIndex === 0 ? generationOptions.repeat : -1,
						});
					}
					options.onProgress?.({
						state: 'encoding',
						frameIndex: frameIndex + 1,
						totalFrames: generationOptions.frameCount,
					});
					if ((frameIndex + 1) % 2 === 0) {
						await this._yieldToBrowser(generationOptions.signal);
					}
				},
			});

			this._throwIfAborted(generationOptions.signal);
			let buffer: ArrayBuffer;
			if (worker) {
				buffer = await worker.finish();
			} else if (encoder) {
				encoder.finish();
				const bytes = encoder.bytes();
				buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
			} else {
				throw new Error('No GIF encoder is available.');
			}
			options.onProgress?.({ state: 'completed', totalFrames: generationOptions.frameCount });
			return new Blob([buffer], { type: 'image/gif' });
		} catch (error) {
			options.onProgress?.({
				state: 'error',
				message: error instanceof Error ? error.message : 'GIF export failed',
			});
			throw error;
		} finally {
			worker?.dispose();
		}
	}

	private _applyDefaultOptions(options: GIFExportOptions): GIFGenerationOptions {
		return {
			filename: options.filename,
			frameCount: Math.max(1, Math.abs(Math.round(options.frameCount ?? 300))),
			frameRate: Math.max(1, Math.abs(options.frameRate ?? 60)),
			scale: Math.max(Number.EPSILON, Math.abs(options.scale ?? 1)),
			repeat: Math.max(-1, Math.round(options.repeat ?? 0)),
			signal: options.signal,
			prepareFrame: options.prepareFrame,
		};
	}

	private _throwIfAborted(signal?: AbortSignal): void {
		if (signal?.aborted) {
			throw new DOMException('GIF export was cancelled.', 'AbortError');
		}
	}

	private _yieldToBrowser(signal?: AbortSignal): Promise<void> {
		return new Promise((resolve, reject) => {
			if (signal?.aborted) {
				reject(new DOMException('GIF export was cancelled.', 'AbortError'));
				return;
			}
			setTimeout(resolve, 0);
		});
	}
}
