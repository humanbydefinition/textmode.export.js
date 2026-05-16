import type { Textmodifier, TextmodeFramebuffer, TextmodeGrid } from 'textmode.js';
import type { TextmodeFont, TextmodeTileset } from 'textmode.js';
import type { TextmodeLayer } from 'textmode.js';

/**
 * Shared option for exporters that read layer framebuffer data.
 */
export interface LayerExportOptions {
	/**
	 * Layer to export.
	 *
	 * Defaults to `textmodifier.layers.base`.
	 */
	layer?: TextmodeLayer;
}

export interface ResolvedLayerExportTarget {
	id: string;
	label: string;
	layer: TextmodeLayer;
	grid: TextmodeGrid;
	font: TextmodeFont | TextmodeTileset;
	drawFramebuffer: TextmodeFramebuffer;
}

export interface LayerTargetOption {
	id: string;
	label: string;
	layer: TextmodeLayer;
}

export interface LayerTargetProvider {
	getOptions(): LayerTargetOption[];
	getLayerById(id: string): TextmodeLayer | undefined;
	getDefaultId(): string;
}

function getLayerLabel(id: string, layer: TextmodeLayer): string {
	const baseLabel = id === 'base' ? 'Base layer' : `Layer ${Number.parseInt(id.replace('layer-', ''), 10)}`;
	const visibility = (layer as { _visible?: boolean })._visible;
	return visibility === false ? `${baseLabel} (hidden)` : baseLabel;
}

export function getLayerTargetOptions(textmodifier: Textmodifier): LayerTargetOption[] {
	const layers = [
		{ id: 'base', layer: textmodifier.layers.base },
		...textmodifier.layers.all.map((layer, index) => ({ id: `layer-${index + 1}`, layer })),
	];

	return layers.map(({ id, layer }) => ({
		id,
		label: getLayerLabel(id, layer),
		layer,
	}));
}

export function createLayerTargetProvider(textmodifier: Textmodifier): LayerTargetProvider {
	return {
		getOptions: () => getLayerTargetOptions(textmodifier),
		getLayerById: (id) => getLayerTargetOptions(textmodifier).find((option) => option.id === id)?.layer,
		getDefaultId: () => 'base',
	};
}

export function getLayerTargetId(textmodifier: Textmodifier, layer: TextmodeLayer): string {
	if (layer === textmodifier.layers.base) {
		return 'base';
	}

	const index = textmodifier.layers.all.indexOf(layer);
	if (index >= 0) {
		return `layer-${index + 1}`;
	}

	throw new Error('[textmode-export] Cannot export a layer that is not managed by this Textmodifier instance.');
}

export function resolveLayerExportTarget(textmodifier: Textmodifier, layer?: TextmodeLayer): ResolvedLayerExportTarget {
	const targetLayer = layer ?? textmodifier.layers.base;
	const id = getLayerTargetId(textmodifier, targetLayer);
	const grid = targetLayer.grid;
	const font = targetLayer.font;
	const drawFramebuffer = targetLayer.drawFramebuffer;

	if (!grid || !drawFramebuffer) {
		throw new Error('[textmode-export] Cannot export an uninitialized layer.');
	}

	return {
		id,
		label: getLayerLabel(id, targetLayer),
		layer: targetLayer,
		grid,
		font,
		drawFramebuffer,
	};
}
