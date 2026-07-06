import { Blade } from './Blade';

export interface RecordingBladeLike {
	isRecording(): boolean;
	setRecordingState(state: string, progress?: unknown): void;
	handleProgress(progress: unknown): void;
}

export function isRecordingBlade(blade: Blade<unknown>): blade is Blade<unknown> & RecordingBladeLike {
	return blade.capabilities.recording;
}
