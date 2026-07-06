// @vitest-environment jsdom

import type { Textmodifier } from 'textmode.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { overlayClasses } from '../utils/classes';
import { OverlayPositionStorage } from './OverlayPositionStorage';
import { PositionService } from './PositionService';

let storageKeyIndex = 0;

const rect = (left: number, top: number, width: number, height: number): DOMRect =>
	({
		left,
		top,
		width,
		height,
		right: left + width,
		bottom: top + height,
		x: left,
		y: top,
		toJSON: () => ({}),
	}) as DOMRect;

function pointerEvent(type: string, init: MouseEventInit & { pointerId?: number } = {}): PointerEvent {
	const event = new MouseEvent(type, {
		bubbles: true,
		cancelable: true,
		button: 0,
		...init,
	}) as PointerEvent;
	Object.defineProperty(event, 'pointerId', {
		value: init.pointerId ?? 1,
	});
	return event;
}

function createStorage(): Storage {
	const store = new Map<string, string>();
	return {
		get length() {
			return store.size;
		},
		clear: () => store.clear(),
		getItem: (key: string) => store.get(key) ?? null,
		key: (index: number) => [...store.keys()][index] ?? null,
		removeItem: (key: string) => {
			store.delete(key);
		},
		setItem: (key: string, value: string) => {
			store.set(key, String(value));
		},
	} as Storage;
}

function createHarness({
	canvasRect = rect(40, 30, 200, 120),
	surfaceRect = rect(0, 0, 236, 180),
	storageKey = `textmode-position-test-${storageKeyIndex++}`,
}: {
	canvasRect?: DOMRect;
	surfaceRect?: DOMRect;
	storageKey?: string;
} = {}) {
	const canvas = document.createElement('canvas');
	canvas.getBoundingClientRect = () => canvasRect;

	const host = document.createElement('div');
	host.getBoundingClientRect = () =>
		rect(parseFloat(host.style.left) || 0, parseFloat(host.style.top) || 0, 236, 180);

	const surface = document.createElement('div');
	surface.getBoundingClientRect = () => surfaceRect;

	const handle = document.createElement('button');
	handle.setPointerCapture = vi.fn();
	handle.releasePointerCapture = vi.fn();
	handle.hasPointerCapture = vi.fn(() => true);

	const storage = new OverlayPositionStorage(storageKey);
	const service = new PositionService({ canvas } as unknown as Textmodifier, host, surface, storage);

	return {
		canvas,
		handle,
		host,
		service,
		storage,
		storageKey,
		surface,
	};
}

beforeEach(() => {
	vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
		callback(0);
		return 1;
	});
	vi.stubGlobal('cancelAnimationFrame', vi.fn());
	Object.defineProperty(window, 'innerWidth', { configurable: true, value: 800 });
	Object.defineProperty(window, 'innerHeight', { configurable: true, value: 600 });
	Object.defineProperty(window, 'scrollX', { configurable: true, value: 0 });
	Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 });
	Object.defineProperty(window, 'localStorage', { configurable: true, value: createStorage() });
	window.localStorage.clear();
});

afterEach(() => {
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
	document.body.innerHTML = '';
	try {
		window.localStorage.clear();
	} catch {
		// Individual tests may replace storage with throwing methods.
	}
});

describe('PositionService', () => {
	it('positions the overlay at the default canvas-relative offset', () => {
		const { host, service } = createHarness();

		service.bind();

		expect(host.style.left).toBe('48px');
		expect(host.style.top).toBe('38px');
		expect(service.getPosition()).toMatchObject({ mode: 'auto', offsetX: 8, offsetY: 8 });
	});

	it('drags the overlay, uses pointer capture, and remembers the custom offset', () => {
		const { handle, host, service, storageKey, surface } = createHarness();
		service.bind();
		service.attachDragHandle(handle);

		handle.dispatchEvent(pointerEvent('pointerdown', { clientX: 10, clientY: 12, pointerId: 7 }));
		handle.dispatchEvent(pointerEvent('pointermove', { clientX: 50, clientY: 42, pointerId: 7 }));
		handle.dispatchEvent(pointerEvent('pointerup', { clientX: 50, clientY: 42, pointerId: 7 }));

		expect(handle.setPointerCapture).toHaveBeenCalledWith(7);
		expect(handle.releasePointerCapture).toHaveBeenCalledWith(7);
		expect(host.style.left).toBe('88px');
		expect(host.style.top).toBe('68px');
		expect(surface.classList.contains(overlayClasses.rootDragging)).toBe(false);
		expect(JSON.parse(window.localStorage.getItem(storageKey) ?? '{}')).toMatchObject({
			version: 1,
			offsetX: 48,
			offsetY: 38,
		});
	});

	it('preserves custom canvas-relative offsets across scroll and resize updates', () => {
		let canvasRect = rect(40, 30, 200, 120);
		const { canvas, host, service } = createHarness({ canvasRect });
		service.bind();
		service.setPosition({ offsetX: 24, offsetY: 32 });

		Object.defineProperty(window, 'scrollX', { configurable: true, value: 100 });
		Object.defineProperty(window, 'scrollY', { configurable: true, value: 200 });
		canvasRect = rect(90, 130, 200, 120);
		canvas.getBoundingClientRect = () => canvasRect;
		window.dispatchEvent(new Event('resize'));

		expect(host.style.left).toBe('214px');
		expect(host.style.top).toBe('362px');
		expect(service.getPosition()).toMatchObject({ mode: 'custom', offsetX: 24, offsetY: 32 });
	});

	it('clamps auto placement to the viewport without changing the logical default offset', () => {
		const { host, service } = createHarness({
			canvasRect: rect(40, 30, 200, 120),
			surfaceRect: rect(0, 0, 236, 180),
		});
		Object.defineProperty(window, 'innerWidth', { configurable: true, value: 260 });
		Object.defineProperty(window, 'innerHeight', { configurable: true, value: 220 });

		service.bind();

		expect(host.style.left).toBe('16px');
		expect(host.style.top).toBe('32px');
		expect(service.getPosition()).toMatchObject({ mode: 'auto', offsetX: 8, offsetY: 8 });
	});

	it('clamps custom placement to the viewport without changing or persisting the logical offset', () => {
		const { host, service, storageKey } = createHarness({
			canvasRect: rect(40, 30, 200, 120),
			surfaceRect: rect(0, 0, 236, 180),
		});
		Object.defineProperty(window, 'innerWidth', { configurable: true, value: 260 });
		Object.defineProperty(window, 'innerHeight', { configurable: true, value: 220 });

		service.bind();
		service.setPosition({ offsetX: 1000, offsetY: 1000 });

		expect(host.style.left).toBe('16px');
		expect(host.style.top).toBe('32px');
		expect(service.getPosition()).toMatchObject({ mode: 'custom', offsetX: 1000, offsetY: 1000 });
		expect(JSON.parse(window.localStorage.getItem(storageKey) ?? '{}')).toMatchObject({
			version: 1,
			offsetX: 1000,
			offsetY: 1000,
		});
	});

	it('preserves stored custom offsets after temporary viewport clamping clears', () => {
		let canvasRect = rect(40, 30, 200, 120);
		const { canvas, host, service, storageKey } = createHarness({
			canvasRect,
			surfaceRect: rect(0, 0, 236, 180),
		});
		service.bind();
		service.setPosition({ offsetX: 420, offsetY: 32 });

		Object.defineProperty(window, 'innerWidth', { configurable: true, value: 260 });
		window.dispatchEvent(new Event('resize'));

		expect(host.style.left).toBe('16px');
		expect(service.getPosition()).toMatchObject({ mode: 'custom', offsetX: 420, offsetY: 32 });
		expect(JSON.parse(window.localStorage.getItem(storageKey) ?? '{}')).toMatchObject({
			offsetX: 420,
			offsetY: 32,
		});

		Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1000 });
		Object.defineProperty(window, 'scrollX', { configurable: true, value: 100 });
		canvasRect = rect(90, 30, 200, 120);
		canvas.getBoundingClientRect = () => canvasRect;
		window.dispatchEvent(new Event('resize'));

		expect(host.style.left).toBe('610px');
		expect(service.getPosition()).toMatchObject({ mode: 'custom', offsetX: 420, offsetY: 32 });
		expect(JSON.parse(window.localStorage.getItem(storageKey) ?? '{}')).toMatchObject({
			offsetX: 420,
			offsetY: 32,
		});
	});

	it('starts drag and keyboard movement from the visible clamped offset', () => {
		const { handle, service } = createHarness({
			canvasRect: rect(40, 30, 200, 120),
			surfaceRect: rect(0, 0, 236, 180),
		});
		Object.defineProperty(window, 'innerWidth', { configurable: true, value: 260 });
		Object.defineProperty(window, 'innerHeight', { configurable: true, value: 220 });
		service.bind();
		service.attachDragHandle(handle);
		service.setPosition({ offsetX: 1000, offsetY: 1000 });

		handle.dispatchEvent(pointerEvent('pointerdown', { clientX: 10, clientY: 12, pointerId: 7 }));
		handle.dispatchEvent(pointerEvent('pointermove', { clientX: 26, clientY: 20, pointerId: 7 }));
		handle.dispatchEvent(pointerEvent('pointerup', { clientX: 26, clientY: 20, pointerId: 7 }));

		expect(service.getPosition()).toMatchObject({ mode: 'custom', offsetX: -8, offsetY: 10 });

		handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));

		expect(service.getPosition()).toMatchObject({ mode: 'custom', offsetX: -16, offsetY: 2 });
	});

	it('skips measurement while hidden and remeasures when shown again', () => {
		const { host, service } = createHarness({
			canvasRect: rect(40, 30, 200, 120),
			surfaceRect: rect(0, 0, 236, 180),
		});
		service.bind();

		host.style.display = 'none';
		Object.defineProperty(window, 'innerWidth', { configurable: true, value: 260 });
		service.setPosition({ offsetX: 1000, offsetY: 1000 });

		expect(host.style.left).toBe('48px');
		expect(service.getPosition()).toMatchObject({ mode: 'custom', offsetX: 1000, offsetY: 1000 });

		host.style.display = '';
		service.scheduleUpdate();

		expect(host.style.left).toBe('16px');
		expect(service.getPosition()).toMatchObject({ mode: 'custom', offsetX: 1000, offsetY: 1000 });
	});

	it('resets placement and clears remembered state', () => {
		const { service, storageKey } = createHarness();
		service.bind();
		service.setPosition({ offsetX: 64, offsetY: 72 });

		service.resetPosition();

		expect(window.localStorage.getItem(storageKey)).toBeNull();
		expect(service.getPosition()).toMatchObject({ mode: 'auto', offsetX: 8, offsetY: 8 });
	});

	it('ignores invalid persisted state', () => {
		const storageKey = 'textmode-position-test-invalid';
		window.localStorage.setItem(storageKey, JSON.stringify({ version: 1, offsetX: Infinity, offsetY: 20 }));

		const { service } = createHarness({ storageKey });

		expect(service.getPosition()).toMatchObject({ mode: 'auto', offsetX: 8, offsetY: 8 });
	});

	it('does not throw when storage access fails', () => {
		Object.defineProperty(window, 'localStorage', {
			configurable: true,
			value: {
				getItem: () => {
					throw new Error('blocked');
				},
				setItem: () => {
					throw new Error('blocked');
				},
				removeItem: () => {
					throw new Error('blocked');
				},
				clear: () => {
					throw new Error('blocked');
				},
			},
		});

		expect(() => createHarness()).not.toThrow();

		const { service } = createHarness();

		expect(() => service.setPosition({ offsetX: 20, offsetY: 20 })).not.toThrow();
	});

	it('supports keyboard movement and Home reset from the grab handle', () => {
		const { handle, service } = createHarness();
		service.bind();
		service.attachDragHandle(handle);

		handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
		handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', shiftKey: true, bubbles: true }));

		expect(service.getPosition()).toMatchObject({ mode: 'custom', offsetX: 16, offsetY: 40 });

		handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));

		expect(service.getPosition()).toMatchObject({ mode: 'auto', offsetX: 8, offsetY: 8 });
	});

	it('removes listeners and cancels pending frames on dispose', () => {
		const removeSpy = vi.spyOn(window, 'removeEventListener');
		const { handle, service } = createHarness();
		service.bind();
		service.attachDragHandle(handle);
		const removePointerSpy = vi.spyOn(handle, 'removeEventListener');

		service.scheduleUpdate();
		service.dispose();

		expect(cancelAnimationFrame).toHaveBeenCalledWith(1);
		expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function));
		expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function), true);
		expect(removePointerSpy).toHaveBeenCalledWith('pointerdown', expect.any(Function));
		expect(removePointerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
	});
});
