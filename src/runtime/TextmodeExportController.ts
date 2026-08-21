import type { Textmodifier } from 'textmode.js';

import { SVGExporter, type SVGExportOptions } from '../exporters/svg';
import { ImageExporter, type ImageExportOptions } from '../exporters/image';
import { TXTExporter, type TXTExportOptions } from '../exporters/txt';
import { GIFExporter, type GIFExportOptions } from '../exporters/gif';
import { VideoExporter } from '../exporters/video/VideoExporter';
import type { VideoExportOptions } from '../exporters/video';
import { JSONExporter, type JSONExportOptions } from '../exporters/json';
import { createExportOverlay } from '../overlay';
import type { OverlayController } from '../overlay/core/OverlayController';
import { createLayerTargetProvider } from '../exporters/base';
import type { ExportDefaults, ExportDefaultsPatch, ExportOverlayController, TextmodeExportAPI } from '../types';

export const EXPORT_API_METHOD_KEYS: ReadonlyArray<Exclude<keyof TextmodeExportAPI, 'exportOverlay'>> = [
	'saveCanvas',
	'toImageBlob',
	'copyCanvas',
	'saveSVG',
	'saveStrings',
	'toSVG',
	'toString',
	'toJSON',
	'toJSONString',
	'saveJSON',
	'saveGIF',
	'toGIFBlob',
	'saveVideo',
	'toVideoBlob',
];

type PostDrawSubscription = (callback: () => void) => () => void;

/**
 * Deep export implementation for one installed plugin instance.
 *
 * The host adapter registers this controller's API as extensions. The controller owns
 * DOM resources, post-draw subscriptions, and abort controllers for asynchronous capture.
 */
export class TextmodeExportController {
	public readonly api: TextmodeExportAPI;

	private readonly _registerPostDrawHook: PostDrawSubscription;
	private readonly _activeOperations = new Set<AbortController>();
	private readonly _overlayController: OverlayController;
	private readonly _stopOverlayRefresh: () => void;
	private _disposed = false;

	constructor(textmodifier: Textmodifier, registerPostDrawHook: PostDrawSubscription) {
		this._registerPostDrawHook = registerPostDrawHook;

		const exportMethods: Omit<TextmodeExportAPI, 'exportOverlay'> = {
			saveCanvas: async (options: ImageExportOptions = {}) => {
				this._assertLive();
				return new ImageExporter().$saveImage(textmodifier.canvas, options);
			},
			copyCanvas: async (options: ImageExportOptions = {}) => {
				this._assertLive();
				return new ImageExporter().$copyImageToClipboard(textmodifier.canvas, options);
			},
			toImageBlob: async (options: ImageExportOptions = {}) => {
				this._assertLive();
				return new ImageExporter().$toImageBlob(textmodifier.canvas, options);
			},
			saveSVG: (options: SVGExportOptions = {}) => {
				this._assertLive();
				new SVGExporter().$saveSVG(textmodifier, options);
			},
			saveStrings: (options: TXTExportOptions = {}) => {
				this._assertLive();
				new TXTExporter().$saveTXT(textmodifier, options);
			},
			toSVG: (options: SVGExportOptions = {}) => {
				this._assertLive();
				return new SVGExporter().$generateSVG(textmodifier, options);
			},
			toString: (options: TXTExportOptions = {}) => {
				this._assertLive();
				return new TXTExporter().$generateTXT(textmodifier, options);
			},
			toJSON: (options: JSONExportOptions = {}) => {
				this._assertLive();
				return new JSONExporter().$generateJSONData(textmodifier, options);
			},
			toJSONString: (options: JSONExportOptions = {}) => {
				this._assertLive();
				return new JSONExporter().$generateJSONString(textmodifier, options);
			},
			saveJSON: (options: JSONExportOptions = {}) => {
				this._assertLive();
				new JSONExporter().$saveJSON(textmodifier, options);
			},
			saveGIF: (options: GIFExportOptions = {}) =>
				this._runOperation(options.signal, (signal) =>
					new GIFExporter(textmodifier, (callback) => this._registerPostDrawHook(callback)).$saveGIF({
						...options,
						signal,
					})
				),
			toGIFBlob: (options: GIFExportOptions = {}) =>
				this._runOperation(options.signal, (signal) =>
					new GIFExporter(textmodifier, (callback) => this._registerPostDrawHook(callback)).$generateGIFBlob({
						...options,
						signal,
					})
				),
			saveVideo: (options: VideoExportOptions = {}) =>
				this._runOperation(options.signal, (signal) =>
					new VideoExporter(textmodifier, (callback) => this._registerPostDrawHook(callback)).$saveVideo({
						...options,
						signal,
					})
				),
			toVideoBlob: (options: VideoExportOptions = {}) =>
				this._runOperation(options.signal, (signal) =>
					new VideoExporter(textmodifier, (callback) =>
						this._registerPostDrawHook(callback)
					).$generateVideoBlob({
						...options,
						signal,
					})
				),
		};

		const exportAPI = {
			...exportMethods,
			exportOverlay: undefined as unknown as ExportOverlayController,
		} as TextmodeExportAPI;
		this.api = exportAPI;
		const overlayController = createExportOverlay(textmodifier, exportAPI, createLayerTargetProvider(textmodifier));
		let stopOverlayRefresh: () => void;
		try {
			stopOverlayRefresh = this._registerPostDrawHook(() => {
				if (!this._disposed && overlayController.isVisible()) overlayController.refreshLayerTargets();
			});
		} catch (error) {
			overlayController.$dispose();
			throw error;
		}
		this._overlayController = overlayController;
		this._stopOverlayRefresh = stopOverlayRefresh;
		exportAPI.exportOverlay = this._createOverlayAPI();
	}

	public dispose(): void {
		if (this._disposed) return;
		this._disposed = true;
		for (const controller of this._activeOperations) controller.abort();
		this._activeOperations.clear();
		this._stopOverlayRefresh();
		this._overlayController.$dispose();
	}

	private _createOverlayAPI(): ExportOverlayController {
		return {
			show: () => {
				this._assertLive();
				this._overlayController.show();
			},
			hide: () => {
				this._assertLive();
				this._overlayController.hide();
			},
			toggle: () => {
				this._assertLive();
				this._overlayController.toggle();
			},
			isVisible: () => {
				this._assertLive();
				return this._overlayController.isVisible();
			},
			resetPosition: () => {
				this._assertLive();
				this._overlayController.resetPosition();
			},
			getPosition: () => {
				this._assertLive();
				return this._overlayController.getPosition();
			},
			setPosition: (position) => {
				this._assertLive();
				this._overlayController.setPosition(position);
			},
			setDefaults: (patch: ExportDefaultsPatch) => {
				this._assertLive();
				this._overlayController.setDefaults(patch);
			},
			getDefaults: () => {
				this._assertLive();
				return this._overlayController.getDefaults();
			},
			resetDefaults: (format?: keyof ExportDefaults) => {
				this._assertLive();
				this._overlayController.resetDefaults(format);
			},
		};
	}

	private _runOperation<T>(
		callerSignal: AbortSignal | undefined,
		operation: (signal: AbortSignal) => Promise<T>
	): Promise<T> {
		this._assertLive();
		const controller = new AbortController();
		const combined = new AbortController();
		const abortFromCaller = () => combined.abort();
		const abortFromController = () => combined.abort();
		callerSignal?.addEventListener('abort', abortFromCaller, { once: true });
		controller.signal.addEventListener('abort', abortFromController, { once: true });
		if (callerSignal?.aborted) combined.abort();
		this._activeOperations.add(controller);

		return Promise.resolve()
			.then(() => operation(combined.signal))
			.finally(() => {
				callerSignal?.removeEventListener('abort', abortFromCaller);
				controller.signal.removeEventListener('abort', abortFromController);
				this._activeOperations.delete(controller);
			});
	}

	private _assertLive(): void {
		if (this._disposed) throw new Error('Textmode export plugin has been disposed.');
	}
}
