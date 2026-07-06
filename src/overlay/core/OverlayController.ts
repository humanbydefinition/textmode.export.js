import type { Textmodifier } from 'textmode.js';
import type { TextmodeExportAPI } from '../../types';
import type { ExportDefaults, ExportDefaultsPatch, ExportFormat, ExportOptionsMap } from '../types';
import { overlayClasses } from '../utils/classes';
import { Header } from '../components/display/Header';
import { Field } from '../components/base/Field';
import { SelectInput } from '../components/inputs/SelectInput';
import { Button } from '../components/actions/Button';
import { EventBus } from './EventBus';
import { StateManager } from './StateManager';
import type { OverlayEvents } from '../models/OverlayEvents';
import type { OverlayState } from '../models/OverlayState';
import { createInitialOverlayState } from '../models/OverlayState';
import type { FormatDefinition } from '../models/FormatDefinition';
import { ClipboardService } from '../services/ClipboardService';
import { ExportService } from '../services/ExportService';
import { PositionService, type OverlayPosition } from '../services/PositionService';
import type { Blade } from '../blades';
import { isRecordingBlade } from '../blades';
import type { GIFExportProgress } from '../../exporters/gif';
import type { VideoExportProgress } from '../../exporters/video';
import { DefaultsStore } from '../config/DefaultsStore';
import overlayStyles from '../style.css?inline';

interface FormatContext {
	definition: FormatDefinition<ExportFormat>;
	blade: Blade<ExportOptionsMap[ExportFormat]>;
	initialized: boolean;
	needsReset: boolean;
}

interface LayerTargetAwareBlade {
	refreshLayerTargets(): void;
}

function hasLayerTargets(
	blade: Blade<ExportOptionsMap[ExportFormat]>
): blade is Blade<ExportOptionsMap[ExportFormat]> & LayerTargetAwareBlade {
	return blade.capabilities.layerTarget;
}

export class OverlayController {
	private readonly _textmodifier: Textmodifier;
	private readonly _defaultsStore: DefaultsStore;
	private readonly _state: StateManager<OverlayState>;
	private readonly _events: EventBus<OverlayEvents>;
	private readonly _exportService: ExportService;
	private readonly _clipboardService: ClipboardService;
	private readonly _definitions: ReadonlyArray<FormatDefinition>;
	private readonly _formats = new Map<ExportFormat, FormatContext>();
	private readonly _eventUnsubscribers: Array<() => void> = [];

	private _shadowHost!: HTMLDivElement;
	private _shadowRoot!: ShadowRoot;
	private _overlayElement!: HTMLDivElement;
	private _optionsContainer!: HTMLDivElement;
	private _copyButtonContainer!: HTMLDivElement;
	private _positionService!: PositionService;

	private _header = new Header();
	private _formatField = new Field({ label: 'export format', labelFor: 'textmode-export-format', variant: 'full' });
	private _formatSelect = new SelectInput<ExportFormat>({
		id: 'textmode-export-format',
		options: [],
	});
	private _exportButton = new Button({ label: 'download file', fullWidth: true, variant: 'primary' });
	private _copyButton = new Button({ label: 'copy to clipboard', fullWidth: true, variant: 'primary' });

	private _currentFormat: ExportFormat;
	private _currentBlade?: FormatContext;

	private readonly _handleFormatSelectChange = () => {
		this._handleFormatChange(this._formatSelect.value);
	};

	private readonly _handleExportClickSafe = () => {
		this._handleExportClick().catch((error) => {
			console.error('[textmode-export] Export failed', error);
		});
	};

	private readonly _handleCopyClickSafe = () => {
		this._handleCopyClick().catch((error) => {
			console.error('[textmode-export] Copy failed', error);
		});
	};

	constructor(
		textmodifier: Textmodifier,
		exportAPI: TextmodeExportAPI,
		defaultsStore: DefaultsStore,
		definitions: ReadonlyArray<FormatDefinition>
	) {
		this._textmodifier = textmodifier;
		this._defaultsStore = defaultsStore;

		const initialFormat = this._resolveInitialFormat(defaultsStore.current.format, definitions);
		this._state = new StateManager(createInitialOverlayState(initialFormat));
		this._events = new EventBus<OverlayEvents>();
		this._exportService = new ExportService(exportAPI, this._events);
		this._clipboardService = new ClipboardService(exportAPI);
		this._definitions = definitions;
		this._currentFormat = initialFormat;
		this._initializeFormatMap();
		this._registerEventHandlers();
	}

	public $mount(): void {
		this._createOverlay();
		this._renderStaticContent();
		this._positionService = new PositionService(this._textmodifier, this._shadowHost, this._overlayElement);
		this._positionService.attachDragHandle(this._header.dragHandleElement);
		this._positionService.bind();
		this._switchFormat(this._currentFormat);
	}

	public show(): void {
		if (this._shadowHost) {
			this.refreshLayerTargets();
			this._shadowHost.style.display = '';
		}
	}

	public hide(): void {
		if (this._shadowHost) {
			this._shadowHost.style.display = 'none';
		}
	}

	public toggle(): void {
		if (this.isVisible()) {
			this.hide();
		} else {
			this.show();
		}
	}

	public isVisible(): boolean {
		return this._shadowHost ? this._shadowHost.style.display !== 'none' : false;
	}

	public refreshLayerTargets(): void {
		if (this._currentBlade && hasLayerTargets(this._currentBlade.blade)) {
			this._currentBlade.blade.refreshLayerTargets();
		}
	}

	public resetPosition(): void {
		this._positionService.resetPosition();
	}

	public getPosition(): Readonly<OverlayPosition> {
		return this._positionService.getPosition();
	}

	public setPosition(position: Pick<OverlayPosition, 'offsetX' | 'offsetY'>): void {
		this._positionService.setPosition(position);
	}

	// ---- Runtime defaults API -------------------------------------------------

	/**
	 * Override the curated per-format defaults at runtime.
	 *
	 * Merges the supplied patch into the internal defaults store and
	 * pushes the new values into every mounted blade.  The currently
	 * visible blade is updated immediately; other formats pick up
	 * the new defaults when the user switches to them.
	 */
	setDefaults(patch: ExportDefaultsPatch): void {
		if (patch.format) {
			this._assertKnownFormat(patch.format);
		}
		this._defaultsStore.merge(patch);
		this._resetAffectedBlades(this._getFormatKeys(patch));
		if (patch.format) {
			this._handleFormatChange(patch.format);
		}
	}

	/**
	 * Read the current effective defaults for every format.
	 */
	getDefaults(): Readonly<ExportDefaults> {
		return this._defaultsStore.current;
	}

	/**
	 * Restore one or all formats to the library's curated defaults.
	 */
	resetDefaults(target?: keyof ExportDefaults): void {
		this._defaultsStore.reset(target);
		if (target === 'format') {
			this._handleFormatChange(this._defaultsStore.current.format);
			return;
		}
		this._resetAffectedBlades(target ? [target] : undefined);
		if (!target) {
			this._handleFormatChange(this._defaultsStore.current.format);
		}
	}

	public $dispose(): void {
		if (this._formatSelect.isMounted()) {
			this._formatSelect.selectElement.removeEventListener('change', this._handleFormatSelectChange);
		}
		if (this._exportButton.isMounted()) {
			this._exportButton.buttonElement.removeEventListener('click', this._handleExportClickSafe);
		}
		if (this._copyButton.isMounted()) {
			this._copyButton.buttonElement.removeEventListener('click', this._handleCopyClickSafe);
		}
		for (const unsubscribe of this._eventUnsubscribers) {
			unsubscribe();
		}
		this._eventUnsubscribers.length = 0;
		this._events.$clear();
		for (const context of this._formats.values()) {
			context.blade.destroy();
		}
		this._formats.clear();
		this._currentBlade = undefined;
		if (this._shadowHost?.isConnected) {
			this._shadowHost.remove();
		}
		this._positionService?.dispose();
	}

	// ---- Private helpers -------------------------------------------------------

	private _resetAffectedBlades(formats?: ReadonlyArray<ExportFormat>): void {
		const affected = new Set<ExportFormat>(formats ?? this._formats.keys());
		for (const [format, context] of this._formats) {
			if (!affected.has(format)) {
				continue;
			}
			if (context.blade.isMounted()) {
				context.blade.reset();
				context.needsReset = false;
			} else {
				context.needsReset = true;
			}
		}
	}

	private _initializeFormatMap(): void {
		for (const definition of this._definitions) {
			const blade = definition.createBlade();
			this._formats.set(definition.format, {
				definition,
				blade,
				initialized: false,
				needsReset: false,
			});
		}
	}

	private _resolveInitialFormat(
		requestedFormat: ExportFormat,
		definitions: ReadonlyArray<FormatDefinition>
	): ExportFormat {
		return definitions.some((definition) => definition.format === requestedFormat)
			? requestedFormat
			: (definitions[0]?.format ?? requestedFormat);
	}

	private _getFormatKeys(patch: ExportDefaultsPatch): ExportFormat[] {
		return this._definitions
			.map((definition) => definition.format)
			.filter((format): format is ExportFormat => patch[format] !== undefined);
	}

	private _assertKnownFormat(format: ExportFormat): void {
		if (!this._formats.has(format)) {
			throw new Error(`Unknown export format: ${format}`);
		}
	}

	private _createOverlay(): void {
		// Create shadow host container
		this._shadowHost = document.createElement('div');
		this._shadowHost.dataset.plugin = 'textmode-export-overlay-host';
		this._shadowHost.style.cssText =
			'position: absolute; top: 0; left: 0; pointer-events: none; z-index: 2147483647;';

		// Attach shadow root for complete style isolation
		this._shadowRoot = this._shadowHost.attachShadow({ mode: 'open' });

		// Inject styles into shadow DOM
		const styleElement = document.createElement('style');
		styleElement.textContent = overlayStyles;
		this._shadowRoot.appendChild(styleElement);

		// Create overlay element inside shadow DOM
		this._overlayElement = document.createElement('div');
		this._overlayElement.dataset.plugin = 'textmode-export-overlay';
		this._overlayElement.classList.add(overlayClasses.root, overlayClasses.stack);
		this._shadowRoot.appendChild(this._overlayElement);

		// Mount shadow host to document body
		document.body.appendChild(this._shadowHost);
	}

	private _renderStaticContent(): void {
		this._header.mount(this._overlayElement);

		const formatSection = document.createElement('div');
		formatSection.classList.add(overlayClasses.section);
		this._overlayElement.appendChild(formatSection);

		this._formatField.mount(formatSection);
		this._prepareFormatOptions();
		this._formatSelect.mount(this._formatField.root);
		this._formatSelect.selectElement.addEventListener('change', this._handleFormatSelectChange);

		this._optionsContainer = document.createElement('div');
		this._optionsContainer.classList.add(overlayClasses.stack, overlayClasses.stackCompact);
		this._overlayElement.appendChild(this._optionsContainer);

		this._exportButton.mount(this._overlayElement);
		this._exportButton.buttonElement.addEventListener('click', this._handleExportClickSafe);

		this._copyButtonContainer = document.createElement('div');
		this._copyButtonContainer.classList.add(overlayClasses.stack, overlayClasses.stackDense);
		this._overlayElement.appendChild(this._copyButtonContainer);

		this._copyButton.mount(this._copyButtonContainer);
		this._copyButton.buttonElement.dataset.defaultLabel = 'copy to clipboard';
		this._copyButton.buttonElement.addEventListener('click', this._handleCopyClickSafe);
	}

	private _prepareFormatOptions(): void {
		const options = this._definitions.map((definition) => ({
			value: definition.format,
			label: definition.label,
		}));
		this._formatSelect.update({ options, defaultValue: this._currentFormat });
	}

	private _registerEventHandlers(): void {
		this._eventUnsubscribers.push(
			this._events.$on('export:request', ({ format }) => {
				if (format === this._currentFormat) {
					this._state.$set({ isBusy: true, error: undefined });
					this._updateExportButton();
				}
			}),
			this._events.$on('export:success', ({ format }) => {
				if (format === this._currentFormat) {
					const patch: Partial<OverlayState> = { isBusy: false };
					if (format === 'gif') {
						patch.gifProgress = undefined;
					}
					if (format === 'video') {
						patch.videoProgress = undefined;
					}
					this._state.$set(patch);
					this._updateExportButton();
				}
			}),
			this._events.$on('export:error', ({ format, error }) => {
				if (format === this._currentFormat) {
					this._state.$set({ isBusy: false, error });
					this._updateExportButton();
				}
			}),
			this._events.$on('export:progress', ({ format, progress }) => {
				if (!progress) {
					return;
				}
				if (format === 'gif') {
					const gifProgress = progress as GIFExportProgress;
					this._state.$set({ gifProgress });
					if (this._currentBlade?.definition.format === 'gif' && isRecordingBlade(this._currentBlade.blade)) {
						this._currentBlade.blade.handleProgress(gifProgress);
					}
				} else if (format === 'video') {
					const videoProgress = progress as VideoExportProgress;
					this._state.$set({ videoProgress });
					if (
						this._currentBlade?.definition.format === 'video' &&
						isRecordingBlade(this._currentBlade.blade)
					) {
						this._currentBlade.blade.handleProgress(videoProgress);
					}
				}
				this._updateExportButton();
			})
		);
	}

	private _handleFormatChange(format: ExportFormat): void {
		this._currentFormat = format;
		this._state.$set({ format });
		this._switchFormat(format);
		this._events.$emit('format:change', { format });
	}

	private _switchFormat(format: ExportFormat): void {
		const context = this._formats.get(format);
		if (!context) {
			throw new Error(`Unknown export format: ${format}`);
		}

		if (this._currentBlade) {
			this._currentBlade.blade.unmount();
		}

		this._optionsContainer.innerHTML = '';
		context.blade.mount(this._optionsContainer);
		if (!context.initialized || context.needsReset) {
			context.blade.reset();
			context.initialized = true;
			context.needsReset = false;
		}
		this._currentBlade = context;
		this._formatSelect.value = format;
		this.refreshLayerTargets();

		this._updateCopyButtonState();
		this._updateExportButton();
		this._positionService?.scheduleUpdate();
	}

	private _updateCopyButtonState(): void {
		const supportsClipboard = this._currentBlade?.definition.supportsClipboard ?? false;
		this._copyButtonContainer.style.display = supportsClipboard ? 'flex' : 'none';
		this._copyButton.setDisabled(!supportsClipboard);
	}

	private async _handleExportClick(): Promise<void> {
		if (!this._currentBlade) {
			return;
		}

		const format = this._currentBlade.definition.format;
		const options = this._currentBlade.blade.getOptions();

		if (!this._currentBlade.blade.validate()) {
			console.warn('[textmode-export] Export options failed validation');
			return;
		}

		if (isRecordingBlade(this._currentBlade.blade)) {
			const blade = this._currentBlade.blade;
			if (blade.isRecording()) {
				return;
			}
			blade.setRecordingState('recording');
			try {
				await this._exportService.$requestExport(format, options, {
					onGIFProgress: (progress) => {
						blade.setRecordingState(progress.state, progress);
					},
					onVideoProgress: (progress) => {
						blade.setRecordingState(progress.state, progress);
					},
				});
			} catch (error) {
				blade.setRecordingState('error');
				throw error;
			}
			window.setTimeout(() => {
				blade.setRecordingState('idle');
				this._updateExportButton();
			}, 1600);
			return;
		}

		this._exportButton.setDisabled(true);
		this._exportButton.setLabel('exporting…');
		try {
			await this._exportService.$requestExport(format, options);
		} finally {
			this._exportButton.setDisabled(false);
			this._exportButton.setLabel('download file');
		}
	}

	private async _handleCopyClick(): Promise<void> {
		if (!this._currentBlade || !this._currentBlade.definition.supportsClipboard) {
			return;
		}
		const format = this._currentBlade.definition.format;
		const options = this._currentBlade.blade.getOptions();
		const button = this._copyButton.buttonElement;
		const defaultLabel = button.dataset.defaultLabel ?? 'copy to clipboard';

		this._copyButton.setDisabled(true);
		this._copyButton.setLabel('copying…');
		try {
			switch (format) {
				case 'txt':
					await this._clipboardService.$copy('txt', options as ExportOptionsMap['txt']);
					break;
				case 'json':
					await this._clipboardService.$copy('json', options as ExportOptionsMap['json']);
					break;
				case 'svg':
					await this._clipboardService.$copy('svg', options as ExportOptionsMap['svg']);
					break;
				case 'image':
					await this._clipboardService.$copy('image', options as ExportOptionsMap['image']);
					break;
				default:
					return;
			}
			this._copyButton.setLabel('copied!');
		} catch (error) {
			console.error('[textmode-export] Failed to copy to clipboard', error);
			this._copyButton.setLabel('copy failed!');
		} finally {
			window.setTimeout(() => {
				this._copyButton.setLabel(defaultLabel);
				this._copyButton.setDisabled(false);
			}, 1200);
		}
	}

	private _updateExportButton(): void {
		if (!this._currentBlade) {
			return;
		}

		const format = this._currentBlade.definition.format;
		if (isRecordingBlade(this._currentBlade.blade)) {
			const blade = this._currentBlade.blade;
			const progress = format === 'gif' ? this._state.snapshot.gifProgress : this._state.snapshot.videoProgress;
			if (blade.isRecording()) {
				this._exportButton.setDisabled(true);
				if (progress?.totalFrames) {
					const current = progress.frameIndex ?? 0;
					const action = progress.state === 'encoding' ? 'encoding' : 'recording';
					this._exportButton.setLabel(
						format === 'gif'
							? `${action} ${current}/${progress.totalFrames}`
							: `recording ${current}/${progress.totalFrames} frames`
					);
				} else {
					this._exportButton.setLabel(progress?.state === 'encoding' ? 'encoding…' : 'recording…');
				}
			} else {
				this._exportButton.setDisabled(false);
				this._exportButton.setLabel('start recording');
			}
			return;
		}

		const busy = this._state.snapshot.isBusy;
		this._exportButton.setDisabled(busy);
		this._exportButton.setLabel(busy ? 'exporting…' : 'download file');
	}
}
