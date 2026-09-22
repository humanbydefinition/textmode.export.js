import { TEXTMODE_DOCUMENT_FORMAT, TEXTMODE_DOCUMENT_FORMAT_VERSION, TEXTMODE_OBJECT_ROWS_ENCODING } from './constants';
import {
	assertCanvasMatchesGrid,
	checkedProduct,
	decodeCanvas,
	decodeColor,
	decodeGrid,
	decodeLayerId,
	decodeMetadata,
	fail,
	normalizeRotation,
	requireArray,
	requireBoolean,
	requireBoundedString,
	requireCharacter,
	requireFiniteNumber,
	requireNumberInRange,
	requireRecord,
	requireSafeInteger,
	requireString,
} from './validation';
import type { DecodeContext, UnknownRecord } from './validation';
import type {
	CanonicalTextmodeAllDocument,
	CanonicalTextmodeCell,
	CanonicalTextmodeCellCollection,
	CanonicalTextmodeDocumentLayer,
	CanonicalTextmodeSelectedDocument,
	JSONLayerGrid,
} from './types';

export function decodeSelectedDocument(root: UnknownRecord, context: DecodeContext): CanonicalTextmodeSelectedDocument {
	const canvas = decodeCanvas(root.canvas, '$.canvas');
	const grid = decodeGrid(root.grid, '$.grid');
	assertCanvasMatchesGrid(canvas, grid, '$.canvas');
	const layer = requireRecord(root.layer, '$.layer');

	return {
		format: TEXTMODE_DOCUMENT_FORMAT,
		formatVersion: TEXTMODE_DOCUMENT_FORMAT_VERSION,
		target: 'selected',
		...(root.metadata === undefined
			? {}
			: { metadata: decodeMetadata(root.metadata, '$.metadata', context.limits) }),
		canvas,
		grid,
		layer: {
			id: decodeLayerId(layer.id, '$.layer.id', context.limits),
			cells: decodeCells(layer.cells, grid, '$.layer.cells', context),
		},
	};
}

export function decodeAllDocument(root: UnknownRecord, context: DecodeContext): CanonicalTextmodeAllDocument {
	const canvas = decodeCanvas(root.canvas, '$.canvas');
	const layersValue = requireArray(root.layers, '$.layers');
	if (layersValue.length === 0) {
		fail('INVALID_DOCUMENT', 'A layer-stack document must contain at least one layer.', '$.layers');
	}
	if (layersValue.length > context.limits.maxLayers) {
		fail(
			'LIMIT_EXCEEDED',
			`Layer count ${layersValue.length} exceeds the configured limit ${context.limits.maxLayers}.`,
			'$.layers'
		);
	}

	const layers = layersValue.map((value, index) => decodeLayer(value, `$.layers[${index}]`, context));
	assertCanvasMatchesGrid(canvas, layers[0].grid, '$.canvas');

	return {
		format: TEXTMODE_DOCUMENT_FORMAT,
		formatVersion: TEXTMODE_DOCUMENT_FORMAT_VERSION,
		target: 'all',
		...(root.metadata === undefined
			? {}
			: { metadata: decodeMetadata(root.metadata, '$.metadata', context.limits) }),
		canvas,
		layers,
	};
}

function decodeLayer(value: unknown, path: string, context: DecodeContext): CanonicalTextmodeDocumentLayer {
	const layer = requireRecord(value, path);
	const grid = decodeGrid(layer.grid, `${path}.grid`);

	return {
		id: decodeLayerId(layer.id, `${path}.id`, context.limits),
		visible: requireBoolean(layer.visible, `${path}.visible`),
		opacity: requireNumberInRange(layer.opacity, `${path}.opacity`, 0, 1),
		blendMode: requireBoundedString(layer.blendMode, `${path}.blendMode`, context.limits.maxMetadataStringLength),
		offsetX: requireFiniteNumber(layer.offsetX, `${path}.offsetX`),
		offsetY: requireFiniteNumber(layer.offsetY, `${path}.offsetY`),
		rotationZ: requireFiniteNumber(layer.rotationZ, `${path}.rotationZ`),
		grid,
		cells: decodeCells(layer.cells, grid, `${path}.cells`, context),
	};
}

function decodeCells(
	value: unknown,
	grid: JSONLayerGrid,
	path: string,
	context: DecodeContext
): CanonicalTextmodeCellCollection {
	const collection = requireRecord(value, path);
	const encoding = requireString(collection.encoding, `${path}.encoding`);
	if (encoding !== TEXTMODE_OBJECT_ROWS_ENCODING) {
		fail('UNSUPPORTED_ENCODING', `Unsupported cell encoding: ${encoding}.`, `${path}.encoding`);
	}

	const expectedCellCount = checkedProduct(grid.cols, grid.rows, `${path}.rows`);
	if (expectedCellCount > context.remainingCells) {
		fail(
			'LIMIT_EXCEEDED',
			`Document cell count exceeds the configured limit ${context.limits.maxCells}.`,
			`${path}.rows`
		);
	}
	context.remainingCells -= expectedCellCount;

	const rows = requireArray(collection.rows, `${path}.rows`);
	if (rows.length !== grid.rows) {
		fail('INVALID_DOCUMENT', `Expected ${grid.rows} cell rows, received ${rows.length}.`, `${path}.rows`);
	}

	return {
		encoding: TEXTMODE_OBJECT_ROWS_ENCODING,
		rows: rows.map((rowValue, y) => {
			const rowPath = `${path}.rows[${y}]`;
			const row = requireArray(rowValue, rowPath);
			if (row.length !== grid.cols) {
				fail('INVALID_DOCUMENT', `Expected ${grid.cols} cells, received ${row.length}.`, rowPath);
			}
			return row.map((cell, x) => decodeCell(cell, x, y, `${rowPath}[${x}]`, context));
		}),
	};
}

function decodeCell(
	value: unknown,
	expectedX: number,
	expectedY: number,
	path: string,
	context: DecodeContext
): CanonicalTextmodeCell {
	const cell = requireRecord(value, path);
	const x = requireSafeInteger(cell.x, `${path}.x`);
	const y = requireSafeInteger(cell.y, `${path}.y`);
	if (x !== expectedX || y !== expectedY) {
		fail('INVALID_DOCUMENT', `Cell coordinates must match their row position (${expectedX}, ${expectedY}).`, path);
	}

	const transform = requireRecord(cell.transform, `${path}.transform`);
	return {
		x,
		y,
		character: requireCharacter(cell.character, `${path}.character`, context.limits),
		foreground: decodeColor(cell.foreground, `${path}.foreground`),
		background: decodeColor(cell.background, `${path}.background`),
		transform: {
			invert: requireBoolean(transform.invert, `${path}.transform.invert`),
			flipX: requireBoolean(transform.flipX, `${path}.transform.flipX`),
			flipY: requireBoolean(transform.flipY, `${path}.transform.flipY`),
			rotation: normalizeRotation(requireFiniteNumber(transform.rotation, `${path}.transform.rotation`)),
		},
	};
}
