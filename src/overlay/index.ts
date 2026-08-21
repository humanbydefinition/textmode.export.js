import type { Textmodifier } from 'textmode.js';
import type { TextmodeExportAPI } from '../types';
import type { LayerTargetProvider } from '../exporters/base';
import { OverlayController } from './core/OverlayController';
import { DefaultsStore } from './config/DefaultsStore';
import { getExportFormatDefinitions } from './formatRegistry';

/**
 * Creates an export overlay controller.
 *
 * @param textmodifier - The text modifier instance.
 * @param exportAPI - The export API instance.
 * @param layerTargetProvider - Provider for dynamic layer export targets.
 * @returns The overlay controller instance.
 */
export function createExportOverlay(
	textmodifier: Textmodifier,
	exportAPI: TextmodeExportAPI,
	layerTargetProvider?: LayerTargetProvider
): OverlayController {
	const defaultsStore = new DefaultsStore();
	const definitions = getExportFormatDefinitions(
		layerTargetProvider,
		(format) => defaultsStore.get(format),
		() => {
			const density = textmodifier.pixelDensity?.() ?? 1;
			return {
				width: Math.max(1, Math.round(textmodifier.canvas.width / density)),
				height: Math.max(1, Math.round(textmodifier.canvas.height / density)),
			};
		},
		textmodifier.canvas
	);
	const controller = new OverlayController(textmodifier, exportAPI, defaultsStore, definitions);
	try {
		controller.$mount();
	} catch (error) {
		controller.$dispose();
		throw error;
	}
	return controller;
}
