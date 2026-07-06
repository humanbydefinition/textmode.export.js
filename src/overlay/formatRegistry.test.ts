// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest';
import type { TextmodeLayer } from 'textmode.js';
import type { LayerTargetProvider } from '../exporters/base';
import { getExportFormatDefinitions } from './formatRegistry';
import { EventBus } from './core/EventBus';
import { ExportService } from './services/ExportService';
import type { OverlayEvents } from './models/OverlayEvents';
import type { TextmodeExportAPI } from '../types';
import { CURATED_DEFAULTS } from './config/ExportDefaults';
import { DefaultsStore } from './config/DefaultsStore';

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

	it('groups WebM and MP4 into a single video definition', () => {
		const definitions = getExportFormatDefinitions();
		const videoDefinitions = definitions.filter((definition) => definition.format === 'video');

		expect(videoDefinitions).toHaveLength(1);
		expect(definitions.some((definition) => String(definition.format) === 'mp4')).toBe(false);
		expect(videoDefinitions[0]?.label).toBe('video (.webm / .mp4)');
	});

	it('returns curated video options and hides transparency for MP4', () => {
		const definition = getExportFormatDefinitions().find((candidate) => candidate.format === 'video');

		if (!definition) {
			throw new Error('Expected video export definition');
		}

		const container = document.createElement('div');
		const blade = definition.createBlade();
		blade.mount(container);

		expect(blade.getOptions()).toMatchObject({
			format: 'mp4',
			bitrate: 'medium',
			bitrateMode: 'variable',
			latencyMode: 'quality',
			hardwareAcceleration: 'no-preference',
			keyFrameInterval: 2,
		});
		expect((blade.getOptions() as { transparent?: boolean }).transparent).toBeUndefined();

		const formatSelect = container.querySelector<HTMLSelectElement>('#textmode-export-video-format');
		const bitrateSelect = container.querySelector<HTMLSelectElement>('#textmode-export-video-bitrate');
		const transparentCheckbox = container.querySelector<HTMLInputElement>('#textmode-export-video-transparent');

		expect(formatSelect).not.toBeNull();
		expect(bitrateSelect).not.toBeNull();
		expect(transparentCheckbox).not.toBeNull();

		if (!formatSelect || !bitrateSelect || !transparentCheckbox) {
			throw new Error('Expected video controls');
		}

		expect(transparentCheckbox.disabled).toBe(true);

		formatSelect.value = 'webm';
		formatSelect.dispatchEvent(new Event('change'));
		bitrateSelect.value = 'high';
		transparentCheckbox.checked = true;

		expect(blade.getOptions()).toMatchObject({
			format: 'webm',
			bitrate: 'high',
			transparent: true,
		});
		expect(transparentCheckbox.disabled).toBe(false);

		blade.destroy();
	});

	it('uses saveVideo for unified video exports', async () => {
		const api = {
			saveVideo: vi.fn(async () => undefined),
		} as unknown as TextmodeExportAPI;
		const service = new ExportService(api, new EventBus<OverlayEvents>());

		await service.$requestExport('video', { format: 'webm', frameCount: 12 });

		expect(api.saveVideo).toHaveBeenCalledWith(
			expect.objectContaining({
				format: 'webm',
				frameCount: 12,
				onProgress: expect.any(Function),
			})
		);
	});

	it('seeds blades with curated defaults', () => {
		const definitions = getExportFormatDefinitions();
		const container = document.createElement('div');

		for (const definition of definitions) {
			const blade = definition.createBlade();
			blade.mount(container);

			const options = blade.getOptions();
			const curated = CURATED_DEFAULTS[definition.format];

			const curatedKeys = Object.keys(curated);
			for (const key of curatedKeys) {
				const bladeValue = (options as Record<string, unknown>)[key];
				// Skip keys that the blade conditionally omits
				// (e.g. video transparent is only present for WebM)
				if (typeof bladeValue === 'undefined') {
					continue;
				}
				const curatedValue = (curated as Record<string, unknown>)[key];
				expect(bladeValue).toEqual(curatedValue);
			}

			blade.destroy();
		}
	});

	it('constructs blades with mutable defaults', () => {
		const definitions = getExportFormatDefinitions();
		const container = document.createElement('div');

		for (const definition of definitions) {
			const blade = definition.createBlade();
			blade.mount(container);

			expect(() => {
				blade.setDefaults({});
			}).not.toThrow();

			blade.destroy();
		}
	});

	it('lets blades created before a defaults update use the updated values on first mount', () => {
		const store = new DefaultsStore();
		const definitions = getExportFormatDefinitions(undefined, (format) => store.get(format));
		const imageDefinition = definitions.find((definition) => definition.format === 'image');

		if (!imageDefinition) {
			throw new Error('Expected image export definition');
		}

		const blade = imageDefinition.createBlade();
		store.merge({ image: { scale: 3 } });

		const container = document.createElement('div');
		blade.mount(container);
		blade.reset();

		expect(blade.getOptions()).toMatchObject({ scale: 3 });
		blade.destroy();
	});

	it('blades report correct capabilities', () => {
		const layer = {} as TextmodeLayer;
		const provider: LayerTargetProvider = {
			getDefaultId: () => 'base',
			getLayerById: () => layer,
			getOptions: () => [{ id: 'base', label: 'Base layer', layer }],
		};
		const definitions = getExportFormatDefinitions(provider);

		for (const definition of definitions) {
			const blade = definition.createBlade();

			if (definition.format === 'gif' || definition.format === 'video') {
				expect(blade.capabilities.recording).toBe(true);
			} else {
				expect(blade.capabilities.recording).toBe(false);
			}

			if (definition.format === 'txt' || definition.format === 'json' || definition.format === 'svg') {
				expect(blade.capabilities.layerTarget).toBe(true);
			} else {
				expect(blade.capabilities.layerTarget).toBe(false);
			}

			expect(blade.capabilities.clipboard).toBe(definition.supportsClipboard);

			blade.destroy();
		}
	});
});
