import type {
	VideoBitrateMode,
	VideoBitratePreset,
	VideoExportFormat,
	VideoExportOptions,
	VideoExportProgress,
	VideoHardwareAcceleration,
	VideoLatencyMode,
	VideoRecordingState,
} from '../../exporters/video';
import { overlayClasses } from '../utils/classes';
import { NumberInput } from '../components/inputs/NumberInput';
import { SelectInput } from '../components/inputs/SelectInput';
import { CheckboxInput } from '../components/inputs/CheckboxInput';
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
const DEFAULT_VIDEO_FORMAT: VideoExportFormat = 'mp4';
const DEFAULT_BITRATE: VideoBitratePreset = 'medium';
const DEFAULT_BITRATE_MODE: VideoBitrateMode = 'variable';
const DEFAULT_LATENCY_MODE: VideoLatencyMode = 'quality';
const DEFAULT_HARDWARE_ACCELERATION: VideoHardwareAcceleration = 'no-preference';
const DEFAULT_KEYFRAME_INTERVAL = 2;

export class VideoBlade extends Blade<VideoExportOptions> {
	private formatSelect = this._manageComponent(
		new SelectInput<VideoExportFormat>({
			id: 'textmode-export-video-format',
			options: [
				{ value: 'mp4', label: 'MP4/H.264 (.mp4)' },
				{ value: 'webm', label: 'WebM (.webm)' },
			],
			defaultValue: DEFAULT_VIDEO_FORMAT,
		})
	);

	private bitrateSelect = this._manageComponent(
		new SelectInput<VideoBitratePreset>({
			id: 'textmode-export-video-bitrate',
			options: [
				{ value: 'low', label: 'low' },
				{ value: 'medium', label: 'medium' },
				{ value: 'high', label: 'high' },
			],
			defaultValue: DEFAULT_BITRATE,
		})
	);

	private frameRateInput = this._manageComponent(
		new NumberInput({
			defaultValue: String(DEFAULT_FRAME_RATE),
			attributes: { min: String(FRAME_RATE_MIN), max: String(FRAME_RATE_MAX), step: '1' },
			formatDisplay: (numericValue) => (Number.isFinite(numericValue) ? `${numericValue} fps` : null),
		})
	);

	private frameCountInput = this._manageComponent(
		new NumberInput({
			defaultValue: String(DEFAULT_FRAME_COUNT),
			attributes: { min: String(FRAME_COUNT_MIN), max: String(FRAME_COUNT_MAX), step: '1' },
		})
	);

	private bitrateModeSelect = this._manageComponent(
		new SelectInput<VideoBitrateMode>({
			id: 'textmode-export-video-bitrate-mode',
			options: [
				{ value: 'variable', label: 'variable' },
				{ value: 'constant', label: 'constant' },
			],
			defaultValue: DEFAULT_BITRATE_MODE,
		})
	);

	private latencyModeSelect = this._manageComponent(
		new SelectInput<VideoLatencyMode>({
			id: 'textmode-export-video-latency-mode',
			options: [
				{ value: 'quality', label: 'quality' },
				{ value: 'realtime', label: 'realtime' },
			],
			defaultValue: DEFAULT_LATENCY_MODE,
		})
	);

	private hardwareAccelerationSelect = this._manageComponent(
		new SelectInput<VideoHardwareAcceleration>({
			id: 'textmode-export-video-hardware-acceleration',
			options: [
				{ value: 'no-preference', label: 'no preference' },
				{ value: 'prefer-hardware', label: 'prefer hardware' },
				{ value: 'prefer-software', label: 'prefer software' },
			],
			defaultValue: DEFAULT_HARDWARE_ACCELERATION,
		})
	);

	private keyFrameIntervalInput = this._manageComponent(
		new NumberInput({
			defaultValue: String(DEFAULT_KEYFRAME_INTERVAL),
			attributes: { min: '0', step: '0.25' },
			formatDisplay: (numericValue) => (Number.isFinite(numericValue) ? `${numericValue}s` : null),
		})
	);

	private transparencyInput = this._manageComponent(
		new CheckboxInput({
			id: 'textmode-export-video-transparent',
			label: 'preserve transparency',
			defaultChecked: false,
		})
	);

	private status = this._manageComponent(
		new StatusDisplay({
			title: 'status',
			message: 'ready to record',
			variant: 'neutral',
			context: 'video',
		})
	);

	private recordingState: VideoRecordingState = 'idle';

	constructor(config: BladeConfig<VideoExportOptions>) {
		super(config);
	}

	render(): HTMLElement {
		const container = document.createElement('div');
		container.classList.add(overlayClasses.stack);

		const formatRow = new Container('row');
		formatRow.mount(container);

		const formatField = new Field({
			label: 'video format',
			labelFor: 'textmode-export-video-format',
			variant: 'compact',
		});
		formatField.mount(formatRow.root);
		this.formatSelect.mount(formatField.root);

		const bitrateField = new Field({
			label: 'bitrate preset',
			labelFor: 'textmode-export-video-bitrate',
			variant: 'compact',
		});
		bitrateField.mount(formatRow.root);
		this.bitrateSelect.mount(bitrateField.root);

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

		const encoderRow = new Container('row');
		encoderRow.mount(container);

		const bitrateModeField = new Field({
			label: 'bitrate mode',
			labelFor: 'textmode-export-video-bitrate-mode',
			variant: 'compact',
		});
		bitrateModeField.mount(encoderRow.root);
		this.bitrateModeSelect.mount(bitrateModeField.root);

		const latencyModeField = new Field({
			label: 'encoder mode',
			labelFor: 'textmode-export-video-latency-mode',
			variant: 'compact',
		});
		latencyModeField.mount(encoderRow.root);
		this.latencyModeSelect.mount(latencyModeField.root);

		const hardwareRow = new Container('row');
		hardwareRow.mount(container);

		const hardwareAccelerationField = new Field({
			label: 'hardware',
			labelFor: 'textmode-export-video-hardware-acceleration',
			variant: 'compact',
		});
		hardwareAccelerationField.mount(hardwareRow.root);
		this.hardwareAccelerationSelect.mount(hardwareAccelerationField.root);

		const keyFrameIntervalField = new Field({
			label: 'keyframe interval',
			labelFor: 'textmode-export-video-keyframe-interval',
			variant: 'compact',
		});
		keyFrameIntervalField.mount(hardwareRow.root);
		this.keyFrameIntervalInput.mount(keyFrameIntervalField.root);
		this.keyFrameIntervalInput.inputElement.id = 'textmode-export-video-keyframe-interval';

		this.transparencyInput.mount(container);
		this.formatSelect.selectElement.addEventListener('change', this.handleFormatChange);
		this.syncTransparencyAvailability();

		this.status.mount(container);

		return container;
	}

	getOptions(): VideoExportOptions {
		const defaults = this._config.defaultOptions ?? {};
		const frameCount = Number.parseInt(this.frameCountInput.value, 10);
		const frameRate = Number.parseFloat(this.frameRateInput.value);
		const keyFrameInterval = Number.parseFloat(this.keyFrameIntervalInput.value);
		const format = this.formatSelect.value;

		const options: VideoExportOptions = {
			format,
			bitrate: this.bitrateSelect.value,
			bitrateMode: this.bitrateModeSelect.value,
			latencyMode: this.latencyModeSelect.value,
			hardwareAcceleration: this.hardwareAccelerationSelect.value,
			keyFrameInterval: Number.isFinite(keyFrameInterval)
				? keyFrameInterval
				: (defaults.keyFrameInterval ?? DEFAULT_KEYFRAME_INTERVAL),
			frameCount: Number.isFinite(frameCount) ? frameCount : (defaults.frameCount ?? DEFAULT_FRAME_COUNT),
			frameRate: Number.isFinite(frameRate) ? frameRate : (defaults.frameRate ?? DEFAULT_FRAME_RATE),
		};

		if (format === 'webm') {
			options.transparent = this.transparencyInput.checked;
		}

		return options;
	}

	reset(): void {
		this.recordingState = 'idle';
		this.applyDefaults();
		this.status.setMessage('ready to record', 'neutral');
	}

	validate(): boolean {
		const frameCount = Number.parseInt(this.frameCountInput.value, 10);
		const frameRate = Number.parseFloat(this.frameRateInput.value);
		const keyFrameInterval = Number.parseFloat(this.keyFrameIntervalInput.value);
		return (
			Number.isFinite(frameCount) &&
			frameCount >= FRAME_COUNT_MIN &&
			Number.isFinite(frameRate) &&
			frameRate >= FRAME_RATE_MIN &&
			Number.isFinite(keyFrameInterval) &&
			keyFrameInterval >= 0
		);
	}

	isRecording(): boolean {
		return this.recordingState === 'recording' || this.recordingState === 'encoding';
	}

	setRecordingState(state: VideoRecordingState, progress?: VideoExportProgress): void {
		this.recordingState = state;
		const disabled = state === 'recording' || state === 'encoding';
		this.formatSelect.selectElement.disabled = disabled;
		this.bitrateSelect.selectElement.disabled = disabled;
		this.frameCountInput.inputElement.disabled = disabled;
		this.frameRateInput.inputElement.disabled = disabled;
		this.bitrateModeSelect.selectElement.disabled = disabled;
		this.latencyModeSelect.selectElement.disabled = disabled;
		this.hardwareAccelerationSelect.selectElement.disabled = disabled;
		this.keyFrameIntervalInput.inputElement.disabled = disabled;
		this.transparencyInput.inputElement.disabled = disabled || this.formatSelect.value !== 'webm';

		this.syncStatus(state, progress);
	}

	handleProgress(progress: VideoExportProgress): void {
		this.syncStatus(progress.state, progress);
	}

	private syncStatus(
		state: VideoRecordingState | VideoExportProgress['state'],
		progress?: VideoExportProgress
	): void {
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
			case 'encoding': {
				this.status.setMessage('finalizing video', 'active');
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
		const format = defaults.format ?? DEFAULT_VIDEO_FORMAT;
		const frameCount = defaults.frameCount ?? DEFAULT_FRAME_COUNT;
		const frameRate = defaults.frameRate ?? DEFAULT_FRAME_RATE;
		const keyFrameInterval = defaults.keyFrameInterval ?? DEFAULT_KEYFRAME_INTERVAL;

		this.formatSelect.value = format;
		this.bitrateSelect.value = this.resolveBitratePreset(defaults.bitrate);
		this.frameCountInput.value = String(frameCount);
		this.frameRateInput.value = String(frameRate);
		this.bitrateModeSelect.value = defaults.bitrateMode ?? DEFAULT_BITRATE_MODE;
		this.latencyModeSelect.value = defaults.latencyMode ?? DEFAULT_LATENCY_MODE;
		this.hardwareAccelerationSelect.value = defaults.hardwareAcceleration ?? DEFAULT_HARDWARE_ACCELERATION;
		this.keyFrameIntervalInput.value = String(keyFrameInterval);
		this.transparencyInput.checked = Boolean(defaults.transparent);

		this.frameCountInput.refresh();
		this.frameRateInput.refresh();
		this.keyFrameIntervalInput.refresh();
		this.syncTransparencyAvailability();
	}

	private resolveBitratePreset(value: VideoExportOptions['bitrate']): VideoBitratePreset {
		return value === 'low' || value === 'medium' || value === 'high' ? value : DEFAULT_BITRATE;
	}

	private readonly handleFormatChange = () => {
		this.syncTransparencyAvailability();
	};

	private syncTransparencyAvailability(): void {
		if (!this.transparencyInput.isMounted()) {
			return;
		}

		const isWebM = this.formatSelect.value === 'webm';
		this.transparencyInput.root.style.display = isWebM ? '' : 'none';
		this.transparencyInput.inputElement.disabled = !isWebM || this.isRecording();
		if (!isWebM) {
			this.transparencyInput.checked = false;
		}
	}
}
