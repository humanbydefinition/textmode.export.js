import type { TextmodeFont, TextmodeFontSourceData } from 'textmode.js';
import type { TextmodeDocumentFontReference } from '@textmode/document';
import { identifySfntFont } from '@textmode/document/font';

const references = new WeakMap<TextmodeFontSourceData, TextmodeDocumentFontReference>();

/**
 * Identify a loaded font once per immutable source and return an independent reference.
 *
 * @category JSON document data
 * @see {@link https://code.textmode.art/api/textmode.export.js/functions/getFontReference | getFontReference API reference}
 * @example
 * ```ts
 * const reference = getFontReference(await t.loadFont('font.ttf'));
 * console.log(reference.id);
 * ```
 */
export function getFontReference(font: TextmodeFont): TextmodeDocumentFontReference {
	const source = font.sourceData;
	if (!source || typeof source.copyBytes !== 'function')
		throw new Error(
			'Font source data is unavailable. Update textmode.js to a version that provides TextmodeFont.sourceData.'
		);
	let reference = references.get(source);
	if (!reference) {
		const result = identifySfntFont(source.copyBytes());
		if (!result.ok) throw new Error(`Cannot identify font (${result.error.code}): ${result.error.message}`);
		reference = Object.freeze({ ...result.font });
		references.set(source, reference);
	}
	return { ...reference };
}
