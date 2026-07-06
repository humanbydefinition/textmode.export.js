import { GIFBlade, ImageBlade, JSONBlade, SVGBlade, TextBlade, VideoBlade } from './blades';
import type { ExportFormat } from './types';
import type { FormatDefinition } from './models/FormatDefinition';
import type { LayerTargetProvider } from '../exporters/base';
import type { ExportDefaults } from './types';
import { createExportDefaults } from './config/ExportDefaults';

export type ExportDefaultsProvider = <TFormat extends ExportFormat>(format: TFormat) => ExportDefaults[TFormat];

const createStandaloneDefaultsProvider = (): ExportDefaultsProvider => {
	const defaults = createExportDefaults();
	return (format) => defaults[format];
};

export function getExportFormatDefinitions(
	layerTargetProvider?: LayerTargetProvider,
	getDefaults: ExportDefaultsProvider = createStandaloneDefaultsProvider()
): ReadonlyArray<FormatDefinition<ExportFormat>> {
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
					defaultOptions: getDefaults('txt'),
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
					defaultOptions: getDefaults('json'),
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
					defaultOptions: getDefaults('image'),
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
					defaultOptions: getDefaults('svg'),
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
					defaultOptions: getDefaults('gif'),
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
					defaultOptions: getDefaults('video'),
				}),
		},
	];
}
