// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest';
import { ImageExporter } from '../image';
import { JSONExporter } from '../json';
import { SVGExporter } from '../svg';
import { TXTExporter } from '../txt';
import { createZIPFrameSerializerRegistry } from './FrameSerializerRegistry';

describe('ZIP frame serializer registry', () => {
	afterEach(() => vi.restoreAllMocks());

	it('exhaustively maps formats to canonical extensions and compression', () => {
		const registry = createZIPFrameSerializerRegistry({} as never);
		expect(Object.keys(registry)).toEqual(['png', 'jpg', 'webp', 'svg', 'json', 'txt']);
		expect(Object.values(registry).map(({ extension, compression }) => [extension, compression])).toEqual([
			['.png', 'store'],
			['.jpg', 'store'],
			['.webp', 'store'],
			['.svg', 'deflate'],
			['.json', 'deflate'],
			['.txt', 'deflate'],
		]);
	});

	it('forces raster format and strips untrusted filename and format fields', async () => {
		const toBlob = vi
			.spyOn(ImageExporter.prototype, '$toImageBlob')
			.mockResolvedValue(new Blob([new Uint8Array([1, 2, 3])], { type: 'image/png' }));
		const canvas = document.createElement('canvas');
		const bytes = await createZIPFrameSerializerRegistry({} as never).png.serialize({
			canvas,
			frameOptions: { scale: 2, filename: '../escape', format: 'webp' },
		});

		expect(toBlob).toHaveBeenCalledWith(canvas, { scale: 2, format: 'png' });
		expect(bytes).toEqual(new Uint8Array([1, 2, 3]));
	});

	it('forwards complete text-format controls and encodes UTF-8 without a BOM', async () => {
		const textmodifier = {} as never;
		vi.spyOn(SVGExporter.prototype, '$generateSVG').mockReturnValue('<svg>✓</svg>');
		vi.spyOn(JSONExporter.prototype, '$generateJSONString').mockReturnValue('{"frame":1}');
		const txt = vi.spyOn(TXTExporter.prototype, '$generateTXT').mockReturnValue('A B');
		const registry = createZIPFrameSerializerRegistry(textmodifier);

		const svg = await registry.svg.serialize({ canvas: document.createElement('canvas'), frameOptions: {} });
		const json = await registry.json.serialize({ canvas: document.createElement('canvas'), frameOptions: {} });
		const text = await registry.txt.serialize({
			canvas: document.createElement('canvas'),
			frameOptions: { preserveTrailingSpaces: true, emptyCharacter: '.', filename: 'ignored' },
		});

		expect(new TextDecoder().decode(svg)).toBe('<svg>✓</svg>');
		expect(new TextDecoder().decode(json)).toBe('{"frame":1}');
		expect(new TextDecoder().decode(text)).toBe('A B');
		expect(txt).toHaveBeenCalledWith(textmodifier, { preserveTrailingSpaces: true, emptyCharacter: '.' });
	});
});
