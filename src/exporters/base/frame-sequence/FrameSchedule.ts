const FRAME_TIMEBASE = 1_000_000;

export interface FrameTiming {
	startSeconds: number;
	centerSeconds: number;
	endSeconds: number;
	durationSeconds: number;
}

/** Produces one stable microsecond-rounded interval for an output frame. */
export function frameTiming(frameIndex: number, frameRate: number): FrameTiming {
	const startMicros = Math.round((frameIndex * FRAME_TIMEBASE) / frameRate);
	const endMicros = Math.max(startMicros + 1, Math.round(((frameIndex + 1) * FRAME_TIMEBASE) / frameRate));
	return {
		startSeconds: startMicros / FRAME_TIMEBASE,
		centerSeconds: (startMicros + Math.floor((endMicros - startMicros) / 2)) / FRAME_TIMEBASE,
		endSeconds: endMicros / FRAME_TIMEBASE,
		durationSeconds: (endMicros - startMicros) / FRAME_TIMEBASE,
	};
}
