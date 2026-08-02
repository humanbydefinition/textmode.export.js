// @vitest-environment jsdom

import type { Textmodifier } from 'textmode.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { TextmodeExportAPI } from '../../types';
import type { BladeCapabilities, BladeConfig } from '../blades';
import { Blade } from '../blades';
import { DefaultsStore } from '../config/DefaultsStore';
import type { FormatDefinition } from '../models/FormatDefinition';
import type { OverlayEvents } from '../models/OverlayEvents';
import { PositionService } from '../services/PositionService';
import type { ExportFormat, ExportOptionsMap } from '../types';
import { overlayClasses } from '../utils/classes';
import type { EventBus } from './EventBus';
import { OverlayController } from './OverlayController';

class TestBlade extends Blade<Record<string, unknown>> {
	resetCount = 0;
	progressCount = 0;

	constructor(config: BladeConfig<Record<string, unknown>>, capabilities?: Partial<BladeCapabilities>) {
		super(config, capabilities);
	}

	render(): HTMLElement {
		return document.createElement('div');
	}

	getOptions(): Record<string, unknown> {
		return { ...this._config.defaultOptions };
	}

	setDefaults(values: Record<string, unknown>): void {
		Object.assign(this._config.defaultOptions, values);
		this.reset();
	}

	reset(): void {
		this.resetCount += 1;
	}

	validate(): boolean {
		return true;
	}

	isRecording(): boolean {
		return false;
	}

	setRecordingState(): void {
		// Test double
	}

	handleProgress(): void {
		this.progressCount += 1;
	}
}

interface TestControllerHarness {
	controller: OverlayController;
	blades: Map<ExportFormat, TestBlade>;
	defaultsStore: DefaultsStore;
	events: EventBus<OverlayEvents>;
	switchFormat(format: ExportFormat): void;
}

function createTextmodifier(): Textmodifier {
	const canvas = document.createElement('canvas');
	canvas.getBoundingClientRect = () =>
		({
			top: 0,
			left: 0,
			right: 100,
			bottom: 100,
			width: 100,
			height: 100,
			x: 0,
			y: 0,
			toJSON: () => ({}),
		}) as DOMRect;

	return { canvas } as unknown as Textmodifier;
}

function createExportAPI(): TextmodeExportAPI {
	return {
		exportOverlay: {
			show: vi.fn(),
			hide: vi.fn(),
			toggle: vi.fn(),
			isVisible: vi.fn(() => true),
			resetPosition: vi.fn(),
			getPosition: vi.fn(() => ({ mode: 'auto' as const, offsetX: 8, offsetY: 8 })),
			setPosition: vi.fn(),
			setDefaults: vi.fn(),
			getDefaults: vi.fn(),
			resetDefaults: vi.fn(),
		},
		saveCanvas: vi.fn(async () => undefined),
		toImageBlob: vi.fn(async () => new Blob()),
		copyCanvas: vi.fn(async () => undefined),
		saveSVG: vi.fn(),
		saveStrings: vi.fn(),
		toSVG: vi.fn(() => ''),
		toString: vi.fn(() => ''),
		toJSON: vi.fn(() => ({}) as never),
		toJSONString: vi.fn(() => ''),
		saveJSON: vi.fn(),
		saveGIF: vi.fn(async () => undefined),
		toGIFBlob: vi.fn(async () => new Blob()),
		saveVideo: vi.fn(async () => undefined),
		toVideoBlob: vi.fn(async () => new Blob()),
	};
}

function createHarness(
	formats: ExportFormat[],
	options: { configureDefaults?: (defaultsStore: DefaultsStore) => void } = {}
): TestControllerHarness {
	const defaultsStore = new DefaultsStore();
	options.configureDefaults?.(defaultsStore);
	const blades = new Map<ExportFormat, TestBlade>();
	const definitions = formats.map((format) => ({
		format,
		label: format,
		supportsClipboard: false,
		createBlade: () => {
			const blade = new TestBlade(
				{
					format,
					label: format,
					supportsClipboard: false,
					defaultOptions: defaultsStore.get(format),
				} as BladeConfig<Record<string, unknown>>,
				{ recording: format === 'gif' || format === 'video' }
			);
			blades.set(format, blade);
			return blade as unknown as Blade<ExportOptionsMap[ExportFormat]>;
		},
	})) satisfies Array<FormatDefinition<ExportFormat>>;

	const controller = new OverlayController(createTextmodifier(), createExportAPI(), defaultsStore, definitions);
	controller.$mount();

	const internals = controller as unknown as {
		_events: EventBus<OverlayEvents>;
		_handleFormatChange(format: ExportFormat): void;
	};

	return {
		controller,
		blades,
		defaultsStore,
		events: internals._events,
		switchFormat: (format) => internals._handleFormatChange(format),
	};
}

beforeEach(() => {
	vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
		callback(0);
		return 1;
	});
	vi.stubGlobal('cancelAnimationFrame', vi.fn());
});

afterEach(() => {
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
	document.body.innerHTML = '';
});

describe('OverlayController defaults API', () => {
	it('uses the configured default format on mount', () => {
		const { controller, blades } = createHarness(['txt', 'image'], {
			configureDefaults: (defaultsStore) => defaultsStore.merge({ format: 'image' }),
		});
		const host = document.querySelector('[data-plugin="textmode-export-overlay-host"]') as HTMLDivElement | null;
		const select = host?.shadowRoot?.querySelector<HTMLSelectElement>('#textmode-export-format');
		const txtBlade = blades.get('txt');
		const imageBlade = blades.get('image');

		expect(select?.value).toBe('image');
		expect(txtBlade?.resetCount).toBe(0);
		expect(imageBlade?.resetCount).toBe(1);

		controller.$dispose();
	});

	it('renders and wires the header move handle', () => {
		const attachSpy = vi.spyOn(PositionService.prototype, 'attachDragHandle');
		const { controller } = createHarness(['txt']);
		const host = document.querySelector('[data-plugin="textmode-export-overlay-host"]') as HTMLDivElement | null;
		const handle = host?.shadowRoot?.querySelector(`.${overlayClasses.grabHandle}`) as HTMLButtonElement | null;
		const title = host?.shadowRoot?.querySelector(`.${overlayClasses.title}`);

		expect(handle).toBeInstanceOf(HTMLButtonElement);
		expect(handle?.getAttribute('aria-label')).toBe('Move export overlay');
		expect(handle?.compareDocumentPosition(title as Node)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
		expect(attachSpy).toHaveBeenCalledWith(handle);

		controller.$dispose();
	});

	it('delegates public position API calls to PositionService', () => {
		const { controller } = createHarness(['txt']);
		const positionService = (controller as unknown as { _positionService: PositionService })._positionService;
		const resetSpy = vi.spyOn(positionService, 'resetPosition');
		const getSpy = vi.spyOn(positionService, 'getPosition');
		const setSpy = vi.spyOn(positionService, 'setPosition');

		controller.resetPosition();
		controller.getPosition();
		controller.setPosition({ offsetX: 24, offsetY: 32 });

		expect(resetSpy).toHaveBeenCalledOnce();
		expect(getSpy).toHaveBeenCalledOnce();
		expect(setSpy).toHaveBeenCalledWith({ offsetX: 24, offsetY: 32 });

		controller.$dispose();
	});

	it('schedules a fresh position update when shown after being hidden', () => {
		const { controller } = createHarness(['txt']);
		const positionService = (controller as unknown as { _positionService: PositionService })._positionService;
		const scheduleSpy = vi.spyOn(positionService, 'scheduleUpdate');

		controller.hide();
		controller.show();

		expect(scheduleSpy).toHaveBeenCalledOnce();

		controller.$dispose();
	});

	it('does not reset unmounted blades when defaults are set immediately', () => {
		const { controller, blades, switchFormat } = createHarness(['txt', 'image']);
		const txtBlade = blades.get('txt');
		const imageBlade = blades.get('image');

		if (!txtBlade || !imageBlade) {
			throw new Error('Expected txt and image blades');
		}

		expect(txtBlade.resetCount).toBe(1);
		expect(imageBlade.resetCount).toBe(0);

		expect(() => controller.setDefaults({ image: { scale: 2 } })).not.toThrow();

		expect(txtBlade.resetCount).toBe(1);
		expect(imageBlade.resetCount).toBe(0);

		switchFormat('image');

		expect(imageBlade.resetCount).toBe(1);
		expect(imageBlade.getOptions()).toMatchObject({ scale: 2 });
		controller.$dispose();
	});

	it('switches the selected format when format is set', () => {
		const { controller, blades } = createHarness(['txt', 'image']);
		const host = document.querySelector('[data-plugin="textmode-export-overlay-host"]') as HTMLDivElement | null;
		const select = host?.shadowRoot?.querySelector<HTMLSelectElement>('#textmode-export-format');
		const imageBlade = blades.get('image');

		controller.setDefaults({ format: 'image' });

		expect(select?.value).toBe('image');
		expect(controller.getDefaults().format).toBe('image');
		expect(imageBlade?.resetCount).toBe(1);

		controller.$dispose();
	});

	it('rejects unknown default formats without changing defaults', () => {
		const { controller } = createHarness(['txt', 'image']);

		expect(() => controller.setDefaults({ format: 'video' as ExportFormat })).toThrowErrorMatchingInlineSnapshot(
			`[Error: Unknown export format: video]`
		);
		expect(controller.getDefaults().format).toBe('txt');

		controller.$dispose();
	});

	it('preserves the selected format when only per-format defaults change', () => {
		const { controller } = createHarness(['txt', 'image']);
		const host = document.querySelector('[data-plugin="textmode-export-overlay-host"]') as HTMLDivElement | null;
		const select = host?.shadowRoot?.querySelector<HTMLSelectElement>('#textmode-export-format');

		controller.setDefaults({ image: { scale: 2 } });

		expect(select?.value).toBe('txt');
		expect(controller.getDefaults().format).toBe('txt');

		controller.$dispose();
	});

	it('resets the default format selection without resetting per-format defaults', () => {
		const { controller } = createHarness(['txt', 'image']);
		const host = document.querySelector('[data-plugin="textmode-export-overlay-host"]') as HTMLDivElement | null;
		const select = host?.shadowRoot?.querySelector<HTMLSelectElement>('#textmode-export-format');

		controller.setDefaults({ format: 'image', image: { scale: 3 } });
		controller.resetDefaults('format');

		expect(select?.value).toBe('txt');
		expect(controller.getDefaults().format).toBe('txt');
		expect(controller.getDefaults().image.scale).toBe(3);

		controller.$dispose();
	});

	it('resets all defaults and switches back to the curated default format', () => {
		const { controller } = createHarness(['txt', 'image']);
		const host = document.querySelector('[data-plugin="textmode-export-overlay-host"]') as HTMLDivElement | null;
		const select = host?.shadowRoot?.querySelector<HTMLSelectElement>('#textmode-export-format');

		controller.setDefaults({ format: 'image', image: { scale: 3 } });
		controller.resetDefaults();

		expect(select?.value).toBe('txt');
		expect(controller.getDefaults().format).toBe('txt');
		expect(controller.getDefaults().image.scale).toBe(1);

		controller.$dispose();
	});

	it('resets only requested formats and defers unmounted formats until mount', () => {
		const { controller, blades, switchFormat } = createHarness(['txt', 'image']);
		const txtBlade = blades.get('txt');
		const imageBlade = blades.get('image');

		if (!txtBlade || !imageBlade) {
			throw new Error('Expected txt and image blades');
		}

		controller.setDefaults({ image: { scale: 4 } });
		controller.resetDefaults('image');

		expect(txtBlade.resetCount).toBe(1);
		expect(imageBlade.resetCount).toBe(0);

		switchFormat('image');

		expect(imageBlade.resetCount).toBe(1);
		expect(imageBlade.getOptions()).toMatchObject({ scale: 1 });
		controller.$dispose();
	});

	it('returns defaults snapshots from getDefaults', () => {
		const { controller } = createHarness(['txt']);
		const defaults = controller.getDefaults();

		defaults.txt.emptyCharacter = '#';

		expect(controller.getDefaults().txt.emptyCharacter).toBe(' ');
		controller.$dispose();
	});
});

describe('OverlayController recording progress routing', () => {
	it('forwards progress only to the selected matching recording blade', () => {
		const { controller, blades, events, switchFormat } = createHarness(['gif', 'video']);
		const gifBlade = blades.get('gif');
		const videoBlade = blades.get('video');

		if (!gifBlade || !videoBlade) {
			throw new Error('Expected gif and video blades');
		}

		switchFormat('video');
		events.$emit('export:progress', {
			format: 'gif',
			progress: { state: 'recording', frameIndex: 1, totalFrames: 10 },
		});

		expect(gifBlade.progressCount).toBe(0);
		expect(videoBlade.progressCount).toBe(0);

		events.$emit('export:progress', {
			format: 'video',
			progress: { state: 'recording', frameIndex: 2, totalFrames: 10 },
		});

		expect(videoBlade.progressCount).toBe(1);

		switchFormat('gif');
		events.$emit('export:progress', {
			format: 'gif',
			progress: { state: 'encoding', frameIndex: 10, totalFrames: 10 },
		});

		expect(gifBlade.progressCount).toBe(1);
		controller.$dispose();
	});
});
