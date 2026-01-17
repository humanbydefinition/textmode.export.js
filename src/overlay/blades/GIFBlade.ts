import type { GIFExportOptions, GIFExportProgress, GIFRecordingState } from '../../exporters/gif';
import { overlayClasses } from '../utils/classes';
import { NumberInput } from '../components/inputs/NumberInput';
import { Field } from '../components/base/Field';
import { Container } from '../components/base/Container';
import { StatusDisplay } from '../components/display/StatusDisplay';
import type { BladeConfig } from './Blade';
import { Blade } from './Blade';

const FALLBACK_DEFAULTS = {
  frameCount: 300,
  frameRate: 60,
  scale: 1,
  repeat: 0,
} as const;

export class GIFBlade extends Blade<GIFExportOptions> {
  private frameCountInput = this._manageComponent(
    new NumberInput({
    defaultValue: String(FALLBACK_DEFAULTS.frameCount),
    attributes: { min: '1', max: '600', step: '1' },
    }),
  );

  private frameRateInput = this._manageComponent(
    new NumberInput({
    defaultValue: String(FALLBACK_DEFAULTS.frameRate),
    attributes: { min: '1', max: '60', step: '1' },
    }),
  );

  private scaleInput = this._manageComponent(
    new NumberInput({
    defaultValue: String(FALLBACK_DEFAULTS.scale),
    attributes: { min: '0.1', max: '8', step: '0.1' },
    }),
  );

  private repeatInput = this._manageComponent(
    new NumberInput({
    defaultValue: '0',
    attributes: { min: '0', max: '50', step: '1' },
    formatDisplay: (numericValue, rawValue) => {
      if (!Number.isFinite(numericValue)) {
        return rawValue.trim() === '' ? null : rawValue;
      }
      return numericValue === 0 ? '∞' : null;
    },
    }),
  );

  private status = this._manageComponent(
    new StatusDisplay({
    title: 'status',
    message: 'ready to record',
    variant: 'neutral',
    context: 'gif',
    }),
  );

  private recordingState: GIFRecordingState = 'idle';

  constructor(config: BladeConfig<GIFExportOptions>) {
    super(config);
  }

  render(): HTMLElement {
    const container = document.createElement('div');
    container.classList.add(overlayClasses.stack);

    const frameRow = new Container('row');
    frameRow.mount(container);

    const frameCountField = new Field({
      label: 'number of frames',
      labelFor: 'textmode-export-gif-frame-count',
      variant: 'dense',
    });
    frameCountField.mount(frameRow.root);
    this.frameCountInput.mount(frameCountField.root);
    this.frameCountInput.inputElement.id = 'textmode-export-gif-frame-count';

    const frameRateField = new Field({
      label: 'frame rate (fps)',
      labelFor: 'textmode-export-gif-frame-rate',
      variant: 'dense',
    });
    frameRateField.mount(frameRow.root);
    this.frameRateInput.mount(frameRateField.root);
    this.frameRateInput.inputElement.id = 'textmode-export-gif-frame-rate';

    const playbackRow = new Container('row');
    playbackRow.mount(container);

    const scaleField = new Field({
      label: 'scale',
      labelFor: 'textmode-export-gif-scale',
      variant: 'dense',
    });
    scaleField.mount(playbackRow.root);
    this.scaleInput.mount(scaleField.root);
    this.scaleInput.inputElement.id = 'textmode-export-gif-scale';

    const repeatField = new Field({
      label: 'loop count',
      labelFor: 'textmode-export-gif-repeat',
      variant: 'dense',
    });
    repeatField.mount(playbackRow.root);
    this.repeatInput.mount(repeatField.root);
    this.repeatInput.inputElement.id = 'textmode-export-gif-repeat';

    this.status.mount(container);

    return container;
  }

  getOptions(): GIFExportOptions {
    const defaults = this._config.defaultOptions ?? {};
    return {
      frameCount: this.safeParseInt(this.frameCountInput.value, defaults.frameCount ?? 300),
      frameRate: this.safeParseInt(this.frameRateInput.value, defaults.frameRate ?? 60),
      scale: this.safeParseFloat(this.scaleInput.value, defaults.scale ?? 1),
      repeat: this.safeParseInt(this.repeatInput.value, defaults.repeat ?? 0),
    };
  }

  reset(): void {
    this.recordingState = 'idle';
    this.applyDefaults();
    this.setRecordingState('idle');
  }

  validate(): boolean {
    const parsedFrameCount = Number.parseInt(this.frameCountInput.value, 10);
    const parsedFrameRate = Number.parseInt(this.frameRateInput.value, 10);
    const parsedScale = Number.parseFloat(this.scaleInput.value);
    return (
      Number.isFinite(parsedFrameCount) && parsedFrameCount > 0 &&
      Number.isFinite(parsedFrameRate) && parsedFrameRate > 0 &&
      Number.isFinite(parsedScale) && parsedScale > 0
    );
  }

  isRecording(): boolean {
    return this.recordingState === 'recording' || this.recordingState === 'encoding';
  }

  setRecordingState(state: GIFRecordingState, progress?: GIFExportProgress): void {
    this.recordingState = state;
    const disabled = state === 'recording' || state === 'encoding';
    this.frameCountInput.inputElement.disabled = disabled;
    this.frameRateInput.inputElement.disabled = disabled;
    this.scaleInput.inputElement.disabled = disabled;
    this.repeatInput.inputElement.disabled = disabled;

    switch (state) {
      case 'recording': {
        if (progress?.totalFrames) {
          const current = progress.frameIndex ?? 0;
          this.status.setMessage(`recording ${current}/${progress.totalFrames}`, 'active');
        } else {
          this.status.setMessage('recording…', 'active');
        }
        break;
      }
      case 'encoding': {
        if (progress?.totalFrames) {
          const current = progress.frameIndex ?? 0;
          this.status.setMessage(`encoding ${current}/${progress.totalFrames}`, 'active');
        } else {
          this.status.setMessage('encoding…', 'active');
        }
        break;
      }
      case 'completed': {
        this.status.setMessage('GIF saved successfully', 'active');
        break;
      }
      case 'error': {
        this.status.setMessage(progress?.message ?? 'failed to export GIF', 'alert');
        break;
      }
      default: {
        this.status.setMessage('ready to record', 'neutral');
        break;
      }
    }
  }

  handleProgress(progress: GIFExportProgress): void {
    if ((progress.state === 'recording' || progress.state === 'encoding') && progress.totalFrames) {
      const action = progress.state === 'recording' ? 'recording' : 'encoding';
      this.status.setMessage(`${action} ${progress.frameIndex ?? 0}/${progress.totalFrames}`, 'active');
    } else if (progress.state === 'completed') {
      this.status.setMessage('GIF saved successfully', 'active');
    } else if (progress.state === 'error') {
      this.status.setMessage(progress.message ?? 'failed to export GIF', 'alert');
    }
  }

  private applyDefaults(): void {
    const defaults = this._config.defaultOptions ?? {};
    const frameCount = defaults.frameCount ?? FALLBACK_DEFAULTS.frameCount;
    const frameRate = defaults.frameRate ?? FALLBACK_DEFAULTS.frameRate;
    const scale = defaults.scale ?? FALLBACK_DEFAULTS.scale;
    const repeat = defaults.repeat ?? FALLBACK_DEFAULTS.repeat;

    this.frameCountInput.value = String(frameCount);
    this.frameRateInput.value = String(frameRate);
    this.scaleInput.value = String(scale);
    this.repeatInput.value = String(repeat);

    this.frameCountInput.refresh();
    this.frameRateInput.refresh();
    this.scaleInput.refresh();
    this.repeatInput.refresh();
  }

  private safeParseInt(value: string, fallback: number): number {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  private safeParseFloat(value: string, fallback: number): number {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
}
