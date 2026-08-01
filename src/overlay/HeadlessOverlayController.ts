import type {
	ExportDefaults,
	ExportDefaultsPatch,
	ExportOverlayController,
	ExportOverlayPosition,
	ExportOverlayPositionInput,
} from '../types';
import { DefaultsStore } from './config/DefaultsStore';

/** Overlay-compatible controller used when the plugin is installed headlessly. */
export class HeadlessOverlayController implements ExportOverlayController {
	private readonly _defaults = new DefaultsStore();
	private _position: ExportOverlayPosition = { mode: 'auto', offsetX: 0, offsetY: 0 };

	show(): void {}

	hide(): void {}

	toggle(): void {}

	isVisible(): boolean {
		return false;
	}

	resetPosition(): void {
		this._position = { mode: 'auto', offsetX: 0, offsetY: 0 };
	}

	getPosition(): Readonly<ExportOverlayPosition> {
		return { ...this._position };
	}

	setPosition(position: ExportOverlayPositionInput): void {
		this._position = { mode: 'custom', ...position };
	}

	setDefaults(patch: ExportDefaultsPatch): void {
		this._defaults.merge(patch);
	}

	getDefaults(): Readonly<ExportDefaults> {
		return this._defaults.current;
	}

	resetDefaults(format?: keyof ExportDefaults): void {
		this._defaults.reset(format);
	}
}
