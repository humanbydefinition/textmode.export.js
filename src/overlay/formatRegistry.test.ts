// @vitest-environment jsdom

import { describe, expect, it } from 'vitest';
import type { TextmodeLayer } from 'textmode.js';
import type { LayerTargetProvider } from '../exporters/base';
import { getExportFormatDefinitions } from './formatRegistry';

describe('getExportFormatDefinitions', () => {
	it('adds layer targeting only to layer-data formats', () => {
		const layer = {} as TextmodeLayer;
		const provider: LayerTargetProvider = {
			getDefaultId: () => 'base',
			getLayerById: () => layer,
			getOptions: () => [{ id: 'base', label: 'Base layer', layer }],
		};
		const definitions = getExportFormatDefinitions(provider);
		const container = document.createElement('div');

		for (const definition of definitions) {
			const blade = definition.createBlade();
			blade.mount(container);
			const options = blade.getOptions() as { layer?: TextmodeLayer };

			if (definition.format === 'txt' || definition.format === 'json' || definition.format === 'svg') {
				expect(options.layer).toBe(layer);
			} else {
				expect(options.layer).toBeUndefined();
			}

			blade.destroy();
		}
	});
});
