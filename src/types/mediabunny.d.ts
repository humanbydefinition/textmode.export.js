declare module 'mediabunny' {
	export type VideoCodec = 'vp8' | 'vp9' | 'avc' | (string & {});

	export type EncodableVideoCodecSearchOptions = {
		width?: number;
		height?: number;
		bitrate?: number;
	};

	export type CanvasSourceOptions = {
		codec: VideoCodec;
		bitrate?: number;
		alpha?: 'keep' | 'discard';
		bitrateMode?: 'variable' | 'constant';
		latencyMode?: 'quality' | 'realtime';
		hardwareAcceleration?: 'no-preference' | 'prefer-hardware' | 'prefer-software';
		keyFrameInterval?: number;
		sizeChangeBehavior?: 'deny' | 'pass-through' | 'fill';
	};

	export class BufferTarget {
		buffer: ArrayBuffer | null;
	}

	export class WebMOutputFormat {
		readonly mimeType: string;
		getSupportedVideoCodecs(): VideoCodec[];
	}

	export class Mp4OutputFormat {
		readonly mimeType: string;
		getSupportedVideoCodecs(): VideoCodec[];
	}

	export class CanvasSource {
		constructor(canvas: HTMLCanvasElement | OffscreenCanvas, options: CanvasSourceOptions);
		add(timestamp: number, duration?: number): Promise<void>;
	}

	export class Output {
		constructor(options: { format: WebMOutputFormat | Mp4OutputFormat; target: BufferTarget });
		addVideoTrack(source: CanvasSource): void;
		start(): Promise<void>;
		finalize(): Promise<void>;
	}

	export function getFirstEncodableVideoCodec(
		codecs: readonly VideoCodec[],
		options?: EncodableVideoCodecSearchOptions
	): Promise<VideoCodec | null>;
}
