import { describe, expect, it } from 'vitest';
import { FilenamePolicy } from './FilenamePolicy';

describe('FilenamePolicy', () => {
	const createdAt = new Date('2026-08-28T12:34:56.000Z');

	it('adds one canonical extension and sanitizes unsafe path input', () => {
		const policy = new FilenamePolicy();
		expect(policy.$resolve('  ../orbit\\frames:01.ZIP  ', '.zip', createdAt)).toBe('orbit_frames_01.zip');
		expect(policy.$resolve('capture.webp', '.webp', createdAt)).toBe('capture.webp');
		expect(policy.$resolve('capture.jpg', '.png', createdAt)).toBe('capture.jpg.png');
	});

	it('normalizes Unicode and caps output by UTF-8 byte length', () => {
		const policy = new FilenamePolicy();
		expect(policy.$sanitizeStem('Cafe\u0301', createdAt)).toBe('Café');
		const filename = policy.$resolve('😀'.repeat(100), '.png', createdAt);
		expect(new TextEncoder().encode(filename).byteLength).toBeLessThanOrEqual(255);
		expect(filename.endsWith('.png')).toBe(true);
	});

	it('uses one stable timestamped fallback stem', () => {
		const policy = new FilenamePolicy();
		expect(policy.$resolve('   ', '.txt', createdAt)).toBe('textmode-export-2026-08-28T12-34-56.txt');
	});
});
