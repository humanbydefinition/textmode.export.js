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
import { getFontReference } from './font-reference';
import { JSONExporter } from './JSONExporter';
import type { TextmodeDocumentJSON } from '@textmode/document';

function sourceData() {
	return {
		copyBytes: vi.fn(() => {
			const bytes = new Uint8Array(40),
				view = new DataView(bytes.buffer);
			view.setUint32(0, 0x10000);
			view.setUint16(4, 1);
			bytes.set([104, 101, 97, 100], 12);
			view.setUint32(20, 28);
			view.setUint32(24, 12);
			return bytes;
		}),
	};
}
const defaultSource = sourceData();

type LayerMockOptions = {
	visible?: boolean;
	opacity?: number;
	blendMode?: LayerBlendMode;
	offsetX?: number;
	offsetY?: number;
	rotationZ?: number;
};

function expectSingleLayerDocument(document: TextmodeDocumentJSON): TextmodeDocumentJSON {
	if (document.frames[0].layers.length !== 1) {
		throw new Error('Expected a single-layer JSON document');
	}

	return document;
}

function expectLayerStackDocument(document: TextmodeDocumentJSON): TextmodeDocumentJSON {
	if (document.frames[0].layers.length < 1) {
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
		font: { characters, sourceData: defaultSource },
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
		expect(document.formatVersion).toBe('4.0.0');
		expect(document).not.toHaveProperty('target');
		expect(document.frames[0].layers[0].grid).toEqual({
			cols: 2,
			rows: 1,
			cellWidth: 8,
			cellHeight: 16,
		});
		expect(document.frames[0].layers[0].id).toBe('base');
		expect(document.frames[0].layers[0].cells.encoding).toBe('object-rows-v1');

		if (document.frames[0].layers[0].cells.encoding !== 'object-rows-v1') {
			throw new Error('Expected object rows encoding');
		}

		expect(document.frames[0].layers[0].cells.rows[0][0]).toEqual({
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
		expect(document.frames[0].layers[0].cells.rows[0][1]).toEqual({
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
		expect(document.frames[0].layers[0].cells.encoding).toBe('object-rows-v1');

		if (document.frames[0].layers[0].cells.encoding !== 'object-rows-v1') {
			throw new Error('Expected object rows encoding');
		}

		expect(document.frames[0].layers[0].cells.rows[0][0]).toEqual({
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
		expect(decoded.document.frames[0].layers).toHaveLength(target === 'selected' ? 1 : 2);
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

		expect(document.frames[0].layers[0].id).toBe('layer-1');
		expect(document.frames[0].layers[0]).toMatchObject({
			visible: false,
			opacity: 0.5,
			blendMode: 'screen',
			offsetX: 3,
			offsetY: 4,
			rotationZ: 15,
		});
		expect(document.frames[0].layers[0].cells.encoding).toBe('object-rows-v1');

		if (document.frames[0].layers[0].cells.encoding !== 'object-rows-v1') {
			throw new Error('Expected object rows encoding');
		}

		expect(document.frames[0].layers[0].cells.rows[0][0]).toMatchObject({
			character: 'X',
			foreground: '#0a141eff',
			background: '#46505aff',
		});
		expect(document.frames[0].layers[0].cells.rows[0][1]).toMatchObject({
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
		expect(document.formatVersion).toBe('4.0.0');
		expect(document).not.toHaveProperty('target');
		expect(document.metadata).toBeUndefined();
		expect(document).not.toHaveProperty('canvas');
		expect(document.frames[0].layers.map((layer) => layer.id)).toEqual(['base', 'layer-1']);
		expect(document.frames[0].layers[0]).toMatchObject({
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
		expect(document.frames[0].layers[1]).toMatchObject({
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

		const userLayerCells = document.frames[0].layers[1].cells;
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

		expect(document.formatVersion).toBe('4.0.0');
		expect(document.frames[0].layers[1].blendMode).toBe(expectedName);
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

		const userLayerCells = document.frames[0].layers[1].cells;
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
		expect(text).toContain('"formatVersion":"4.0.0"');
		expect(text).not.toContain('"target"');
		expect(text).not.toContain('$schema');
		expect(text).not.toContain('schemas');
	});
});

const serializationBaseline: Record<string, string> = {
	'{"target":"selected","colorMode":"hex","includeMetadata":true,"pretty":false}':
		'fd6261ee31b98812767f41b4bb92f647071f86f6fcd619ccda1e7fc57d6a144a',
	'{"target":"selected","colorMode":"hex","includeMetadata":true,"pretty":true}':
		'8fe9a2eb731add95205e6490cc3d3b50bc56fac04997a53a42e89c0734b876d3',
	'{"target":"selected","colorMode":"hex","includeMetadata":true,"pretty":4}':
		'90570a78d2c8b150dd6711dcc2be9e856e0d4341e3edd152d28ced6c3102403b',
	'{"target":"selected","colorMode":"hex","includeMetadata":false,"pretty":false}':
		'33468f60cbbc46ce759aa44f17f785e0e14112da5835ff62ca7462a3ef200a49',
	'{"target":"selected","colorMode":"hex","includeMetadata":false,"pretty":true}':
		'a576286aea666f7ad817721945e0a60bcc2400bc59ffaaac9263084266d51cb4',
	'{"target":"selected","colorMode":"hex","includeMetadata":false,"pretty":4}':
		'06cfa2251bffb422b8ed2089fa447d79ba79bef0a98932b44caaeea106f49865',
	'{"target":"selected","colorMode":"rgba","includeMetadata":true,"pretty":false}':
		'2266b8cccb36d89ab76e0759fdfc5884d6dc6eb014e0203c16139dc18480c1d2',
	'{"target":"selected","colorMode":"rgba","includeMetadata":true,"pretty":true}':
		'61940955288def3ea2308035e28c19295fc1cb2a39fbd71683178af8b4e0f6ab',
	'{"target":"selected","colorMode":"rgba","includeMetadata":true,"pretty":4}':
		'87e60799ae7264ac844b3a9826a569eb6c6908c60ffa11e5eada8d246f424466',
	'{"target":"selected","colorMode":"rgba","includeMetadata":false,"pretty":false}':
		'37eecda204688f51782e9d9e1a947f80700e56b2532ae7a536070ffc474613fa',
	'{"target":"selected","colorMode":"rgba","includeMetadata":false,"pretty":true}':
		'996184b7d2c1393032dc6da7d31a3e041072f8e77009b48a2fe8abf783128845',
	'{"target":"selected","colorMode":"rgba","includeMetadata":false,"pretty":4}':
		'5d60968bf2c1847efbccb1ff6b6445eec2be6cb7946a508aff323a92bc5f850d',
	'{"target":"all","colorMode":"hex","includeMetadata":true,"pretty":false}':
		'3857f238bc6580612751953ad82c2fd8b19707dbae5b62a28d04735ebd77154e',
	'{"target":"all","colorMode":"hex","includeMetadata":true,"pretty":true}':
		'3cd6b6b68b96475e38eff73ff80755409a1aea899067182a3efce302f3daf775',
	'{"target":"all","colorMode":"hex","includeMetadata":true,"pretty":4}':
		'53572cc67f5e89d8ea8c69b5b34696202c3acac07e9f0c7021eb38929c2d413d',
	'{"target":"all","colorMode":"hex","includeMetadata":false,"pretty":false}':
		'a1bdb933aac69f0b02e10c074b3118fd59f52b40059bb5a78b56e3a28d1ad0f2',
	'{"target":"all","colorMode":"hex","includeMetadata":false,"pretty":true}':
		'559303b1420d651a4775f12cc329485e36e604f6003de4c4c6773910aead64d9',
	'{"target":"all","colorMode":"hex","includeMetadata":false,"pretty":4}':
		'4d472e7b8045ab56351416c5169de4deab737e8ad498d6a7e36ea63872571f99',
	'{"target":"all","colorMode":"rgba","includeMetadata":true,"pretty":false}':
		'fe4b725f552d0b9b3fb09ee180a7bb24da40e6e2d74c0bb6661f1781b5bf96df',
	'{"target":"all","colorMode":"rgba","includeMetadata":true,"pretty":true}':
		'9f4d3a8b6ee485957138da947437c7e9857403761b7a744a4a629a7084308257',
	'{"target":"all","colorMode":"rgba","includeMetadata":true,"pretty":4}':
		'0d8f24d24e252c59dbf0e37382c60227ddb7c592facebaefab84da4e59ee47c5',
	'{"target":"all","colorMode":"rgba","includeMetadata":false,"pretty":false}':
		'9778709abf3e6c9fd55e167206d87222c27511c0abf6d79fea1189f857f93a14',
	'{"target":"all","colorMode":"rgba","includeMetadata":false,"pretty":true}':
		'01dff086a4d9009599cd89adcd684ad8725f5b5d1afcff4375cc08badc531fb0',
	'{"target":"all","colorMode":"rgba","includeMetadata":false,"pretty":4}':
		'afc4ab68439465c4b1b43ea7add49a515d5610ebe92352729242c3980345fc4a',
};
const schema = JSON.parse(
	readFileSync(fileURLToPath(import.meta.resolve('@textmode/document/schema/4.0')), 'utf8')
) as object;
const schemaValidator = new Ajv2020({ validateFormats: true });
addFormats(schemaValidator, { mode: 'full' });
const validateExport = schemaValidator.compile(schema);

describe('extracted protocol compatibility', () => {
	it.each(Object.entries(serializationBaseline))('preserves fixed-time v3 output for %s', (key, expectedHash) => {
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
		const compatibility = JSON.parse(json);
		expect(compatibility.formatVersion).toBe('4.0.0');
		const frame = compatibility.frames[0];
		delete compatibility.frames;
		compatibility.layers = frame.layers;
		for (const layer of compatibility.layers) {
			expect(layer.font.id).toMatch(/^sfnt-v1-sha256:[a-f0-9]{64}$/);
			delete layer.font;
		}
		compatibility.formatVersion = '3.0.0';
		const indentation = typeof options.pretty === 'number' ? options.pretty : options.pretty ? 2 : 0;
		const normalizedVersion = JSON.stringify(compatibility, null, indentation).replace(
			/("version"\s*:\s*")[^"]+(")/g,
			'$1<package-version>$2'
		);
		const hash = createHash('sha256').update(normalizedVersion).digest('hex');
		expect(hash).toBe(expectedHash);
		const value = JSON.parse(json) as TextmodeDocumentJSON;
		expect(validateExport(value), JSON.stringify(validateExport.errors)).toBe(true);
		expect(decodeTextmodeDocument(value).ok).toBe(true);
		if (options.includeMetadata) expect(value.metadata?.generator.version).toBe(packageJson.version);
	});
});

describe('automatic font references', () => {
	it('caches a shared source, returns copies, and identifies replacements', () => {
		const source = sourceData();
		const font = { sourceData: source } as unknown as import('textmode.js').TextmodeFont;
		const first = getFontReference(font);
		getFontReference({ ...font } as import('textmode.js').TextmodeFont);
		expect(source.copyBytes).toHaveBeenCalledOnce();
		first.name = 'changed';
		expect(getFontReference(font)).not.toHaveProperty('name');
		const next = sourceData();
		getFontReference({ sourceData: next } as unknown as import('textmode.js').TextmodeFont);
		expect(next.copyBytes).toHaveBeenCalledOnce();
	});
	it('keeps font references when producer metadata is disabled', () => {
		const doc = new JSONExporter().$generateJSONData(createTextmodifierMock(), {
			target: 'all',
			includeMetadata: false,
		});
		expect(doc).not.toHaveProperty('metadata');
		expect(doc.frames[0].layers.every((layer) => layer.font?.id)).toBe(true);
	});
});

describe('JSON frame sequence', () => {
	it('captures independent snapshots with stable IDs and validates the complete v4 file', async () => {
		const { JSONSequenceExporter } = await import('./JSONSequenceExporter');
		const modifier = createTextmodifierMock();
		const base = modifier.layers.base;
		const original = modifier.testLayer;
		const replacement = { ...original } as TextmodeLayer;
		const all = modifier.layers.all as TextmodeLayer[];
		const states: string[] = [];
		const driver = {
			canvas: document.createElement('canvas'),
			$render: async (options: import('../base').FrameSequenceRenderOptions) => {
				for (let frameIndex = 0; frameIndex < options.frameCount; frameIndex++) {
					if (frameIndex === 1) all.splice(0, 1, replacement, original);
					if (frameIndex === 2) all.splice(0, 2, original);
					await options.onFrame({ frameIndex, canvas: document.createElement('canvas') });
				}
			},
		};
		const exporter = new JSONSequenceExporter(modifier, vi.fn(), () => driver);
		const blob = await exporter.$generateBlob({
			frameCount: 3,
			frameRate: 60,
			target: 'all',
			onProgress: ({ state }) => states.push(state),
		});
		const value = JSON.parse(await readBlobAsText(blob)) as TextmodeDocumentJSON;
		expect(blob.type).toContain('application/json');
		expect(value.frames.map((frame) => frame.durationMs)).toEqual([1000 / 60, 1000 / 60, 1000 / 60]);
		expect(value.frames.map((frame) => frame.layers.map((layer) => layer.id))).toEqual([
			['base', 'layer-1'],
			['base', 'layer-2', 'layer-1'],
			['base', 'layer-1'],
		]);
		expect(modifier.layers.base).toBe(base);
		expect(value.frames[0].layers[0]).not.toBe(value.frames[1].layers[0]);
		expect(validateExport(value), JSON.stringify(validateExport.errors)).toBe(true);
		expect(decodeTextmodeDocument(value).ok).toBe(true);
		expect(states).toEqual(['capturing', 'capturing', 'capturing', 'capturing', 'finalizing', 'completed']);
	});

	it('rejects invalid options and checks cancellation before capturing', async () => {
		const { JSONSequenceExporter } = await import('./JSONSequenceExporter');
		const factory = vi.fn();
		const exporter = new JSONSequenceExporter(createTextmodifierMock(), vi.fn(), factory);
		await expect(exporter.$generateBlob({ frameCount: 0 })).rejects.toMatchObject({
			code: 'JSON_SEQUENCE_INVALID_OPTIONS',
		});
		await expect(exporter.$generateBlob({ frameRate: 0 })).rejects.toMatchObject({
			code: 'JSON_SEQUENCE_INVALID_OPTIONS',
		});
		const controller = new AbortController();
		controller.abort();
		await expect(exporter.$generateBlob({ signal: controller.signal })).rejects.toMatchObject({
			code: 'JSON_SEQUENCE_ABORTED',
		});
		expect(factory).not.toHaveBeenCalled();
	});

	it('enforces cumulative cell limits before extracting the next frame', async () => {
		const { JSONSequenceExporter } = await import('./JSONSequenceExporter');
		const modifier = createTextmodifierMock();
		const driver = {
			canvas: document.createElement('canvas'),
			$render: async (options: import('../base').FrameSequenceRenderOptions) => {
				Object.assign(modifier.layers.base.grid!, { cols: 16_777_217, rows: 1 });
				await options.onFrame({ frameIndex: 0, canvas: document.createElement('canvas') });
			},
		};
		const exporter = new JSONSequenceExporter(modifier, vi.fn(), () => driver);
		await expect(exporter.$generateBlob({ frameCount: 1 })).rejects.toMatchObject({
			code: 'JSON_SEQUENCE_LIMIT_EXCEEDED',
		});
	});

	it('fails when the selected layer is removed during capture', async () => {
		const { JSONSequenceExporter } = await import('./JSONSequenceExporter');
		const modifier = createTextmodifierMock();
		const driver = {
			canvas: document.createElement('canvas'),
			$render: async (options: import('../base').FrameSequenceRenderOptions) => {
				(modifier.layers.all as TextmodeLayer[]).splice(0, 1);
				await options.onFrame({ frameIndex: 0, canvas: document.createElement('canvas') });
			},
		};
		const exporter = new JSONSequenceExporter(modifier, vi.fn(), () => driver);
		await expect(exporter.$generateBlob({ frameCount: 1, layer: modifier.testLayer })).rejects.toMatchObject({
			code: 'JSON_SEQUENCE_FAILED',
		});
	});
});

describe('JSON sequence capture failures', () => {
	it('normalizes frame timeouts and reports the failure', async () => {
		const { JSONSequenceExporter } = await import('./JSONSequenceExporter');
		const { FrameSequenceError } = await import('../base');
		const driver = {
			canvas: document.createElement('canvas'),
			$render: async () => {
				throw new FrameSequenceError('FRAME_SEQUENCE_TIMEOUT', 'Timed out');
			},
		};
		const progress = vi.fn();
		const exporter = new JSONSequenceExporter(createTextmodifierMock(), vi.fn(), () => driver);
		await expect(exporter.$generateBlob({ frameCount: 1, onProgress: progress })).rejects.toMatchObject({
			code: 'JSON_SEQUENCE_TIMEOUT',
		});
		expect(progress).toHaveBeenLastCalledWith(expect.objectContaining({ state: 'error', message: 'Timed out' }));
	});

	it('aborts after a captured frame without publishing a result', async () => {
		const { JSONSequenceExporter } = await import('./JSONSequenceExporter');
		const controller = new AbortController();
		const driver = {
			canvas: document.createElement('canvas'),
			$render: async (options: import('../base').FrameSequenceRenderOptions) => {
				await options.onFrame({ frameIndex: 0, canvas: document.createElement('canvas') });
				controller.abort();
				await options.onFrame({ frameIndex: 1, canvas: document.createElement('canvas') });
			},
		};
		const ready = vi.fn();
		const exporter = new JSONSequenceExporter(createTextmodifierMock(), vi.fn(), () => driver);
		await expect(exporter.$generateBlob({ frameCount: 2, signal: controller.signal }, ready)).rejects.toMatchObject(
			{ code: 'JSON_SEQUENCE_ABORTED' }
		);
		expect(ready).not.toHaveBeenCalled();
	});
});
