import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import packageJson from '../../../package.json';
// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest';
import { LayerBlendMode, type Textmodifier, type TextmodeLayer } from 'textmode.js';
import { decodeTextmodeDocument } from '@textmode/document';
import { JSONExporter } from './JSONExporter';
import type { TextmodeAllDocumentJSON, TextmodeDocumentJSON, TextmodeSelectedDocumentJSON } from '@textmode/document';

type LayerMockOptions = {
	visible?: boolean;
	opacity?: number;
	blendMode?: LayerBlendMode;
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
	const visible = options.visible ?? true;
	const opacity = options.opacity ?? 1;
	const blendMode = options.blendMode ?? LayerBlendMode.NORMAL;
	const offset = { x: options.offsetX ?? 0, y: options.offsetY ?? 0 };
	const rotationZ = options.rotationZ ?? 0;

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
		isVisible: () => visible,
		opacity: () => opacity,
		blendMode: () => blendMode,
		offset: () => offset,
		rotateZ: () => rotationZ,
	} as unknown as TextmodeLayer;
}

function createTextmodifierMock(
	userBlendMode: LayerBlendMode = LayerBlendMode.SCREEN
): Textmodifier & { testLayer: TextmodeLayer } {
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
			blendMode: userBlendMode,
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

	it.each(['selected', 'all'] as const)('emits a document accepted by the public codec for target %s', (target) => {
		const document = new JSONExporter().$generateJSONData(createTextmodifierMock(), {
			target,
			includeMetadata: false,
		});
		const decoded = decodeTextmodeDocument(document);
		expect(decoded.ok).toBe(true);
		if (!decoded.ok) return;
		expect(decoded.document.target).toBe(target);
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

	it.each([
		[LayerBlendMode.NORMAL, 'normal'],
		[LayerBlendMode.ADDITIVE, 'additive'],
		[LayerBlendMode.MULTIPLY, 'multiply'],
		[LayerBlendMode.SCREEN, 'screen'],
		[LayerBlendMode.SUBTRACT, 'subtract'],
		[LayerBlendMode.DARKEN, 'darken'],
		[LayerBlendMode.LIGHTEN, 'lighten'],
		[LayerBlendMode.OVERLAY, 'overlay'],
		[LayerBlendMode.SOFT_LIGHT, 'softLight'],
		[LayerBlendMode.HARD_LIGHT, 'hardLight'],
		[LayerBlendMode.COLOR_DODGE, 'colorDodge'],
		[LayerBlendMode.COLOR_BURN, 'colorBurn'],
		[LayerBlendMode.DIFFERENCE, 'difference'],
		[LayerBlendMode.EXCLUSION, 'exclusion'],
	] as const)('serializes LayerBlendMode.%s as %s', (mode, expectedName) => {
		const exporter = new JSONExporter();
		const document = expectLayerStackDocument(
			exporter.$generateJSONData(createTextmodifierMock(mode), {
				target: 'all',
				includeMetadata: false,
			})
		);

		expect(document.formatVersion).toBe('2.0.0');
		expect(document.layers[1].blendMode).toBe(expectedName);
	});

	it('applies color mode and metadata options to all layer entries', () => {
		const exporter = new JSONExporter();
		const createdAt = new Date('2026-08-28T12:00:00.000Z');
		const document = expectLayerStackDocument(
			exporter.$generateJSONData(
				createTextmodifierMock(),
				{
					target: 'all',
					colorMode: 'rgba',
				},
				createdAt
			)
		);

		expect(document.metadata?.generator.name).toBe('textmode.export.js');
		expect(document.metadata?.createdAt).toBe(createdAt.toISOString());

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
		expect(revokeObjectURL).not.toHaveBeenCalled();
		await new Promise((resolve) => setTimeout(resolve, 0));
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

const serializationBaseline: Record<string, string> = {
	'{"target":"selected","colorMode":"hex","includeMetadata":true,"pretty":false}':
		'86240617fc76e5152993634f7617b273d0af68b8c6a075be9037dd5ed7dae0cf',
	'{"target":"selected","colorMode":"hex","includeMetadata":true,"pretty":true}':
		'17f975e4bc5b8a7329efe18d1e4425453a0ec7b42d141ea9cea990000782c03c',
	'{"target":"selected","colorMode":"hex","includeMetadata":true,"pretty":4}':
		'c79676927b9d5533b805fae696a90d98978a2923fe7d28ec8333a2a6efea9654',
	'{"target":"selected","colorMode":"hex","includeMetadata":false,"pretty":false}':
		'612c1d28c48cae458d4b89489965320412b64ef9105edbb888ba26a479d7bcf5',
	'{"target":"selected","colorMode":"hex","includeMetadata":false,"pretty":true}':
		'a4faece20665a5716a9d16b42c09d8c7589c5daf0eadfda36cd7581295dfc791',
	'{"target":"selected","colorMode":"hex","includeMetadata":false,"pretty":4}':
		'4d74bcb63d6a7a074bb7b186f105f376613ff2a1421bc00ff0aa1a70a3ae83e6',
	'{"target":"selected","colorMode":"rgba","includeMetadata":true,"pretty":false}':
		'f04121847f013aa1e3c2873cf72816deb2cd4166cdd4aa23c82081648ede27f1',
	'{"target":"selected","colorMode":"rgba","includeMetadata":true,"pretty":true}':
		'2995484c1a8689338335c309c3a9d1d7c1a7b4bf2b474eaab4e5f15cca644847',
	'{"target":"selected","colorMode":"rgba","includeMetadata":true,"pretty":4}':
		'c1e892a6e10e9ef65a05a83579511c2ae81d79cfc5e6241b31039ce97e379b2f',
	'{"target":"selected","colorMode":"rgba","includeMetadata":false,"pretty":false}':
		'402772834d75e381812cb55a473a7d208457338e6577e592f1c2ad56804059db',
	'{"target":"selected","colorMode":"rgba","includeMetadata":false,"pretty":true}':
		'26469641db963f65187956900ac21ead880765794cb78b5386500f2b5427d03c',
	'{"target":"selected","colorMode":"rgba","includeMetadata":false,"pretty":4}':
		'ee01fe435d559cd3a8f1d626df262b29508f7ce085d5494f856d335cbe4af7da',
	'{"target":"all","colorMode":"hex","includeMetadata":true,"pretty":false}':
		'956a488069cca0367d7143d8b4233605cd20739f7b4b5a3bdd54a13f71b3a0d4',
	'{"target":"all","colorMode":"hex","includeMetadata":true,"pretty":true}':
		'ffb3fa46ecd789a9ff8fb59a1487fdcc70de95f940ca32d26d4ed96315e05b8e',
	'{"target":"all","colorMode":"hex","includeMetadata":true,"pretty":4}':
		'3d579be53e4abdd2fbbbbfdf8178599a7ae6c2a50de304fde41e00b1825c2ab0',
	'{"target":"all","colorMode":"hex","includeMetadata":false,"pretty":false}':
		'8c3f18787e4ba7184872921e0469839fae1ae22e661beaa0a4c0f64e3271fbc2',
	'{"target":"all","colorMode":"hex","includeMetadata":false,"pretty":true}':
		'9674a136075a6b845033e5e132b01f601c75b3faca0b454e1539b125134451d7',
	'{"target":"all","colorMode":"hex","includeMetadata":false,"pretty":4}':
		'dee013f8328613f2ca6011f4efb292b111976d7b2d28caf4ada1621cd71c98c5',
	'{"target":"all","colorMode":"rgba","includeMetadata":true,"pretty":false}':
		'ba29fcc0cc5e65e86b7babd835a18512a7e69faad8e9bc0de6d984154026fec2',
	'{"target":"all","colorMode":"rgba","includeMetadata":true,"pretty":true}':
		'a99ff496dc72af3ac22c02ea2d233ad6225313e1749e92af13eff474f9979105',
	'{"target":"all","colorMode":"rgba","includeMetadata":true,"pretty":4}':
		'552752e9802a86c2b346ea094eb22b815167a24cb684dfbccfd2548688388b4c',
	'{"target":"all","colorMode":"rgba","includeMetadata":false,"pretty":false}':
		'fa4379401b74e98a79ef4360dd3be81418cfce600112094bc74ffcb729fb85d6',
	'{"target":"all","colorMode":"rgba","includeMetadata":false,"pretty":true}':
		'ef06913d463729c24bbe7dca9919f804e93783cab83a4bf765a01032a48559ac',
	'{"target":"all","colorMode":"rgba","includeMetadata":false,"pretty":4}':
		'ce322ea3b689fedcf3e98fe8d4bcb43c94577219d2ff8a77a6c9297c639eaed7',
};
const schema = JSON.parse(
	readFileSync(fileURLToPath(import.meta.resolve('@textmode/document/schema/2.0')), 'utf8')
) as object;
const schemaValidator = new Ajv2020({ validateFormats: true });
addFormats(schemaValidator, { mode: 'full' });
const validateExport = schemaValidator.compile(schema);

describe('extracted protocol compatibility', () => {
	it.each(Object.entries(serializationBaseline))('preserves pre-extraction output for %s', (key, expectedHash) => {
		const options = JSON.parse(key) as {
			target: 'selected' | 'all';
			colorMode: 'hex' | 'rgba';
			includeMetadata: boolean;
			pretty: boolean | number;
		};
		const json = new JSONExporter().$generateJSONString(
			createTextmodifierMock(),
			options,
			new Date('2026-09-21T12:00:00.000Z')
		);
		const normalizedVersion = json.replace(/("version"\s*:\s*")[^"]+(")/g, '$1<package-version>$2');
		expect(createHash('sha256').update(normalizedVersion).digest('hex')).toBe(expectedHash);
		const value = JSON.parse(json) as TextmodeDocumentJSON;
		expect(validateExport(value), JSON.stringify(validateExport.errors)).toBe(true);
		expect(decodeTextmodeDocument(value).ok).toBe(true);
		if (options.includeMetadata) expect(value.metadata?.generator.version).toBe(packageJson.version);
	});
});
