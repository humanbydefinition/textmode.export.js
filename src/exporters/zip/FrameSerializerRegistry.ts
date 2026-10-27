import type { Textmodifier } from 'textmode.js';
import { resolveLayerExportTarget, type LayerExportOptions } from '../base';
import { IMAGE_MIME_TYPES, ImageExporter, type ImageExportOptions } from '../image';
import { JSONExporter, type JSONExportOptions } from '../json';
import { SVGExporter, type SVGExportOptions } from '../svg';
import { TXTExporter, type TXTExportOptions } from '../txt';
import type { ZIPFrameFormat, ZIPFrameSerializer } from './types';
import { ZIPExportError } from './errors';

const textEncoder = new TextEncoder();

function sanitizedOptions(options: unknown): Record<string, unknown> {
	if (!options || typeof options !== 'object' || Array.isArray(options)) return {};
	const clean = { ...(options as Record<string, unknown>) };
	delete clean.filename;
	delete clean.format;
	return clean;
}

function rasterSerializer(format: 'png' | 'jpg' | 'webp'): ZIPFrameSerializer {
	const exporter = new ImageExporter();
	return {
		extension: `.${format}`,
		compression: 'store',
		getDimensions({ canvas, frameOptions }) {
			const clean = sanitizedOptions(frameOptions) as ImageExportOptions;
			const scale = Math.abs(clean.scale ?? 1);
			return {
				width: Math.round(canvas.width * scale),
				height: Math.round(canvas.height * scale),
			};
		},
		async serialize({ canvas, frameOptions }) {
			const blob = await exporter.$toImageBlob(canvas, {
				...sanitizedOptions(frameOptions),
				format,
			} as ImageExportOptions);
			const expectedType = IMAGE_MIME_TYPES[format];
			if (blob.type.toLowerCase() !== expectedType) {
				throw new ZIPExportError(
					'ZIP_EXPORT_ENCODING_UNSUPPORTED',
					`The browser returned '${blob.type || 'an unknown format'}' instead of '${expectedType}'.`
				);
			}
			return new Uint8Array(await blob.arrayBuffer());
		},
	};
}

function textSerializer(format: 'svg' | 'json' | 'txt', textmodifier: Textmodifier): ZIPFrameSerializer {
	return {
		extension: `.${format}`,
		compression: 'deflate',
		getDimensions({ frameOptions }) {
			const clean = sanitizedOptions(frameOptions);
			const target =
				format === 'json' && clean.target === 'all'
					? resolveLayerExportTarget(textmodifier)
					: resolveLayerExportTarget(textmodifier, clean.layer as LayerExportOptions['layer']);
			return { width: target.grid.width, height: target.grid.height };
		},
		async serialize({ frameOptions, createdAt }) {
			const clean = sanitizedOptions(frameOptions);
			let output: string;
			if (format === 'svg') output = new SVGExporter().$generateSVG(textmodifier, clean as SVGExportOptions);
			else if (format === 'json') {
				output = new JSONExporter().$generateJSONString(textmodifier, clean as JSONExportOptions, createdAt);
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
