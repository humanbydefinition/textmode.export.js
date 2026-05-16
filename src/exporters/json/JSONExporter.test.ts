// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Textmodifier } from 'textmode.js';
import type { TextmodeLayer } from 'textmode.js';
import { JSONExporter } from './JSONExporter';
import type { TextmodeAllDocumentJSON, TextmodeDocumentJSON, TextmodeSelectedDocumentJSON } from './types';

type LayerMockOptions = {
	visible?: boolean;
	opacity?: number;
	blendMode?: string;
	offsetX?: number;
	offsetY?: number;
	rotationZ?: number;
};

function expectSingleLayerDocument(document: TextmodeDocumentJSON): TextmodeSelectedDocumentJSON {
	if (document.target !== 'selected') {
		throw new Error('Expected a single-layer JSON document');
	}

	return document;
}

function expectLayerStackDocument(document: TextmodeDocumentJSON): TextmodeAllDocumentJSON {
	if (document.target !== 'all') {
		throw new Error('Expected an all-layers JSON document');
	}

	return document;
}

function readBlobAsText(blob: Blob): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.addEventListener('load', () => resolve(String(reader.result ?? '')));
		reader.addEventListener('error', () => reject(reader.error ?? new Error('Failed to read Blob')));
		reader.readAsText(blob);
	});
}

function createLayerMock(
	characterPixels: Uint8Array,
	primaryColorPixels: Uint8Array,
	secondaryColorPixels: Uint8Array,
	characters: Array<{ character: string; color: [number, number, number] }>,
	options: LayerMockOptions = {}
): TextmodeLayer {
	return {
		grid: {
			cols: 2,
			rows: 1,
			cellWidth: 8,
			cellHeight: 16,
			width: 16,
			height: 16,
		},
		font: { characters },
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
		_visible: options.visible,
		_opacity: options.opacity,
		_blendMode: options.blendMode,
		_offsetX: options.offsetX,
		_offsetY: options.offsetY,
		_rotation: options.rotationZ,
	} as unknown as TextmodeLayer;
}

function createTextmodifierMock(): Textmodifier & { testLayer: TextmodeLayer } {
	const characters = [
		{ character: 'A', color: [65 / 255, 0, 0] as [number, number, number] },
		{ character: 'B', color: [66 / 255, 0, 0] as [number, number, number] },
		{ character: 'X', color: [88 / 255, 0, 0] as [number, number, number] },
		{ character: 'Y', color: [89 / 255, 0, 0] as [number, number, number] },
	];
	const baseLayer = createLayerMock(
		Uint8Array.from([65, 0, 0, 0, 66, 0, 3, 255]),
		Uint8Array.from([255, 0, 0, 255, 0, 255, 0, 255]),
		Uint8Array.from([0, 0, 0, 255, 0, 0, 255, 128]),
		characters
	);
	const userLayer = createLayerMock(
		Uint8Array.from([88, 0, 0, 0, 89, 0, 0, 0]),
		Uint8Array.from([10, 20, 30, 255, 40, 50, 60, 255]),
		Uint8Array.from([70, 80, 90, 255, 100, 110, 120, 255]),
		characters,
		{
			visible: false,
			opacity: 0.5,
			blendMode: 'screen',
			offsetX: 3,
			offsetY: 4,
			rotationZ: 15,
		}
	);

	return {
		layers: {
			base: baseLayer,
			all: [userLayer],
		},
		testLayer: userLayer,
	} as unknown as Textmodifier & { testLayer: TextmodeLayer };
}

describe('JSONExporter', () => {
	afterEach(() => {
		vi.restoreAllMocks();
		vi.unstubAllGlobals();
	});

	it('generates a textmode.document selected-layer document with row-based cells by default', () => {
		const exporter = new JSONExporter();
		const document = expectSingleLayerDocument(exporter.$generateJSONData(createTextmodifierMock()));

		expect(document).not.toHaveProperty('$schema');
		expect(document.format).toBe('textmode.document');
		expect(document.formatVersion).toBe('2.0.0');
		expect(document.target).toBe('selected');
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
		const document = expectSingleLayerDocument(
			exporter.$generateJSONData(createTextmodifierMock(), {
				colorMode: 'rgba',
				includeMetadata: false,
			})
		);

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

	it('exports a selected user layer when provided', () => {
		const exporter = new JSONExporter();
		const textmodifier = createTextmodifierMock();
		const document = expectSingleLayerDocument(
			exporter.$generateJSONData(textmodifier, {
				layer: textmodifier.testLayer,
				includeMetadata: false,
			})
		);

		expect(document.layer.id).toBe('layer-1');
		expect(document.layer.cells.encoding).toBe('object-rows-v1');

		if (document.layer.cells.encoding !== 'object-rows-v1') {
			throw new Error('Expected object rows encoding');
		}

		expect(document.layer.cells.rows[0][0]).toMatchObject({
			character: 'X',
			foreground: '#0a141eff',
			background: '#46505aff',
		});
		expect(document.layer.cells.rows[0][1]).toMatchObject({
			character: 'Y',
			foreground: '#28323cff',
			background: '#646e78ff',
		});
	});

	it('exports the full layer stack when target is all', () => {
		const exporter = new JSONExporter();
		const document = expectLayerStackDocument(
			exporter.$generateJSONData(createTextmodifierMock(), {
				target: 'all',
				includeMetadata: false,
			})
		);

		expect(document).not.toHaveProperty('$schema');
		expect(document.format).toBe('textmode.document');
		expect(document.formatVersion).toBe('2.0.0');
		expect(document.target).toBe('all');
		expect(document.metadata).toBeUndefined();
		expect(document.canvas).toEqual({ width: 16, height: 16 });
		expect(document.layers.map((layer) => layer.id)).toEqual(['base', 'layer-1']);
		expect(document.layers[0]).toMatchObject({
			id: 'base',
			visible: true,
			opacity: 1,
			blendMode: 'normal',
			offsetX: 0,
			offsetY: 0,
			rotationZ: 0,
			grid: {
				cols: 2,
				rows: 1,
				cellWidth: 8,
				cellHeight: 16,
			},
		});
		expect(document.layers[1]).toMatchObject({
			id: 'layer-1',
			visible: false,
			opacity: 0.5,
			blendMode: 'screen',
			offsetX: 3,
			offsetY: 4,
			rotationZ: 15,
			grid: {
				cols: 2,
				rows: 1,
				cellWidth: 8,
				cellHeight: 16,
			},
		});

		const userLayerCells = document.layers[1].cells;
		expect(userLayerCells.encoding).toBe('object-rows-v1');

		if (userLayerCells.encoding !== 'object-rows-v1') {
			throw new Error('Expected object rows encoding');
		}

		expect(userLayerCells.rows[0][0]).toMatchObject({
			character: 'X',
			foreground: '#0a141eff',
			background: '#46505aff',
		});
		expect(userLayerCells.rows[0][1]).toMatchObject({
			character: 'Y',
			foreground: '#28323cff',
			background: '#646e78ff',
		});
	});

	it('applies color mode and metadata options to all layer entries', () => {
		const exporter = new JSONExporter();
		const document = expectLayerStackDocument(
			exporter.$generateJSONData(createTextmodifierMock(), {
				target: 'all',
				colorMode: 'rgba',
			})
		);

		expect(document.metadata?.generator.name).toBe('textmode.export.js');

		const userLayerCells = document.layers[1].cells;
		expect(userLayerCells.encoding).toBe('object-rows-v1');

		if (userLayerCells.encoding !== 'object-rows-v1') {
			throw new Error('Expected object rows encoding');
		}

		expect(userLayerCells.rows[0][0]).toMatchObject({
			character: 'X',
			foreground: { r: 10, g: 20, b: 30, a: 255 },
			background: { r: 70, g: 80, b: 90, a: 255 },
		});
	});

	it('rejects unmanaged layer references', () => {
		const exporter = new JSONExporter();
		const unmanagedLayer = createLayerMock(
			Uint8Array.from([90, 0, 0, 0]),
			Uint8Array.from([0, 0, 0, 255]),
			Uint8Array.from([0, 0, 0, 255]),
			[{ character: 'Z', color: [90 / 255, 0, 0] }]
		);

		expect(() =>
			exporter.$generateJSONData(createTextmodifierMock(), {
				layer: unmanagedLayer,
			})
		).toThrow('Cannot export a layer that is not managed');
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
		const text = await readBlobAsText(blob);
		expect(text).toContain('"format":"textmode.document"');
		expect(text).toContain('"formatVersion":"2.0.0"');
		expect(text).toContain('"target":"selected"');
		expect(text).not.toContain('$schema');
		expect(text).not.toContain('schemas');
	});
});
