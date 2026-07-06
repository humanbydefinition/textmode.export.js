import type { ExportDefaults, ExportDefaultsPatch, ExportFormat } from '../types';
import { createExportDefaults } from './ExportDefaults';

export type ExportDefaultsResetTarget = ExportFormat | 'defaultFormat';

function replaceObject<TValue extends object>(target: TValue, source: TValue): void {
	for (const key of Object.keys(target) as Array<keyof TValue>) {
		delete target[key];
	}
	Object.assign(target, source);
}

function cloneDefaults(defaults: ExportDefaults): ExportDefaults {
	return {
		defaultFormat: defaults.defaultFormat,
		txt: { ...defaults.txt },
		json: { ...defaults.json },
		image: { ...defaults.image },
		svg: { ...defaults.svg },
		gif: { ...defaults.gif },
		video: { ...defaults.video },
	};
}

export class DefaultsStore {
	private _defaults: ExportDefaults;

	constructor() {
		this._defaults = createExportDefaults();
	}

	get current(): Readonly<ExportDefaults> {
		return this.snapshot();
	}

	snapshot(): ExportDefaults {
		return cloneDefaults(this._defaults);
	}

	get<TFormat extends ExportFormat>(format: TFormat): ExportDefaults[TFormat] {
		return this._defaults[format];
	}

	merge(patch: ExportDefaultsPatch): void {
		if (patch.defaultFormat) this._defaults.defaultFormat = patch.defaultFormat;
		if (patch.txt) Object.assign(this._defaults.txt, patch.txt);
		if (patch.json) Object.assign(this._defaults.json, patch.json);
		if (patch.image) Object.assign(this._defaults.image, patch.image);
		if (patch.svg) Object.assign(this._defaults.svg, patch.svg);
		if (patch.gif) Object.assign(this._defaults.gif, patch.gif);
		if (patch.video) Object.assign(this._defaults.video, patch.video);
	}

	reset(format?: ExportDefaultsResetTarget): void {
		const curated = createExportDefaults();
		if (!format) {
			this._defaults.defaultFormat = curated.defaultFormat;
			replaceObject(this._defaults.txt, curated.txt);
			replaceObject(this._defaults.json, curated.json);
			replaceObject(this._defaults.image, curated.image);
			replaceObject(this._defaults.svg, curated.svg);
			replaceObject(this._defaults.gif, curated.gif);
			replaceObject(this._defaults.video, curated.video);
			return;
		}
		switch (format) {
			case 'defaultFormat':
				this._defaults.defaultFormat = curated.defaultFormat;
				break;
			case 'txt':
				replaceObject(this._defaults.txt, curated.txt);
				break;
			case 'json':
				replaceObject(this._defaults.json, curated.json);
				break;
			case 'image':
				replaceObject(this._defaults.image, curated.image);
				break;
			case 'svg':
				replaceObject(this._defaults.svg, curated.svg);
				break;
			case 'gif':
				replaceObject(this._defaults.gif, curated.gif);
				break;
			case 'video':
				replaceObject(this._defaults.video, curated.video);
				break;
		}
	}
}
