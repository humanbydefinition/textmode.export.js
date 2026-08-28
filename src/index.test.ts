// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { TextmodePluginContext, Textmodifier } from 'textmode.js';
import { ExportPlugin } from './index';
import { TextmodeExportController } from './runtime/TextmodeExportController';
import { ZIPExporter } from './exporters/zip';
import { GIFExporter } from './exporters/gif';
import { VideoExporter } from './exporters/video/VideoExporter';

function createMockTextmodifier(): Textmodifier {
	const canvas = document.createElement('canvas');
	canvas.width = 640;
	canvas.height = 480;

	const mockLayer = {
		isVisible: () => true,
		charBuffer: new Uint8Array(80 * 30),
		colorBuffer: new Uint8Array(80 * 30 * 4),
		bgColorBuffer: new Uint8Array(80 * 30 * 4),
		cols: 80,
		rows: 30,
	};

	return {
		canvas,
		width: 640,
		height: 480,
		cellWidth: 8,
		cellHeight: 16,
		layer: mockLayer,
		layers: {
			base: mockLayer,
			all: [],
		},
	} as unknown as Textmodifier;
}

describe('ExportPlugin', () => {
	afterEach(() => vi.restoreAllMocks());

	it('registers all 16 export extension methods and overlay getter', async () => {
		const definedExtensions: Array<{
			target: string;
			name: string;
			descriptor: PropertyDescriptor;
			isAccessor: boolean;
		}> = [];
		const postDrawHooks: Array<() => void> = [];

		const mockContext: TextmodePluginContext = {
			defineExtension: vi.fn((target: string, name: string, descriptor: unknown) => {
				definedExtensions.push({
					target,
					name,
					descriptor: descriptor as PropertyDescriptor,
					isAccessor: typeof descriptor === 'object' && descriptor !== null && 'get' in descriptor,
				});
			}),
			on: vi.fn((event: string, hook: () => void) => {
				if (event === 'postDraw') {
					postDrawHooks.push(hook);
				}
				return () => {
					const index = postDrawHooks.indexOf(hook);
					if (index !== -1) postDrawHooks.splice(index, 1);
				};
			}),
		} as unknown as TextmodePluginContext;

		const mockTextmodifier = createMockTextmodifier();
		const cleanup = ExportPlugin.install(mockTextmodifier, mockContext);

		expect(typeof cleanup).toBe('function');
		expect(definedExtensions.length).toBe(17);

		const extensionNames = definedExtensions.map((e) => e.name);
		expect(extensionNames).toContain('saveCanvas');
		expect(extensionNames).toContain('toImageBlob');
		expect(extensionNames).toContain('copyCanvas');
		expect(extensionNames).toContain('saveSVG');
		expect(extensionNames).toContain('saveStrings');
		expect(extensionNames).toContain('toSVG');
		expect(extensionNames).toContain('toString');
		expect(extensionNames).toContain('toJSON');
		expect(extensionNames).toContain('toJSONString');
		expect(extensionNames).toContain('saveJSON');
		expect(extensionNames).toContain('saveGIF');
		expect(extensionNames).toContain('toGIFBlob');
		expect(extensionNames).toContain('saveVideo');
		expect(extensionNames).toContain('toVideoBlob');
		expect(extensionNames).toContain('saveZip');
		expect(extensionNames).toContain('toZipBlob');
		expect(extensionNames).toContain('exportOverlay');

		// Verify overlay is getter
		const overlayExt = definedExtensions.find((e) => e.name === 'exportOverlay');
		expect(overlayExt?.isAccessor).toBe(true);

		const saveCanvas = definedExtensions.find((extension) => extension.name === 'saveCanvas')!.descriptor
			.value as () => Promise<void>;
		const toZipBlob = definedExtensions.find((extension) => extension.name === 'toZipBlob')!.descriptor
			.value as (options: { format: 'txt' }) => Promise<Blob>;
		const exportOverlay = definedExtensions
			.find((extension) => extension.name === 'exportOverlay')!
			.descriptor.get!.call(mockTextmodifier);

		// Execute cleanup
		if (typeof cleanup === 'function') {
			cleanup();
			cleanup();
		}

		await expect(saveCanvas()).rejects.toThrow('disposed');
		await expect(toZipBlob({ format: 'txt' })).rejects.toThrow('disposed');
		expect(() => exportOverlay.getDefaults()).toThrow('disposed');
	});

	it('subscribes to postDraw and unsubscribes on cleanup', () => {
		let unsubscribeCalled = false;
		const mockContext: TextmodePluginContext = {
			defineExtension: vi.fn(),
			on: vi.fn((event: string) => {
				if (event === 'postDraw') {
					return () => {
						unsubscribeCalled = true;
					};
				}
				return () => {};
			}),
		} as unknown as TextmodePluginContext;

		const mockTextmodifier = createMockTextmodifier();
		const cleanup = ExportPlugin.install(mockTextmodifier, mockContext);

		expect(mockContext.on).toHaveBeenCalledWith('postDraw', expect.any(Function));
		expect(unsubscribeCalled).toBe(false);

		if (typeof cleanup === 'function') {
			cleanup();
			cleanup();
		}

		expect(unsubscribeCalled).toBe(true);
	});

	it('rejects concurrent deterministic captures and reports ZIP busy progress', async () => {
		let finishFirst!: (blob: Blob) => void;
		vi.spyOn(ZIPExporter.prototype, '$generateZIPBlob').mockImplementation(
			() =>
				new Promise<Blob>((resolve) => {
					finishFirst = resolve;
				})
		);
		const controller = new TextmodeExportController(createMockTextmodifier(), () => () => undefined);
		const gifCapture = vi.spyOn(GIFExporter.prototype, '$generateGIFBlob');
		const videoCapture = vi.spyOn(VideoExporter.prototype, '$generateVideoBlob');
		const first = controller.api.toZipBlob({ format: 'txt', frameCount: 1 });
		await vi.waitFor(() => expect(finishFirst).toBeTypeOf('function'));
		const progress = vi.fn();

		await expect(
			controller.api.toZipBlob({ format: 'txt', frameCount: 1, onProgress: progress })
		).rejects.toMatchObject({ code: 'ZIP_EXPORT_BUSY' });
		expect(progress).toHaveBeenCalledOnce();
		expect(progress).toHaveBeenCalledWith(
			expect.objectContaining({ state: 'error', frameIndex: 0, totalFrames: 1 })
		);
		await expect(controller.api.toGIFBlob({ frameCount: 1 })).rejects.toMatchObject({
			code: 'FRAME_SEQUENCE_BUSY',
		});
		await expect(controller.api.toVideoBlob({ frameCount: 1 })).rejects.toMatchObject({
			code: 'VIDEO_EXPORT_FAILED',
		});
		expect(gifCapture).not.toHaveBeenCalled();
		expect(videoCapture).not.toHaveBeenCalled();

		finishFirst(new Blob([], { type: 'application/zip' }));
		await first;
		controller.dispose();
	});
});
