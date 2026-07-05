import { GIFBlade, ImageBlade, JSONBlade, SVGBlade, TextBlade, VideoBlade } from './blades';
import type { ExportFormat } from './types';
import type { FormatDefinition } from './models/FormatDefinition';
import type { LayerTargetProvider } from '../exporters/base';
import { CURATED_DEFAULTS } from './config/ExportDefaults';

export function getExportFormatDefinitions(
	layerTargetProvider?: LayerTargetProvider
): ReadonlyArray<FormatDefinition<ExportFormat>> {
	const defaults = CURATED_DEFAULTS;
	return [
		{
			format: 'txt',
			label: 'plain text (.txt)',
			supportsClipboard: true,
			createBlade: () =>
				new TextBlade({
					format: 'txt',
					label: 'plain text (.txt)',
					supportsClipboard: true,
					defaultOptions: defaults.txt,
					layerTargetProvider,
				}),
		},
		{
			format: 'json',
			label: 'document data (.json)',
			supportsClipboard: true,
			createBlade: () =>
				new JSONBlade({
					format: 'json',
					label: 'document data (.json)',
					supportsClipboard: true,
					defaultOptions: defaults.json,
					layerTargetProvider,
				}),
		},
		{
			format: 'image',
			label: 'image (.png / .jpg / .webp)',
			supportsClipboard: true,
			createBlade: () =>
				new ImageBlade({
					format: 'image',
					label: 'image (.png / .jpg / .webp)',
					supportsClipboard: true,
					defaultOptions: defaults.image,
				}),
		},
		{
			format: 'svg',
			label: 'vector (.svg)',
			supportsClipboard: true,
			createBlade: () =>
				new SVGBlade({
					format: 'svg',
					label: 'vector (.svg)',
					supportsClipboard: true,
					defaultOptions: defaults.svg,
					layerTargetProvider,
				}),
		},
		{
			format: 'gif',
			label: 'animated GIF (.gif)',
			supportsClipboard: false,
			createBlade: () =>
				new GIFBlade({
					format: 'gif',
					label: 'animated GIF (.gif)',
					supportsClipboard: false,
					defaultOptions: defaults.gif,
				}),
		},
		{
			format: 'video',
			label: 'video (.webm / .mp4)',
			supportsClipboard: false,
			createBlade: () =>
				new VideoBlade({
					format: 'video',
					label: 'video (.webm / .mp4)',
					supportsClipboard: false,
					defaultOptions: defaults.video,
				}),
		},
	];
}
