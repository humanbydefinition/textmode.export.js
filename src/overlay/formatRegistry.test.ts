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

	it('lets JSON exports target all layers without passing a selected layer', () => {
		const layer = {} as TextmodeLayer;
		const provider: LayerTargetProvider = {
			getDefaultId: () => 'base',
			getLayerById: () => layer,
			getOptions: () => [{ id: 'base', label: 'Base layer', layer }],
		};
		const definition = getExportFormatDefinitions(provider).find((candidate) => candidate.format === 'json');

		if (!definition) {
			throw new Error('Expected JSON export definition');
		}

		const container = document.createElement('div');
		const blade = definition.createBlade();
		blade.mount(container);

		expect(blade.getOptions()).toMatchObject({
			target: 'selected',
			layer,
		});

		const targetSelect = container.querySelector<HTMLSelectElement>('#textmode-export-json-target');
		const layerSelect = container.querySelector<HTMLSelectElement>('#textmode-export-json-layer');

		expect(targetSelect).not.toBeNull();
		expect(layerSelect).not.toBeNull();

		if (!targetSelect || !layerSelect) {
			throw new Error('Expected JSON target and layer controls');
		}

		targetSelect.value = 'all';
		targetSelect.dispatchEvent(new Event('change'));

		expect(blade.getOptions()).toMatchObject({ target: 'all' });
		expect((blade.getOptions() as { layer?: TextmodeLayer }).layer).toBeUndefined();
		expect(layerSelect.disabled).toBe(true);

		let hiddenAncestorFound = false;
		let currentElement: HTMLElement | null = layerSelect;
		while (currentElement && currentElement !== container) {
			hiddenAncestorFound ||= currentElement.style.display === 'none';
			currentElement = currentElement.parentElement;
		}
		expect(hiddenAncestorFound).toBe(true);

		blade.destroy();
	});
});
