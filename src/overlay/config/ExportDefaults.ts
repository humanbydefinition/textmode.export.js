import type { ExportDefaults } from '../types';

export const CURATED_DEFAULTS: Readonly<ExportDefaults> = Object.freeze({
	defaultFormat: 'txt',
	txt: Object.freeze({
		preserveTrailingSpaces: false,
		emptyCharacter: ' ',
	}),
	json: Object.freeze({
		target: 'selected',
		pretty: true,
		includeMetadata: true,
		colorMode: 'hex',
	}),
	image: Object.freeze({
		format: 'png',
		scale: 1,
	}),
	svg: Object.freeze({
		includeBackgroundRectangles: true,
		drawMode: 'fill',
		strokeWidth: 1,
	}),
	gif: Object.freeze({
		frameCount: 300,
		frameRate: 60,
		scale: 1,
		repeat: 0,
	}),
	video: Object.freeze({
		format: 'mp4',
		frameCount: 480,
		frameRate: 60,
		bitrate: 'medium',
		bitrateMode: 'variable',
		latencyMode: 'quality',
		hardwareAcceleration: 'no-preference',
		keyFrameInterval: 2,
		transparent: false,
	}),
});

export function createExportDefaults(): ExportDefaults {
	return {
		defaultFormat: CURATED_DEFAULTS.defaultFormat,
		txt: { ...CURATED_DEFAULTS.txt },
		json: { ...CURATED_DEFAULTS.json },
		image: { ...CURATED_DEFAULTS.image },
		svg: { ...CURATED_DEFAULTS.svg },
		gif: { ...CURATED_DEFAULTS.gif },
		video: { ...CURATED_DEFAULTS.video },
	};
}
