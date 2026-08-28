import { strFromU8, unzipSync } from 'fflate';
import { describe, expect, it } from 'vitest';
import { ZIPArchiveWriter } from './ZIPArchiveWriter';

function localCompressionMethods(bytes: Uint8Array): Map<string, number> {
	const methods = new Map<string, number>();
	const decoder = new TextDecoder();
	const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
	for (let offset = 0; offset <= bytes.length - 30; offset++) {
		if (view.getUint32(offset, true) !== 0x04034b50) continue;
		const nameLength = view.getUint16(offset + 26, true);
		const extraLength = view.getUint16(offset + 28, true);
		const nameStart = offset + 30;
		const name = decoder.decode(bytes.subarray(nameStart, nameStart + nameLength));
		methods.set(name, view.getUint16(offset + 8, true));
		offset = nameStart + nameLength + extraLength - 1;
	}
	return methods;
}

describe('ZIPArchiveWriter', () => {
	it('creates an extractable ZIP with ordered stored and deflated entries', async () => {
		const writer = new ZIPArchiveWriter(new Date('2026-08-28T12:00:00.000Z'));
		await writer.$addEntry('orbit/manifest.json', new TextEncoder().encode('{"ok":true}'), 'deflate');
		await writer.$addEntry('orbit/frames/frame-000001.png', new Uint8Array([137, 80, 78, 71]), 'store');
		const blob = await writer.$finalize();
		const bytes = new Uint8Array(await blob.arrayBuffer());
		const extracted = unzipSync(bytes);

		expect(blob.type).toBe('application/zip');
		expect(Object.keys(extracted)).toEqual(['orbit/manifest.json', 'orbit/frames/frame-000001.png']);
		expect(strFromU8(extracted['orbit/manifest.json']!)).toBe('{"ok":true}');
		expect(localCompressionMethods(bytes)).toEqual(
			new Map([
				['orbit/manifest.json', 8],
				['orbit/frames/frame-000001.png', 0],
			])
		);
	});

	it('rejects duplicate and unsafe entry paths', async () => {
		const writer = new ZIPArchiveWriter(new Date());
		await writer.$addEntry('safe/file.txt', new Uint8Array(), 'deflate');
		await expect(writer.$addEntry('safe/file.txt', new Uint8Array(), 'deflate')).rejects.toThrow('Duplicate');
		const unsafeWriter = new ZIPArchiveWriter(new Date());
		await expect(unsafeWriter.$addEntry('../escape.txt', new Uint8Array(), 'store')).rejects.toThrow('Unsafe');
	});

	it('prevents use after abort', async () => {
		const writer = new ZIPArchiveWriter(new Date());
		writer.$abort();
		await expect(writer.$addEntry('safe/file.txt', new Uint8Array(), 'store')).rejects.toThrow('failed');
		expect(() => writer.$finalize()).toThrow('failed');
	});
});
