import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { VIDEO_EXPORT_BUILD_METADATA } from './buildMetadata';

describe('video build provenance', () => {
	it('identifies the exporter and exact embedded Mediabunny dependency', async () => {
		const packageJson = JSON.parse(await readFile(new URL('../../../package.json', import.meta.url), 'utf8')) as {
			version: string;
			dependencies: { mediabunny: string };
		};
		expect(VIDEO_EXPORT_BUILD_METADATA).toEqual({
			exporterVersion: packageJson.version,
			mediabunnyVersion: packageJson.dependencies.mediabunny,
		});
	});
});
