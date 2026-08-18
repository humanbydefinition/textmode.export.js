import type {
	VideoBitrateMode,
	VideoBitratePreset,
	VideoExportFormat,
	VideoExportOptions,
	VideoExportProgress,
	VideoGenerationOptions,
	VideoHardwareAcceleration,
	VideoLatencyMode,
	VideoRecordingState,
} from '../../exporters/video';
import { createVideoEncodingPlan } from '../../exporters/video/VideoEncodingPolicy';
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
const FRAME_COUNT_MIN = 1;
const FRAME_COUNT_MAX = 60 * 60;

export class VideoBlade extends Blade<VideoExportOptions> {
	private formatSelect = this._manageComponent(
		new SelectInput<VideoExportFormat>({
			id: 'textmode-export-video-format',
			options: [
				{ value: 'mp4', label: 'MP4/H.264 (.mp4)' },
				{ value: 'webm', label: 'WebM (.webm)' },
			],
			defaultValue: 'mp4',
		})
	);

	private bitrateSelect = this._manageComponent(
		new SelectInput<VideoBitratePreset>({
			id: 'textmode-export-video-bitrate',
			options: [
				{ value: 'low', label: 'low' },
				{ value: 'medium', label: 'medium' },
				{ value: 'high', label: 'high' },
				{ value: 'ultra', label: 'ultra (near-lossless)' },
			],
			defaultValue: 'medium',
		})
	);

	private frameRateInput = this._manageComponent(
		new NumberInput({
			defaultValue: '60',
			attributes: { min: String(FRAME_RATE_MIN), max: String(FRAME_RATE_MAX), step: '1' },
			formatDisplay: (numericValue) => (Number.isFinite(numericValue) ? `${numericValue} fps` : null),
		})
	);

	private frameCountInput = this._manageComponent(
		new NumberInput({
			defaultValue: '480',
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
			defaultValue: 'variable',
		})
	);

	private latencyModeSelect = this._manageComponent(
		new SelectInput<VideoLatencyMode>({
			id: 'textmode-export-video-latency-mode',
			options: [
				{ value: 'quality', label: 'quality' },
				{ value: 'realtime', label: 'realtime' },
			],
			defaultValue: 'quality',
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
			defaultValue: 'no-preference',
		})
	);

	private keyFrameIntervalInput = this._manageComponent(
		new NumberInput({
			defaultValue: '2',
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

	private estimate = this._manageComponent(
		new StatusDisplay({
			title: 'estimate',
			message: 'logical dimensions · duration · size',
			variant: 'neutral',
			context: 'video',
		})
	);

	private recordingState: VideoRecordingState = 'idle';

	private resizeObserver?: ResizeObserver;

	constructor(config: BladeConfig<VideoExportOptions>) {
		super(config, { recording: true });
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
		this.bitrateSelect.selectElement.addEventListener('change', this.handleBitrateChange);
		this.frameCountInput.inputElement.addEventListener('input', this.handleEstimateChange);
		this.frameRateInput.inputElement.addEventListener('input', this.handleEstimateChange);
		this.formatSelect.selectElement.addEventListener('change', this.handleEstimateChange);

		this.estimate.mount(container);
		this.status.mount(container);
		this.syncOutputEstimate();
		if (this._config.videoDimensionsTarget && typeof ResizeObserver !== 'undefined') {
			this.resizeObserver = new ResizeObserver(() => this.syncOutputEstimate());
			this.resizeObserver.observe(this._config.videoDimensionsTarget);
		}

		return container;
	}

	getOptions(): VideoExportOptions {
		const defaults = this._config.defaultOptions;
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
			keyFrameInterval: Number.isFinite(keyFrameInterval) ? keyFrameInterval : (defaults.keyFrameInterval ?? 2),
			frameCount: Number.isFinite(frameCount) ? frameCount : (defaults.frameCount ?? 480),
			frameRate: Number.isFinite(frameRate) ? frameRate : (defaults.frameRate ?? 60),
		};

		if (format === 'webm') {
			options.transparent = this.transparencyInput.checked;
		}

		return options;
	}

	setDefaults(values: Partial<VideoExportOptions>): void {
		Object.assign(this._config.defaultOptions, values);
		this.reset();
	}

	reset(): void {
		this.recordingState = 'idle';
		this.applyDefaults();
		this.syncReadyStatus();
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
				this.status.setMessage(
					progress?.phase === 'writing' ? 'writing video to disk' : 'finalizing video',
					'active'
				);
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
				this.syncReadyStatus();
				break;
			}
		}
	}

	private resolvePlannedFrameCount(): number | undefined {
		const frameCount = Number.parseInt(this.frameCountInput.value, 10);
		return Number.isFinite(frameCount) && frameCount > 0 ? Math.round(frameCount) : undefined;
	}

	private applyDefaults(): void {
		const defaults = this._config.defaultOptions;

		this.formatSelect.value = defaults.format ?? 'mp4';
		this.bitrateSelect.value = this.resolveBitratePreset(defaults.bitrate);
		this.frameCountInput.value = String(defaults.frameCount ?? 480);
		this.frameRateInput.value = String(defaults.frameRate ?? 60);
		this.bitrateModeSelect.value = defaults.bitrateMode ?? 'variable';
		this.latencyModeSelect.value = defaults.latencyMode ?? 'quality';
		this.hardwareAccelerationSelect.value = defaults.hardwareAcceleration ?? 'no-preference';
		this.keyFrameIntervalInput.value = String(defaults.keyFrameInterval ?? 2);
		this.transparencyInput.checked = Boolean(defaults.transparent);

		this.frameCountInput.refresh();
		this.frameRateInput.refresh();
		this.keyFrameIntervalInput.refresh();
		this.syncTransparencyAvailability();
	}

	private resolveBitratePreset(value: VideoExportOptions['bitrate']): VideoBitratePreset {
		return value === 'low' || value === 'medium' || value === 'high' || value === 'ultra' ? value : 'medium';
	}

	private readonly handleBitrateChange = () => {
		if (!this.isRecording()) this.syncReadyStatus();
		this.syncOutputEstimate();
	};

	private readonly handleEstimateChange = () => this.syncOutputEstimate();

	private syncReadyStatus(): void {
		if (this.bitrateSelect.value === 'ultra') {
			this.status.setMessage('near-lossless; very large files and slower exports', 'alert');
		} else {
			this.status.setMessage('ready to record', 'neutral');
		}
	}

	private readonly handleFormatChange = () => {
		this.syncTransparencyAvailability();
		this.syncOutputEstimate();
	};

	private syncOutputEstimate(): void {
		if (!this.estimate.isMounted()) return;
		const dimensions = this._config.videoDimensionsProvider?.();
		const frameCount = Number.parseInt(this.frameCountInput.value, 10);
		const frameRate = Number.parseFloat(this.frameRateInput.value);
		if (!dimensions || !Number.isFinite(frameCount) || !Number.isFinite(frameRate) || frameRate <= 0) {
			this.estimate.setMessage('logical dimensions · duration · size', 'neutral');
			return;
		}
		const options: VideoGenerationOptions = {
			format: this.formatSelect.value,
			frameCount: Math.max(1, Math.round(frameCount)),
			frameRate,
			bitrate: this.bitrateSelect.value,
			bitrateMode: this.bitrateModeSelect.value,
			contentHint: 'text',
			latencyMode: this.latencyModeSelect.value,
			hardwareAcceleration: this.hardwareAccelerationSelect.value,
			keyFrameInterval: Number.parseFloat(this.keyFrameIntervalInput.value) || 2,
			pixelDensity: 1,
			width: dimensions.width,
			height: dimensions.height,
			transparent: this.formatSelect.value === 'webm' && this.transparencyInput.checked,
			debugLogging: false,
		};
		try {
			const plan = createVideoEncodingPlan(options);
			this.estimate.setMessage(
				`${plan.width}×${plan.height} · ${(plan.frameCount / plan.frameRate).toFixed(1)}s · ~${this.formatBytes(plan.estimatedBytes)}`,
				this.bitrateSelect.value === 'ultra' ? 'alert' : 'neutral'
			);
		} catch {
			this.estimate.setMessage(
				`${dimensions.width}×${dimensions.height} · MP4 requires even dimensions`,
				'alert'
			);
		}
	}

	private formatBytes(bytes: number): string {
		if (bytes >= 1_000_000_000) return `${(bytes / 1_000_000_000).toFixed(1)} GB`;
		return `${Math.max(1, Math.round(bytes / 1_000_000))} MB`;
	}

	protected override _onUnmount(): void {
		this.resizeObserver?.disconnect();
		this.resizeObserver = undefined;
		this.bitrateSelect.selectElement.removeEventListener('change', this.handleBitrateChange);
		this.formatSelect.selectElement.removeEventListener('change', this.handleFormatChange);
		this.formatSelect.selectElement.removeEventListener('change', this.handleEstimateChange);
		this.frameCountInput.inputElement.removeEventListener('input', this.handleEstimateChange);
		this.frameRateInput.inputElement.removeEventListener('input', this.handleEstimateChange);
		super._onUnmount();
	}

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
