const VIDEO_TIMEBASE = 1_000_000;

export interface VideoFrameTiming {
	startSeconds: number;
	centerSeconds: number;
	endSeconds: number;
	durationSeconds: number;
}

/** Produces one stable microsecond-rounded interval for an output frame. */
export function videoFrameTiming(frameIndex: number, frameRate: number): VideoFrameTiming {
	const startMicros = Math.round((frameIndex * VIDEO_TIMEBASE) / frameRate);
	const endMicros = Math.max(startMicros + 1, Math.round(((frameIndex + 1) * VIDEO_TIMEBASE) / frameRate));
	return {
		startSeconds: startMicros / VIDEO_TIMEBASE,
		centerSeconds: (startMicros + Math.floor((endMicros - startMicros) / 2)) / VIDEO_TIMEBASE,
		endSeconds: endMicros / VIDEO_TIMEBASE,
		durationSeconds: (endMicros - startMicros) / VIDEO_TIMEBASE,
	};
}
