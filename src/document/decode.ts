import {
	DEFAULT_TEXTMODE_DOCUMENT_LIMITS,
	LEGACY_TEXTMODE_ALL_VERSION,
	LEGACY_TEXTMODE_LAYER_FORMAT,
	LEGACY_TEXTMODE_SELECTED_VERSION,
	TEXTMODE_DOCUMENT_FORMAT,
	TEXTMODE_DOCUMENT_FORMAT_VERSION,
	TEXTMODE_OBJECT_ROWS_ENCODING,
} from './constants';
import { parseJSON } from './parse';
import type {
	CanonicalTextmodeAllDocument,
	CanonicalTextmodeCell,
	CanonicalTextmodeCellCollection,
	CanonicalTextmodeDocument,
	CanonicalTextmodeDocumentLayer,
	CanonicalTextmodeSelectedDocument,
	JSONExportMetadata,
	JSONLayerGrid,
	JSONRGBAColor,
	TextmodeDocumentDecodeOptions,
	TextmodeDocumentDecodeResult,
	TextmodeDocumentError,
	TextmodeDocumentErrorCode,
	TextmodeDocumentLimits,
	TextmodeDocumentParseResult,
} from './types';

type UnknownRecord = Record<string, unknown>;

type ResolvedLimits = Required<TextmodeDocumentLimits>;

type DecodeContext = {
	limits: ResolvedLimits;
	remainingCells: number;
};

class DocumentDecodeFailure extends Error {
	readonly detail: TextmodeDocumentError;

	constructor(detail: TextmodeDocumentError) {
		super(detail.message);
		this.detail = detail;
	}
}

/** Decode a parsed JSON value into the canonical textmode document union. */
export function decodeTextmodeDocument(
	value: unknown,
	options: TextmodeDocumentDecodeOptions = {}
): TextmodeDocumentDecodeResult {
	try {
		const limits = resolveLimits(options.limits);
		const context: DecodeContext = {
			limits,
			remainingCells: limits.maxCells,
		};
		const root = requireRecord(value, '$');
		const format = requireString(root.format, '$.format');

		if (format === TEXTMODE_DOCUMENT_FORMAT) {
			return {
				ok: true,
				document: decodeCurrentDocument(root, context),
				warnings: [],
			};
		}

		if (format === LEGACY_TEXTMODE_LAYER_FORMAT && (options.acceptLegacy ?? true)) {
			return {
				ok: true,
				document: decodeLegacyDocument(root, context),
				warnings: [
					{
						code: 'LEGACY_DOCUMENT_MIGRATED',
						message: 'Migrated a legacy textmode.layer document to textmode.document 2.0.0.',
					},
				],
			};
		}

		return failure('UNSUPPORTED_FORMAT', `Unsupported textmode document format: ${format}.`, '$.format');
	} catch (error) {
		if (error instanceof DocumentDecodeFailure) {
			return { ok: false, error: error.detail };
		}
		throw error;
	}
}

/** Parse JSON syntax and decode its value in one convenience call. */
export function parseTextmodeDocumentJSON(
	json: string,
	options: TextmodeDocumentDecodeOptions = {}
): TextmodeDocumentParseResult {
	const parsed = parseJSON(json);
	if (!parsed.ok) return parsed;
	return decodeTextmodeDocument(parsed.value, options);
}

function decodeCurrentDocument(root: UnknownRecord, context: DecodeContext): CanonicalTextmodeDocument {
	const version = requireString(root.formatVersion, '$.formatVersion');
	if (version !== TEXTMODE_DOCUMENT_FORMAT_VERSION) {
		fail('UNSUPPORTED_VERSION', `Unsupported textmode.document version: ${version}.`, '$.formatVersion');
	}

	const target = requireString(root.target, '$.target');
	if (target === 'selected') return decodeSelectedDocument(root, context);
	if (target === 'all') return decodeAllDocument(root, context);
	fail('UNSUPPORTED_TARGET', `Unsupported textmode document target: ${target}.`, '$.target');
}

function decodeLegacyDocument(root: UnknownRecord, context: DecodeContext): CanonicalTextmodeDocument {
	const version = requireString(root.formatVersion, '$.formatVersion');
	if (version === LEGACY_TEXTMODE_SELECTED_VERSION) return decodeSelectedDocument(root, context);
	if (version === LEGACY_TEXTMODE_ALL_VERSION) return decodeAllDocument(root, context);
	fail('UNSUPPORTED_VERSION', `Unsupported legacy textmode.layer version: ${version}.`, '$.formatVersion');
}

function decodeSelectedDocument(root: UnknownRecord, context: DecodeContext): CanonicalTextmodeSelectedDocument {
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

function decodeAllDocument(root: UnknownRecord, context: DecodeContext): CanonicalTextmodeAllDocument {
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

function decodeColor(value: unknown, path: string): JSONRGBAColor {
	if (typeof value === 'string') {
		const match = /^#([0-9a-f]{6}|[0-9a-f]{8})$/i.exec(value);
		if (!match) {
			fail('INVALID_DOCUMENT', 'Expected #RRGGBB or #RRGGBBAA color notation.', path);
		}
		const hex = match[1];
		return {
			r: Number.parseInt(hex.slice(0, 2), 16),
			g: Number.parseInt(hex.slice(2, 4), 16),
			b: Number.parseInt(hex.slice(4, 6), 16),
			a: hex.length === 8 ? Number.parseInt(hex.slice(6, 8), 16) : 255,
		};
	}

	const color = requireRecord(value, path);
	return {
		r: requireByte(color.r, `${path}.r`),
		g: requireByte(color.g, `${path}.g`),
		b: requireByte(color.b, `${path}.b`),
		a: requireByte(color.a, `${path}.a`),
	};
}

function decodeCanvas(value: unknown, path: string): { width: number; height: number } {
	const canvas = requireRecord(value, path);
	return {
		width: requirePositiveSafeInteger(canvas.width, `${path}.width`),
		height: requirePositiveSafeInteger(canvas.height, `${path}.height`),
	};
}

function decodeGrid(value: unknown, path: string): JSONLayerGrid {
	const grid = requireRecord(value, path);
	return {
		cols: requirePositiveSafeInteger(grid.cols, `${path}.cols`),
		rows: requirePositiveSafeInteger(grid.rows, `${path}.rows`),
		cellWidth: requirePositiveSafeInteger(grid.cellWidth, `${path}.cellWidth`),
		cellHeight: requirePositiveSafeInteger(grid.cellHeight, `${path}.cellHeight`),
	};
}

function decodeMetadata(value: unknown, path: string, limits: ResolvedLimits): JSONExportMetadata {
	const metadata = requireRecord(value, path);
	const generator = requireRecord(metadata.generator, `${path}.generator`);
	const generatorName = requireBoundedString(
		generator.name,
		`${path}.generator.name`,
		limits.maxMetadataStringLength
	);
	if (generatorName !== 'textmode.export.js') {
		fail('INVALID_DOCUMENT', 'Unsupported metadata generator name.', `${path}.generator.name`);
	}

	return {
		createdAt: requireBoundedString(metadata.createdAt, `${path}.createdAt`, limits.maxMetadataStringLength),
		generator: {
			name: 'textmode.export.js',
			version: requireBoundedString(
				generator.version,
				`${path}.generator.version`,
				limits.maxMetadataStringLength
			),
		},
	};
}

function decodeLayerId(value: unknown, path: string, limits: ResolvedLimits): string {
	return requireBoundedString(value, path, limits.maxLayerIdLength);
}

function assertCanvasMatchesGrid(canvas: { width: number; height: number }, grid: JSONLayerGrid, path: string): void {
	const expectedWidth = checkedProduct(grid.cols, grid.cellWidth, `${path}.width`);
	const expectedHeight = checkedProduct(grid.rows, grid.cellHeight, `${path}.height`);
	if (canvas.width !== expectedWidth || canvas.height !== expectedHeight) {
		fail('INVALID_DOCUMENT', `Canvas must equal the grid pixel extent ${expectedWidth}x${expectedHeight}.`, path);
	}
}

function resolveLimits(limits: TextmodeDocumentLimits | undefined): ResolvedLimits {
	return {
		maxCells: resolveLimit(limits?.maxCells, DEFAULT_TEXTMODE_DOCUMENT_LIMITS.maxCells, 'maxCells'),
		maxLayers: resolveLimit(limits?.maxLayers, DEFAULT_TEXTMODE_DOCUMENT_LIMITS.maxLayers, 'maxLayers'),
		maxLayerIdLength: resolveLimit(
			limits?.maxLayerIdLength,
			DEFAULT_TEXTMODE_DOCUMENT_LIMITS.maxLayerIdLength,
			'maxLayerIdLength'
		),
		maxCharacterLength: resolveLimit(
			limits?.maxCharacterLength,
			DEFAULT_TEXTMODE_DOCUMENT_LIMITS.maxCharacterLength,
			'maxCharacterLength'
		),
		maxMetadataStringLength: resolveLimit(
			limits?.maxMetadataStringLength,
			DEFAULT_TEXTMODE_DOCUMENT_LIMITS.maxMetadataStringLength,
			'maxMetadataStringLength'
		),
	};
}

function resolveLimit(value: number | undefined, fallback: number, name: string): number {
	if (value === undefined) return fallback;
	if (!Number.isSafeInteger(value) || value <= 0) {
		throw new TypeError(`${name} must be a positive safe integer.`);
	}
	return value;
}

function checkedProduct(left: number, right: number, path: string): number {
	const product = left * right;
	if (!Number.isSafeInteger(product)) {
		fail('LIMIT_EXCEEDED', 'Numeric dimensions exceed the safe integer range.', path);
	}
	return product;
}

function normalizeRotation(rotation: number): number {
	const normalized = ((rotation % 360) + 360) % 360;
	return Object.is(normalized, -0) ? 0 : normalized;
}

function requireRecord(value: unknown, path: string): UnknownRecord {
	if (typeof value !== 'object' || value === null || Array.isArray(value)) {
		fail('INVALID_DOCUMENT', 'Expected an object.', path);
	}
	return value as UnknownRecord;
}

function requireArray(value: unknown, path: string): unknown[] {
	if (!Array.isArray(value)) fail('INVALID_DOCUMENT', 'Expected an array.', path);
	return value;
}

function requireString(value: unknown, path: string): string {
	if (typeof value !== 'string') fail('INVALID_DOCUMENT', 'Expected a string.', path);
	return value;
}

function requireBoundedString(value: unknown, path: string, maxLength: number): string {
	const text = requireString(value, path);
	if (text.length === 0) fail('INVALID_DOCUMENT', 'Expected a non-empty string.', path);
	if (text.length > maxLength) {
		fail('LIMIT_EXCEEDED', `String length exceeds the configured limit ${maxLength}.`, path);
	}
	return text;
}

function requireCharacter(value: unknown, path: string, limits: ResolvedLimits): string {
	const character = requireString(value, path);
	if (character.length === 0) {
		fail('INVALID_DOCUMENT', 'Expected a non-empty glyph string.', path);
	}
	assertWellFormedUnicode(character, path);
	if (Array.from(character).length > limits.maxCharacterLength) {
		fail(
			'LIMIT_EXCEEDED',
			`Glyph string scalar count exceeds the configured limit ${limits.maxCharacterLength}.`,
			path
		);
	}
	return character;
}

function assertWellFormedUnicode(value: string, path: string): void {
	for (let index = 0; index < value.length; index++) {
		const codeUnit = value.charCodeAt(index);
		if (codeUnit >= 0xd800 && codeUnit <= 0xdbff) {
			const next = value.charCodeAt(index + 1);
			if (!Number.isInteger(next) || next < 0xdc00 || next > 0xdfff) {
				fail('INVALID_DOCUMENT', 'Glyph strings must not contain unpaired surrogates.', path);
			}
			index++;
			continue;
		}
		if (codeUnit >= 0xdc00 && codeUnit <= 0xdfff) {
			fail('INVALID_DOCUMENT', 'Glyph strings must not contain unpaired surrogates.', path);
		}
	}
}

function requireBoolean(value: unknown, path: string): boolean {
	if (typeof value !== 'boolean') fail('INVALID_DOCUMENT', 'Expected a boolean.', path);
	return value;
}

function requireFiniteNumber(value: unknown, path: string): number {
	if (typeof value !== 'number' || !Number.isFinite(value)) {
		fail('INVALID_DOCUMENT', 'Expected a finite number.', path);
	}
	return value;
}

function requireNumberInRange(value: unknown, path: string, minimum: number, maximum: number): number {
	const number = requireFiniteNumber(value, path);
	if (number < minimum || number > maximum) {
		fail('INVALID_DOCUMENT', `Expected a number from ${minimum} through ${maximum}.`, path);
	}
	return number;
}

function requireSafeInteger(value: unknown, path: string): number {
	if (typeof value !== 'number' || !Number.isSafeInteger(value)) {
		fail('INVALID_DOCUMENT', 'Expected a safe integer.', path);
	}
	return value;
}

function requirePositiveSafeInteger(value: unknown, path: string): number {
	const integer = requireSafeInteger(value, path);
	if (integer <= 0) fail('INVALID_DOCUMENT', 'Expected a positive safe integer.', path);
	return integer;
}

function requireByte(value: unknown, path: string): number {
	const integer = requireSafeInteger(value, path);
	if (integer < 0 || integer > 255) {
		fail('INVALID_DOCUMENT', 'Expected an integer from 0 through 255.', path);
	}
	return integer;
}

function failure(code: TextmodeDocumentErrorCode, message: string, path?: string): TextmodeDocumentDecodeResult {
	return { ok: false, error: { code, message, ...(path ? { path } : {}) } };
}

function fail(code: TextmodeDocumentErrorCode, message: string, path?: string): never {
	throw new DocumentDecodeFailure({ code, message, ...(path ? { path } : {}) });
}
