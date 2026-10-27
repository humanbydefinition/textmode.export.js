import { describe, expectTypeOf, it } from 'vitest';
import type { Textmodifier } from 'textmode.js';
import type { TextmodeExportAPI } from '../types';
import type { ZIPExportOptions } from '../exporters/zip';
import './textmode';

describe('textmode.js type augmentation', () => {
	it('adds the export API to Textmodifier', () => {
		expectTypeOf<Textmodifier>().toMatchTypeOf<TextmodeExportAPI>();
		expectTypeOf<Textmodifier['saveCanvas']>().toEqualTypeOf<TextmodeExportAPI['saveCanvas']>();
		expectTypeOf<Textmodifier['exportOverlay']>().toEqualTypeOf<TextmodeExportAPI['exportOverlay']>();
		expectTypeOf<Textmodifier['saveZip']>().toEqualTypeOf<TextmodeExportAPI['saveZip']>();
		expectTypeOf<Textmodifier['toZipBlob']>().toEqualTypeOf<TextmodeExportAPI['toZipBlob']>();
	});

	it('discriminates ZIP frame options by format', () => {
		const png: ZIPExportOptions = { format: 'png', frameOptions: { scale: 2 } };
		const svg: ZIPExportOptions = { format: 'svg', frameOptions: { drawMode: 'stroke', strokeWidth: 1.5 } };
		// @ts-expect-error SVG frames do not accept raster scale controls.
		const mismatched: ZIPExportOptions = { format: 'svg', frameOptions: { scale: 2 } };
		// @ts-expect-error Animated containers cannot be ZIP frame formats.
		const animated: ZIPExportOptions = { format: 'gif' };
		expectTypeOf(png).toMatchTypeOf<ZIPExportOptions>();
		expectTypeOf(svg).toMatchTypeOf<ZIPExportOptions>();
		void mismatched;
		void animated;
	});
});
