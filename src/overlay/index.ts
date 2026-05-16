import type { Textmodifier } from 'textmode.js';
import type { TextmodeExportAPI } from '../types';
import type { LayerTargetProvider } from '../exporters/base';
import { OverlayController } from './core/OverlayController';
import { EventBus } from './core/EventBus';
import { StateManager } from './core/StateManager';
import { createInitialOverlayState } from './models/OverlayState';
import type { OverlayEvents } from './models/OverlayEvents';
import { getExportFormatDefinitions } from './formatRegistry';

export type { ExportFormat } from './types';

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
	const defaultFormat = definitions[0]?.format;
	const state = new StateManager(createInitialOverlayState(defaultFormat));
	const events = new EventBus<OverlayEvents>();

	const controller = new OverlayController(textmodifier, exportAPI, state, events, definitions);
	controller.$mount();
	return controller;
}
