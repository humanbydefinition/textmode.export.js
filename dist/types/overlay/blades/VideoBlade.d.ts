import type { VideoExportOptions, VideoExportProgress, VideoRecordingState } from '../../exporters/video';
import type { BladeConfig } from './Blade';
import { Blade } from './Blade';
export declare class VideoBlade extends Blade<VideoExportOptions> {
    private frameRateInput;
    private frameCountInput;
    private qualityInput;
    private status;
    private recordingState;
    constructor(config: BladeConfig<VideoExportOptions>);
    render(): HTMLElement;
    getOptions(): VideoExportOptions;
    reset(): void;
    validate(): boolean;
    isRecording(): boolean;
    setRecordingState(state: VideoRecordingState, progress?: VideoExportProgress): void;
    handleProgress(progress: VideoExportProgress): void;
    private syncStatus;
    private resolvePlannedFrameCount;
    private applyDefaults;
}
//# sourceMappingURL=VideoBlade.d.ts.map