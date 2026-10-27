// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest';
import { FileHandler } from './FileHandler';

describe('FileHandler', () => {
	afterEach(() => {
		vi.restoreAllMocks();
		vi.useRealTimers();
	});

	it('propagates download setup failures', () => {
		vi.spyOn(URL, 'createObjectURL').mockImplementation(() => {
			throw new Error('object URL unavailable');
		});
		expect(() => new FileHandler().$downloadFile(new Blob(), 'frame', '.png')).toThrow('object URL unavailable');
	});

	it('removes the anchor and defers object URL revocation after clicking', async () => {
		vi.useFakeTimers();
		vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test');
		const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
		const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);

		new FileHandler().$downloadFile(new Blob(), 'frame', '.png');

		expect(click).toHaveBeenCalledTimes(1);
		expect(document.querySelector('a[download="frame.png"]')).toBeNull();
		expect(revoke).not.toHaveBeenCalled();
		await vi.runAllTimersAsync();
		expect(revoke).toHaveBeenCalledWith('blob:test');
	});
});
