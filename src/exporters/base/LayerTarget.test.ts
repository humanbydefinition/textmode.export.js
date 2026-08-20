import { describe, expect, it } from 'vitest';
import type { TextmodeLayer, Textmodifier } from 'textmode.js';

import { getLayerTargetOptions } from './LayerTarget';

describe('LayerTarget visibility', () => {
	it('uses the public layer visibility getter', () => {
		const base = {
			isVisible: () => false,
			grid: {},
			font: {},
			drawFramebuffer: {},
		} as unknown as TextmodeLayer;
		const textmodifier = {
			layers: { base, all: [] },
		} as unknown as Textmodifier;

		expect(getLayerTargetOptions(textmodifier)[0]?.label).toBe('Base layer (hidden)');
	});
});
