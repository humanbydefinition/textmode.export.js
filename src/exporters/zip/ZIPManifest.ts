import packageJson from '../../../package.json';
import type { ZIPFrameFormat, ZIPFrameSequenceManifest } from './types';

export function createZIPFramePath(rootStem: string, frameIndex: number, extension: string): string {
	return `${rootStem}/frames/frame-${String(frameIndex + 1).padStart(6, '0')}${extension}`;
}

export function createZIPManifest(options: {
	createdAt: Date;
	format: ZIPFrameFormat;
	frameCount: number;
	frameRate: number;
	extension: string;
}): ZIPFrameSequenceManifest {
	return {
		schema: 'textmode.frame-sequence',
		schemaVersion: '1.0.0',
		generator: { name: 'textmode.export.js', version: packageJson.version },
		createdAt: options.createdAt.toISOString(),
		format: options.format,
		frameCount: options.frameCount,
		frameRate: options.frameRate,
		indexBase: 1,
		filePattern: `frames/frame-%06d${options.extension}`,
	};
}

export function encodeZIPManifest(manifest: ZIPFrameSequenceManifest): Uint8Array {
	return new TextEncoder().encode(`${JSON.stringify(manifest, null, 2)}\n`);
}
