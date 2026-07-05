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
	const definitions = getExportFormatDefinitions(layerTargetProvider);
	const defaultsStore = new DefaultsStore();
	const controller = new OverlayController(textmodifier, exportAPI, defaultsStore, definitions);
	controller.$mount();
	return controller;
}
