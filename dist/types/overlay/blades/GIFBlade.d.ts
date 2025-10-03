import type { GIFExportOptions, GIFExportProgress, GIFRecordingState } from '../../exporters/gif';
import type { BladeConfig } from './Blade';
import { Blade } from './Blade';
export declare class GIFBlade extends Blade<GIFExportOptions> {
    private frameCountInput;
    private frameRateInput;
    private scaleInput;
    private repeatInput;
    private status;
    private recordingState;
    constructor(config: BladeConfig<GIFExportOptions>);
    render(): HTMLElement;
    getOptions(): GIFExportOptions;
    reset(): void;
    validate(): boolean;
    isRecording(): boolean;
    setRecordingState(state: GIFRecordingState, progress?: GIFExportProgress): void;
    handleProgress(progress: GIFExportProgress): void;
    private applyDefaults;
    private safeParseInt;
    private safeParseFloat;
}
//# sourceMappingURL=GIFBlade.d.ts.map