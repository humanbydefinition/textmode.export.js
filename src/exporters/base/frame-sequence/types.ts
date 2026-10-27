import type { PrepareExportFrame } from '../FramePreparation';

export type PostDrawSubscription = (callback: () => void) => () => void;

export interface FrameSequenceStagingSurface {
	width: number;
	height: number;
}

export interface FrameSequenceRenderOptions {
	frameCount: number;
	frameRate: number;
	signal?: AbortSignal;
	prepareFrame?: PrepareExportFrame;
	onFrame(frame: { frameIndex: number; canvas: HTMLCanvasElement }): Promise<void> | void;
}

export interface FrameSequenceDriverLike {
	readonly canvas: HTMLCanvasElement;
	$render(options: FrameSequenceRenderOptions): Promise<void>;
}
