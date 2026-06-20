import { describe, expectTypeOf, it } from 'vitest';
import type { Textmodifier } from 'textmode.js';
import type { TextmodeExportAPI } from '../types';
import './textmode';

describe('textmode.js type augmentation', () => {
	it('adds the export API to Textmodifier', () => {
		expectTypeOf<Textmodifier>().toMatchTypeOf<TextmodeExportAPI>();
		expectTypeOf<Textmodifier['saveCanvas']>().toEqualTypeOf<TextmodeExportAPI['saveCanvas']>();
		expectTypeOf<Textmodifier['exportOverlay']>().toEqualTypeOf<TextmodeExportAPI['exportOverlay']>();
	});
});
