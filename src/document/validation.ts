import { DEFAULT_TEXTMODE_DOCUMENT_LIMITS } from './constants';
import type {
	JSONExportMetadata,
	JSONLayerGrid,
	JSONRGBAColor,
	TextmodeDocumentDecodeResult,
	TextmodeDocumentError,
	TextmodeDocumentErrorCode,
	TextmodeDocumentLimits,
} from './types';

export type UnknownRecord = Record<string, unknown>;
export type ResolvedLimits = Required<TextmodeDocumentLimits>;
export type DecodeContext = { limits: ResolvedLimits; remainingCells: number };

export class DocumentDecodeFailure extends Error {
	readonly detail: TextmodeDocumentError;

	constructor(detail: TextmodeDocumentError) {
		super(detail.message);
		this.detail = detail;
	}
}

export function decodeColor(value: unknown, path: string): JSONRGBAColor {
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

export function decodeCanvas(value: unknown, path: string): { width: number; height: number } {
	const canvas = requireRecord(value, path);
	return {
		width: requirePositiveSafeInteger(canvas.width, `${path}.width`),
		height: requirePositiveSafeInteger(canvas.height, `${path}.height`),
	};
}

export function decodeGrid(value: unknown, path: string): JSONLayerGrid {
	const grid = requireRecord(value, path);
	return {
		cols: requirePositiveSafeInteger(grid.cols, `${path}.cols`),
		rows: requirePositiveSafeInteger(grid.rows, `${path}.rows`),
		cellWidth: requirePositiveSafeInteger(grid.cellWidth, `${path}.cellWidth`),
		cellHeight: requirePositiveSafeInteger(grid.cellHeight, `${path}.cellHeight`),
	};
}

export function decodeMetadata(value: unknown, path: string, limits: ResolvedLimits): JSONExportMetadata {
	const metadata = requireRecord(value, path);
	const generator = requireRecord(metadata.generator, `${path}.generator`);
	const generatorName = requireBoundedString(
		generator.name,
		`${path}.generator.name`,
		limits.maxMetadataStringLength
	);
	const createdAt = requireBoundedString(metadata.createdAt, `${path}.createdAt`, limits.maxMetadataStringLength);
	assertTimestamp(createdAt, `${path}.createdAt`);

	return {
		createdAt,
		generator: {
			name: generatorName,
			version: requireBoundedString(
				generator.version,
				`${path}.generator.version`,
				limits.maxMetadataStringLength
			),
		},
	};
}

const TIMESTAMP_PATTERN =
	/^([0-9]{4})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](?:\.[0-9]+)?(?:Z|[+-](?:[01][0-9]|2[0-3]):[0-5][0-9])$/;

function assertTimestamp(value: string, path: string): void {
	const match = TIMESTAMP_PATTERN.exec(value);
	if (!match) fail('INVALID_DOCUMENT', 'Expected an uppercase RFC 3339 timestamp with seconds and a timezone.', path);

	const year = Number(match[1]);
	const month = Number(match[2]);
	const day = Number(match[3]);
	const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
	const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
	if (day > daysInMonth[month - 1]) fail('INVALID_DOCUMENT', 'Timestamp contains an invalid calendar date.', path);
}

export function decodeLayerId(value: unknown, path: string, limits: ResolvedLimits): string {
	return requireBoundedString(value, path, limits.maxLayerIdLength);
}

export function assertCanvasMatchesGrid(
	canvas: { width: number; height: number },
	grid: JSONLayerGrid,
	path: string
): void {
	const expectedWidth = checkedProduct(grid.cols, grid.cellWidth, `${path}.width`);
	const expectedHeight = checkedProduct(grid.rows, grid.cellHeight, `${path}.height`);
	if (canvas.width !== expectedWidth || canvas.height !== expectedHeight) {
		fail('INVALID_DOCUMENT', `Canvas must equal the grid pixel extent ${expectedWidth}x${expectedHeight}.`, path);
	}
}

export function resolveLimits(limits: TextmodeDocumentLimits | undefined): ResolvedLimits {
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

export function checkedProduct(left: number, right: number, path: string): number {
	const product = left * right;
	if (!Number.isSafeInteger(product)) {
		fail('LIMIT_EXCEEDED', 'Numeric dimensions exceed the safe integer range.', path);
	}
	return product;
}

export function normalizeRotation(rotation: number): number {
	const normalized = ((rotation % 360) + 360) % 360;
	return Object.is(normalized, -0) ? 0 : normalized;
}

export function requireRecord(value: unknown, path: string): UnknownRecord {
	if (typeof value !== 'object' || value === null || Array.isArray(value)) {
		fail('INVALID_DOCUMENT', 'Expected an object.', path);
	}
	return value as UnknownRecord;
}

export function requireArray(value: unknown, path: string): unknown[] {
	if (!Array.isArray(value)) fail('INVALID_DOCUMENT', 'Expected an array.', path);
	return value;
}

export function requireString(value: unknown, path: string): string {
	if (typeof value !== 'string') fail('INVALID_DOCUMENT', 'Expected a string.', path);
	return value;
}

export function requireBoundedString(value: unknown, path: string, maxLength: number): string {
	const text = requireString(value, path);
	if (text.length === 0) fail('INVALID_DOCUMENT', 'Expected a non-empty string.', path);
	if (text.length > maxLength) {
		fail('LIMIT_EXCEEDED', `String length exceeds the configured limit ${maxLength}.`, path);
	}
	return text;
}

export function requireCharacter(value: unknown, path: string, limits: ResolvedLimits): string {
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

export function requireBoolean(value: unknown, path: string): boolean {
	if (typeof value !== 'boolean') fail('INVALID_DOCUMENT', 'Expected a boolean.', path);
	return value;
}

export function requireFiniteNumber(value: unknown, path: string): number {
	if (typeof value !== 'number' || !Number.isFinite(value)) {
		fail('INVALID_DOCUMENT', 'Expected a finite number.', path);
	}
	return value;
}

export function requireNumberInRange(value: unknown, path: string, minimum: number, maximum: number): number {
	const number = requireFiniteNumber(value, path);
	if (number < minimum || number > maximum) {
		fail('INVALID_DOCUMENT', `Expected a number from ${minimum} through ${maximum}.`, path);
	}
	return number;
}

export function requireSafeInteger(value: unknown, path: string): number {
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

export function failure(code: TextmodeDocumentErrorCode, message: string, path?: string): TextmodeDocumentDecodeResult {
	return { ok: false, error: { code, message, ...(path ? { path } : {}) } };
}

export function fail(code: TextmodeDocumentErrorCode, message: string, path?: string): never {
	throw new DocumentDecodeFailure({ code, message, ...(path ? { path } : {}) });
}
