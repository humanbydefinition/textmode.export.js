/** Context supplied before a deterministic export frame is rendered. */
export interface ExportFrameContext {
	frameIndex: number;
	frameCount: number;
	/** Left edge of the output-frame interval. Alias of `timeSeconds`. */
	startSeconds: number;
	/** Center of the output-frame interval; use this to sample external media. */
	centerSeconds: number;
	/** Exclusive right edge of the output-frame interval. */
	endSeconds: number;
	/** @deprecated Use `startSeconds`. */
	timeSeconds: number;
	frameRate: number;
	signal?: AbortSignal;
}

/** Prepares external media or state before an export frame is redrawn. */
export type PrepareExportFrame = (context: ExportFrameContext) => void | Promise<void>;
