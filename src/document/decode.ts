import {
	LEGACY_TEXTMODE_ALL_VERSION,
	LEGACY_TEXTMODE_LAYER_FORMAT,
	LEGACY_TEXTMODE_SELECTED_VERSION,
	TEXTMODE_DOCUMENT_FORMAT,
	TEXTMODE_DOCUMENT_FORMAT_VERSION,
} from './constants';
import { decodeAllDocument, decodeSelectedDocument } from './decode-shapes';
import { parseJSON } from './parse';
import { DocumentDecodeFailure, fail, failure, requireRecord, requireString, resolveLimits } from './validation';
import type { DecodeContext, UnknownRecord } from './validation';
import type {
	CanonicalTextmodeDocument,
	TextmodeDocumentDecodeOptions,
	TextmodeDocumentDecodeResult,
	TextmodeDocumentParseResult,
} from './types';

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
