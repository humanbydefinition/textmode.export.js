import type { ExportDefaults, ExportDefaultsPatch, ExportFormat } from '../types';
import { CURATED_DEFAULTS } from './ExportDefaults';

export class DefaultsStore {
	private _defaults: ExportDefaults;

	constructor() {
		this._defaults = this._cloneCurated();
	}

	get current(): Readonly<ExportDefaults> {
		return this._defaults;
	}

	get(format: ExportFormat): ExportDefaults[ExportFormat] {
		return this._defaults[format];
	}

	merge(patch: ExportDefaultsPatch): void {
		if (patch.txt) Object.assign(this._defaults.txt, patch.txt);
		if (patch.json) Object.assign(this._defaults.json, patch.json);
		if (patch.image) Object.assign(this._defaults.image, patch.image);
		if (patch.svg) Object.assign(this._defaults.svg, patch.svg);
		if (patch.gif) Object.assign(this._defaults.gif, patch.gif);
		if (patch.video) Object.assign(this._defaults.video, patch.video);
	}

	reset(format?: ExportFormat): void {
		if (!format) {
			this._defaults = this._cloneCurated();
			return;
		}
		switch (format) {
			case 'txt':
				this._defaults.txt = { ...CURATED_DEFAULTS.txt };
				break;
			case 'json':
				this._defaults.json = { ...CURATED_DEFAULTS.json };
				break;
			case 'image':
				this._defaults.image = { ...CURATED_DEFAULTS.image };
				break;
			case 'svg':
				this._defaults.svg = { ...CURATED_DEFAULTS.svg };
				break;
			case 'gif':
				this._defaults.gif = { ...CURATED_DEFAULTS.gif };
				break;
			case 'video':
				this._defaults.video = { ...CURATED_DEFAULTS.video };
				break;
		}
	}

	private _cloneCurated(): ExportDefaults {
		return {
			txt: { ...CURATED_DEFAULTS.txt },
			json: { ...CURATED_DEFAULTS.json },
			image: { ...CURATED_DEFAULTS.image },
			svg: { ...CURATED_DEFAULTS.svg },
			gif: { ...CURATED_DEFAULTS.gif },
			video: { ...CURATED_DEFAULTS.video },
		};
	}
}
