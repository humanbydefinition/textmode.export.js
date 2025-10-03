import type { VideoExportOptions, VideoExportProgress, VideoRecordingState } from '../../exporters/video';
import { overlayClasses } from '../utils/classes';
import { NumberInput } from '../components/inputs/NumberInput';
import { RangeInput } from '../components/inputs/RangeInput';
import { Field } from '../components/base/Field';
import { Container } from '../components/base/Container';
import { StatusDisplay } from '../components/display/StatusDisplay';
import type { BladeConfig } from './Blade';
import { Blade } from './Blade';

const FRAME_RATE_MIN = 1;
const FRAME_RATE_MAX = 60;
const DEFAULT_FRAME_RATE = 60;
const FRAME_COUNT_MIN = 1;
const FRAME_COUNT_MAX = DEFAULT_FRAME_RATE * 60;
const DEFAULT_FRAME_COUNT = DEFAULT_FRAME_RATE * 8;
const DEFAULT_QUALITY = 0.7;
const QUALITY_MIN = 0;
const QUALITY_MAX = 1;

function describeQualityCategory(level: number): string {
  if (!Number.isFinite(level)) {
    return 'default quality';
  }
  const normalized = Math.max(0, Math.min(1, level));
  if (normalized >= 0.995) {
    return 'near-lossless';
  }
  if (normalized >= 0.98) {
    return 'maximum detail';
  }
  if (normalized >= 0.88) {
    return 'ultra quality';
  }
  if (normalized >= 0.7) {
    return 'high quality';
  }
  if (normalized >= 0.5) {
    return 'balanced';
  }
  if (normalized >= 0.25) {
    return 'compact';
  }
  if (normalized >= 0.1) {
    return 'lightweight';
  }
  return 'draft';
}

function buildQualityLabel(level: number): string {
  const category = describeQualityCategory(level);
  const encoderDisplay = level.toFixed(3);
  return `${category} (quality ≈ ${encoderDisplay})`;
}

export class VideoBlade extends Blade<VideoExportOptions> {
  private frameRateInput = this._manageComponent(
    new NumberInput({
    defaultValue: String(DEFAULT_FRAME_RATE),
    attributes: { min: String(FRAME_RATE_MIN), max: String(FRAME_RATE_MAX), step: '1' },
    formatDisplay: (numericValue) => (Number.isFinite(numericValue) ? `${numericValue} fps` : null),
    }),
  );

  private frameCountInput = this._manageComponent(
    new NumberInput({
    defaultValue: String(DEFAULT_FRAME_COUNT),
    attributes: { min: String(FRAME_COUNT_MIN), max: String(FRAME_COUNT_MAX), step: '1' },
    }),
  );

  private qualityInput = this._manageComponent(
    new RangeInput({
    defaultValue: String(DEFAULT_QUALITY),
    attributes: { min: String(QUALITY_MIN), max: String(QUALITY_MAX), step: '0.001' },
    formatValue: (value) => buildQualityLabel(value),
    }),
  );

  private status = this._manageComponent(
    new StatusDisplay({
    title: 'status',
    message: 'ready to record',
    variant: 'neutral',
    context: 'video',
    }),
  );

  private recordingState: VideoRecordingState = 'idle';

  constructor(config: BladeConfig<VideoExportOptions>) {
    super(config);
  }

  render(): HTMLElement {
    const container = document.createElement('div');
    container.classList.add(overlayClasses.stack);

    const timingRow = new Container('row');
    timingRow.mount(container);

    const frameCountField = new Field({
      label: 'number of frames',
      labelFor: 'textmode-export-video-frame-count',
      variant: 'compact',
    });
    frameCountField.mount(timingRow.root);
    this.frameCountInput.mount(frameCountField.root);
    this.frameCountInput.inputElement.id = 'textmode-export-video-frame-count';

    const frameRateField = new Field({
      label: 'frame rate (fps)',
      labelFor: 'textmode-export-video-frame-rate',
      variant: 'compact',
    });
    frameRateField.mount(timingRow.root);
    this.frameRateInput.mount(frameRateField.root);
    this.frameRateInput.inputElement.id = 'textmode-export-video-frame-rate';

    const qualityField = new Field({
      label: 'quality',
      labelFor: 'textmode-export-video-quality',
      variant: 'full',
    });
    qualityField.mount(container);
    this.qualityInput.mount(qualityField.root);
    this.qualityInput.inputElement.id = 'textmode-export-video-quality';

    this.status.mount(container);

    return container;
  }

  getOptions(): VideoExportOptions {
    const defaults = this._config.defaultOptions ?? {};
    const frameCount = Number.parseInt(this.frameCountInput.value, 10);
    const frameRate = Number.parseFloat(this.frameRateInput.value);
    const quality = Number.parseFloat(this.qualityInput.value);

    return {
      frameCount: Number.isFinite(frameCount) ? frameCount : defaults.frameCount ?? DEFAULT_FRAME_COUNT,
      frameRate: Number.isFinite(frameRate) ? frameRate : defaults.frameRate ?? DEFAULT_FRAME_RATE,
      quality: Number.isFinite(quality) ? quality : defaults.quality ?? DEFAULT_QUALITY,
    };
  }

  reset(): void {
    this.recordingState = 'idle';
    this.applyDefaults();
    this.status.setMessage('ready to record', 'neutral');
  }

  validate(): boolean {
    const frameCount = Number.parseInt(this.frameCountInput.value, 10);
    const frameRate = Number.parseFloat(this.frameRateInput.value);
    return Number.isFinite(frameCount) && frameCount >= FRAME_COUNT_MIN && Number.isFinite(frameRate) && frameRate >= FRAME_RATE_MIN;
  }

  isRecording(): boolean {
    return this.recordingState === 'recording';
  }

  setRecordingState(state: VideoRecordingState, progress?: VideoExportProgress): void {
    this.recordingState = state;
    const disabled = state === 'recording';
    this.frameCountInput.inputElement.disabled = disabled;
    this.frameRateInput.inputElement.disabled = disabled;
    this.qualityInput.inputElement.disabled = disabled;

    this.syncStatus(state, progress);
  }

  handleProgress(progress: VideoExportProgress): void {
    this.syncStatus(progress.state, progress);
  }

  private syncStatus(state: VideoRecordingState | VideoExportProgress['state'], progress?: VideoExportProgress): void {
    switch (state) {
      case 'recording': {
        const frameIndex = progress?.frameIndex ?? 0;
        const total = progress?.totalFrames ?? this.resolvePlannedFrameCount();
        if (total) {
          const bounded = Math.min(Math.max(0, Math.round(frameIndex)), total);
          this.status.setMessage(`recording ${bounded}/${total} frames`, 'active');
        } else {
          this.status.setMessage(`recording ${Math.max(0, Math.round(frameIndex))} frames`, 'active');
        }
        break;
      }
      case 'completed': {
        this.status.setMessage('saved to disk', 'active');
        break;
      }
      case 'error': {
        this.status.setMessage(progress?.message ? `error: ${progress.message}` : 'recording failed', 'alert');
        break;
      }
      default: {
        this.status.setMessage('ready to record', 'neutral');
        break;
      }
    }
  }

  private resolvePlannedFrameCount(): number | undefined {
    const frameCount = Number.parseInt(this.frameCountInput.value, 10);
    return Number.isFinite(frameCount) && frameCount > 0 ? Math.round(frameCount) : undefined;
  }

  private applyDefaults(): void {
    const defaults = this._config.defaultOptions ?? {};
    const frameCount = defaults.frameCount ?? DEFAULT_FRAME_COUNT;
    const frameRate = defaults.frameRate ?? DEFAULT_FRAME_RATE;
    const quality = defaults.quality ?? DEFAULT_QUALITY;

    this.frameCountInput.value = String(frameCount);
    this.frameRateInput.value = String(frameRate);
    this.qualityInput.value = String(quality);

    this.frameCountInput.refresh();
    this.frameRateInput.refresh();
  }
}
