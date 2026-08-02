/** Context supplied before a deterministic export frame is rendered. */
export interface ExportFrameContext {
	frameIndex: number;
	frameCount: number;
	timeSeconds: number;
	frameRate: number;
	signal?: AbortSignal;
}

/** Prepares external media or state before an export frame is redrawn. */
export type PrepareExportFrame = (context: ExportFrameContext) => void | Promise<void>;
