import { beforeEach, describe, expect, it, vi } from 'vitest';

const { render } = vi.hoisted(() => ({
	render: vi.fn(async (options: Record<string, unknown>) => {
		const canvas = { width: 1, height: 1 };
		await (options.prepareFrame as ((context: Record<string, unknown>) => Promise<void>) | undefined)?.({
			frameIndex: 0,
			frameCount: 1,
			timeSeconds: 0,
			frameRate: 24,
		});
		await (options.onFrame as (context: Record<string, unknown>) => Promise<void>)({ frameIndex: 0, canvas });
	}),
}));

vi.mock('../video/VideoFrameDriver', () => ({
	VideoFrameDriver: class {
		readonly canvas = {
			width: 1,
			height: 1,
			getContext: () => ({
				getImageData: () => ({ data: new Uint8ClampedArray([255, 0, 0, 255]) }),
			}),
		};

		$render = render;
	},
}));

import { GIFExporter } from './GIFExporter';

describe('GIFExporter', () => {
	beforeEach(() => {
		render.mockClear();
		vi.stubGlobal('Worker', undefined);
	});

	it('encodes RGBA bytes incrementally and awaits frame preparation', async () => {
		const prepareFrame = vi.fn(async () => undefined);
		const exporter = new GIFExporter({ canvas: { width: 1, height: 1 } } as never, vi.fn() as never);

		const blob = await exporter.$generateGIFBlob({ frameCount: 1, frameRate: 24, prepareFrame });

		expect(blob.type).toBe('image/gif');
		expect(blob.size).toBeGreaterThan(0);
		expect(prepareFrame).toHaveBeenCalledTimes(1);
		expect(render).toHaveBeenCalledTimes(1);
	});
});
