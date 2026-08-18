// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest';
import type { VideoExportOptions } from '../../exporters/video';
import type { BladeConfig } from './Blade';
import { VideoBlade } from './VideoBlade';

class ResizeObserverMock {
	static instances: ResizeObserverMock[] = [];

	readonly observe = vi.fn();
	readonly disconnect = vi.fn();

	constructor(private readonly callback: ResizeObserverCallback) {
		ResizeObserverMock.instances.push(this);
	}

	emit(): void {
		this.callback([], this as unknown as ResizeObserver);
	}
}

afterEach(() => {
	ResizeObserverMock.instances = [];
	vi.unstubAllGlobals();
	document.body.replaceChildren();
});

describe('VideoBlade', () => {
	it('refreshes the output estimate when the observed canvas resizes', () => {
		vi.stubGlobal('ResizeObserver', ResizeObserverMock);

		const canvas = document.createElement('canvas');
		let dimensions = { width: 320, height: 240 };
		const blade = new VideoBlade({
			format: 'video',
			label: 'video (.webm / .mp4)',
			supportsClipboard: false,
			defaultOptions: {},
			videoDimensionsProvider: () => dimensions,
			videoDimensionsTarget: canvas,
		} as BladeConfig<VideoExportOptions> & { videoDimensionsTarget: HTMLCanvasElement });
		const container = document.createElement('div');

		blade.mount(container);
		expect(container.textContent).toContain('320×240');
		expect(ResizeObserverMock.instances).toHaveLength(1);
		const observer = ResizeObserverMock.instances[0]!;
		expect(observer.observe).toHaveBeenCalledWith(canvas);

		dimensions = { width: 800, height: 600 };
		observer.emit();

		expect(container.textContent).toContain('800×600');
		blade.destroy();
		expect(observer.disconnect).toHaveBeenCalledOnce();
	});
});
