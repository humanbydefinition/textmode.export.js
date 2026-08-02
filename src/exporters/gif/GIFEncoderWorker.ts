import { applyPalette, GIFEncoder, quantize, type GIFPalette } from 'gifenc';

interface WorkerRequest {
	id: number;
	type: 'init' | 'frame' | 'finish';
	buffer?: ArrayBuffer;
	width?: number;
	height?: number;
	delay?: number;
	repeat?: number;
	frameIndex?: number;
}

const encoder = GIFEncoder();
let width = 1;
let height = 1;
let delay = 16;
let repeat = 0;
const workerScope = self as unknown as {
	addEventListener(type: 'message', listener: (event: MessageEvent<WorkerRequest>) => void): void;
	postMessage(message: unknown, transfer?: Transferable[]): void;
};

workerScope.addEventListener('message', (event: MessageEvent<WorkerRequest>) => {
	const request = event.data;

	try {
		if (request.type === 'init') {
			width = request.width ?? width;
			height = request.height ?? height;
			delay = request.delay ?? delay;
			repeat = request.repeat ?? repeat;
			workerScope.postMessage({ id: request.id, type: 'ready' });
			return;
		}

		if (request.type === 'frame' && request.buffer) {
			const rgba = new Uint8ClampedArray(request.buffer);
			const palette: GIFPalette = quantize(rgba, 256, {});
			const indexedPixels = applyPalette(rgba, palette);
			encoder.writeFrame(indexedPixels, width, height, {
				palette,
				delay,
				repeat: request.frameIndex === 0 ? repeat : -1,
			});
			workerScope.postMessage({ id: request.id, type: 'frame-complete' });
			return;
		}

		if (request.type === 'finish') {
			encoder.finish();
			const bytes = encoder.bytes();
			const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
			workerScope.postMessage({ id: request.id, type: 'complete', buffer }, [buffer]);
		}
	} catch (error) {
		workerScope.postMessage({
			id: request.id,
			type: 'error',
			message: error instanceof Error ? error.message : 'GIF worker failed',
		});
	}
});
