import { describe, expect, it } from 'vitest';
import { ExclusiveCaptureGate } from './ExclusiveCaptureGate';

describe('ExclusiveCaptureGate', () => {
	it('rejects overlap immediately and permits a new owner after release', () => {
		const gate = new ExclusiveCaptureGate();
		const release = gate.acquire();
		expect(() => gate.acquire()).toThrow(expect.objectContaining({ code: 'FRAME_SEQUENCE_BUSY' }) as Error);
		release();
		const releaseAgain = gate.acquire();
		expect(releaseAgain).toBeTypeOf('function');
		releaseAgain();
	});

	it('prevents future acquisition after disposal', () => {
		const gate = new ExclusiveCaptureGate();
		gate.dispose();
		expect(() => gate.acquire()).toThrow(expect.objectContaining({ code: 'FRAME_SEQUENCE_DISPOSED' }) as Error);
	});
});
