// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Textmodifier } from 'textmode.js';
import { JSONExporter } from './JSONExporter';

function readBlobAsText(blob: Blob): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.addEventListener('load', () => resolve(String(reader.result ?? '')));
		reader.addEventListener('error', () => reject(reader.error ?? new Error('Failed to read Blob')));
		reader.readAsText(blob);
	});
}

function createTextmodifierMock(): Textmodifier {
	const characterPixels = Uint8Array.from([65, 0, 0, 0, 66, 0, 3, 255]);
	const primaryColorPixels = Uint8Array.from([255, 0, 0, 255, 0, 255, 0, 255]);
	const secondaryColorPixels = Uint8Array.from([0, 0, 0, 255, 0, 0, 255, 128]);

	const characters = [
		{ character: 'A', color: [65 / 255, 0, 0] },
		{ character: 'B', color: [66 / 255, 0, 0] },
	];

	return {
		grid: {
			cols: 2,
			rows: 1,
			cellWidth: 8,
			cellHeight: 16,
			width: 16,
			height: 16,
		},
		font: {
			characters,
		},
		layers: {
			base: {
				drawFramebuffer: {
					readPixels: (attachment: number) => {
						switch (attachment) {
							case 0:
								return characterPixels;
							case 1:
								return primaryColorPixels;
							case 2:
								return secondaryColorPixels;
							default:
								throw new Error(`Unexpected attachment ${attachment}`);
						}
					},
				},
			},
		},
	} as unknown as Textmodifier;
}

describe('JSONExporter', () => {
	afterEach(() => {
		vi.restoreAllMocks();
		vi.unstubAllGlobals();
	});

	it('generates a textmode.layer document with row-based cells by default', () => {
		const exporter = new JSONExporter();
		const document = exporter.$generateJSONData(createTextmodifierMock());

		expect(document.format).toBe('textmode.layer');
		expect(document.formatVersion).toBe('1.0.0');
		expect(document.grid).toEqual({
			cols: 2,
			rows: 1,
			cellWidth: 8,
			cellHeight: 16,
		});
		expect(document.layer.id).toBe('base');
		expect(document.layer.cells.encoding).toBe('object-rows-v1');

		if (document.layer.cells.encoding !== 'object-rows-v1') {
			throw new Error('Expected object rows encoding');
		}

		expect(document.layer.cells.rows[0][0]).toEqual({
			x: 0,
			y: 0,
			character: 'A',
			foreground: '#ff0000ff',
			background: '#000000ff',
			transform: {
				invert: false,
				flipX: false,
				flipY: false,
				rotation: 0,
			},
		});
		expect(document.layer.cells.rows[0][1]).toEqual({
			x: 1,
			y: 0,
			character: 'B',
			foreground: '#00ff00ff',
			background: '#0000ff80',
			transform: {
				invert: true,
				flipX: true,
				flipY: false,
				rotation: 360,
			},
		});
		expect(document.metadata?.generator.name).toBe('textmode.export.js');
	});

	it('supports rgba colors while keeping the row-based cell layout', () => {
		const exporter = new JSONExporter();
		const document = exporter.$generateJSONData(createTextmodifierMock(), {
			colorMode: 'rgba',
			includeMetadata: false,
		});

		expect(document.metadata).toBeUndefined();
		expect(document.layer.cells.encoding).toBe('object-rows-v1');

		if (document.layer.cells.encoding !== 'object-rows-v1') {
			throw new Error('Expected object rows encoding');
		}

		expect(document.layer.cells.rows[0][0]).toEqual({
			x: 0,
			y: 0,
			character: 'A',
			foreground: { r: 255, g: 0, b: 0, a: 255 },
			background: { r: 0, g: 0, b: 0, a: 255 },
			transform: {
				invert: false,
				flipX: false,
				flipY: false,
				rotation: 0,
			},
		});
	});

	it('serializes and downloads JSON files', async () => {
		const exporter = new JSONExporter();
		let capturedBlob: Blob | undefined;
		const createObjectURL = vi.fn((blob: Blob) => {
			capturedBlob = blob;
			return 'blob:json-export';
		});
		const revokeObjectURL = vi.fn();
		vi.stubGlobal('URL', {
			createObjectURL,
			revokeObjectURL,
		});

		const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
		const appendSpy = vi.spyOn(document.body, 'appendChild');

		exporter.$saveJSON(createTextmodifierMock(), {
			filename: 'layer.json',
			pretty: false,
			includeMetadata: false,
		});

		expect(clickSpy).toHaveBeenCalledTimes(1);
		expect(createObjectURL).toHaveBeenCalledTimes(1);
		expect(revokeObjectURL).toHaveBeenCalledWith('blob:json-export');

		const anchor = appendSpy.mock.calls[0]?.[0] as HTMLAnchorElement;
		expect(anchor.download).toBe('layer.json');

		const blob = capturedBlob;
		expect(blob).toBeDefined();
		if (!blob) {
			throw new Error('Expected Blob to be captured');
		}
		expect(blob.type).toBe('application/json;charset=utf-8');
		await expect(readBlobAsText(blob)).resolves.toContain('"format":"textmode.layer"');
	});
});
