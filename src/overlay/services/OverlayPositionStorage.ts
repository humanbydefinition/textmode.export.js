export interface StoredOverlayPosition {
	version: 1;
	offsetX: number;
	offsetY: number;
}

const STORAGE_KEY = 'textmode.export.overlay.position.v1';
const MAX_STORED_OFFSET = 100000;

const isFiniteOffset = (value: unknown): value is number =>
	typeof value === 'number' && Number.isFinite(value) && Math.abs(value) <= MAX_STORED_OFFSET;

export class OverlayPositionStorage {
	private readonly key: string;

	constructor(key = STORAGE_KEY) {
		this.key = key;
	}

	load(): StoredOverlayPosition | undefined {
		try {
			const raw = window.localStorage.getItem(this.key);
			if (!raw) {
				return undefined;
			}
			const parsed = JSON.parse(raw) as Partial<StoredOverlayPosition>;
			if (parsed.version !== 1 || !isFiniteOffset(parsed.offsetX) || !isFiniteOffset(parsed.offsetY)) {
				return undefined;
			}
			return {
				version: 1,
				offsetX: parsed.offsetX,
				offsetY: parsed.offsetY,
			};
		} catch {
			return undefined;
		}
	}

	save(offsetX: number, offsetY: number): void {
		if (!isFiniteOffset(offsetX) || !isFiniteOffset(offsetY)) {
			return;
		}
		try {
			const payload: StoredOverlayPosition = {
				version: 1,
				offsetX,
				offsetY,
			};
			window.localStorage.setItem(this.key, JSON.stringify(payload));
		} catch {
			// Placement persistence is best-effort UI state.
		}
	}

	clear(): void {
		try {
			window.localStorage.removeItem(this.key);
		} catch {
			// Placement persistence is best-effort UI state.
		}
	}
}
