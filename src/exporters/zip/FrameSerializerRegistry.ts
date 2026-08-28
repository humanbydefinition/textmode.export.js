import type { Textmodifier } from 'textmode.js';
import { ImageExporter, type ImageExportOptions } from '../image';
import { JSONExporter, type JSONExportOptions } from '../json';
import { SVGExporter, type SVGExportOptions } from '../svg';
import { TXTExporter, type TXTExportOptions } from '../txt';
import type { ZIPFrameFormat, ZIPFrameSerializer } from './types';

const textEncoder = new TextEncoder();

function sanitizedOptions(options: unknown): Record<string, unknown> {
	if (!options || typeof options !== 'object' || Array.isArray(options)) return {};
	const clean = { ...(options as Record<string, unknown>) };
	delete clean.filename;
	delete clean.format;
	return clean;
}

function rasterSerializer(format: 'png' | 'jpg' | 'webp'): ZIPFrameSerializer {
	return {
		extension: `.${format}`,
		compression: 'store',
		async serialize({ canvas, frameOptions }) {
			const blob = await new ImageExporter().$toImageBlob(canvas, {
				...sanitizedOptions(frameOptions),
				format,
			} as ImageExportOptions);
			return new Uint8Array(await blob.arrayBuffer());
		},
	};
}

function textSerializer(format: 'svg' | 'json' | 'txt', textmodifier: Textmodifier): ZIPFrameSerializer {
	return {
		extension: `.${format}`,
		compression: 'deflate',
		async serialize({ frameOptions }) {
			const clean = sanitizedOptions(frameOptions);
			let output: string;
			if (format === 'svg') output = new SVGExporter().$generateSVG(textmodifier, clean as SVGExportOptions);
			else if (format === 'json') {
				output = new JSONExporter().$generateJSONString(textmodifier, clean as JSONExportOptions);
			} else output = new TXTExporter().$generateTXT(textmodifier, clean as TXTExportOptions);
			return textEncoder.encode(output);
		},
	};
}

/** Resolves the thin adapter for one supported ZIP frame format. */
export function createZIPFrameSerializerRegistry(
	textmodifier: Textmodifier
): Record<ZIPFrameFormat, ZIPFrameSerializer> {
	return {
		png: rasterSerializer('png'),
		jpg: rasterSerializer('jpg'),
		webp: rasterSerializer('webp'),
		svg: textSerializer('svg', textmodifier),
		json: textSerializer('json', textmodifier),
		txt: textSerializer('txt', textmodifier),
	} satisfies Record<ZIPFrameFormat, ZIPFrameSerializer>;
}
