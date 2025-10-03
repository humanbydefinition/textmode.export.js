import type { Textmodifier } from 'textmode.js';
import type { TextmodeExportAPI } from '../../types';
import type { ExportFormat } from '../types';
import { overlayClasses } from '../utils/classes';
import { Header } from '../components/display/Header';
import { Field } from '../components/base/Field';
import { SelectInput } from '../components/inputs/SelectInput';
import { Button } from '../components/actions/Button';
import { EventBus } from './EventBus';
import { StateManager } from './StateManager';
import type { OverlayEvents } from '../models/OverlayEvents';
import type { OverlayState } from '../models/OverlayState';
import type { FormatDefinition } from '../models/FormatDefinition';
import { ClipboardService } from '../services/ClipboardService';
import { ExportService } from '../services/ExportService';
import { PositionService } from '../services/PositionService';
import type { Blade } from '../blades';
import { GIFBlade } from '../blades/GIFBlade';
import { VideoBlade } from '../blades/VideoBlade';
import type { GIFExportProgress } from '../../exporters/gif';
import type { VideoExportProgress } from '../../exporters/video';
import overlayStyles from '../style.css?inline';

interface FormatContext {
  definition: FormatDefinition;
  blade: Blade<any>;
  initialized: boolean;
}

export class OverlayController {
  private readonly _textmodifier: Textmodifier;
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
    state: StateManager<OverlayState>,
    events: EventBus<OverlayEvents>,
    definitions: ReadonlyArray<FormatDefinition>,
  ) {
    this._textmodifier = textmodifier;
    this._state = state;
    this._events = events;
    this._exportService = new ExportService(exportAPI, events);
    this._clipboardService = new ClipboardService(exportAPI);
    this._definitions = definitions;
    this._currentFormat = state.snapshot.format;
    this._initializeFormatMap();
    this._registerEventHandlers();
  }

  public $mount(): void {
    this._createOverlay();
    this._renderStaticContent();
    this._positionService = new PositionService(this._textmodifier, this._shadowHost);
    this._positionService.bind();
    this._switchFormat(this._currentFormat);
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

  private _initializeFormatMap(): void {
    for (const definition of this._definitions) {
      const blade = definition.createBlade();
      this._formats.set(definition.format, {
        definition,
        blade,
        initialized: false,
      });
    }
  }

  private _createOverlay(): void {
    // Create shadow host container
    this._shadowHost = document.createElement('div');
    this._shadowHost.dataset.plugin = 'textmode-export-overlay-host';
    this._shadowHost.style.cssText = 'position: absolute; top: 0; left: 0; pointer-events: none; z-index: 2147483647;';
    
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
        if (format === 'gif' && this._currentBlade?.blade instanceof GIFBlade) {
          const gifProgress = progress as GIFExportProgress;
          this._state.$set({ gifProgress });
          this._currentBlade.blade.handleProgress(gifProgress);
        } else if (format === 'video' && this._currentBlade?.blade instanceof VideoBlade) {
          const videoProgress = progress as VideoExportProgress;
          this._state.$set({ videoProgress });
          this._currentBlade.blade.handleProgress(videoProgress);
        }
        this._updateExportButton();
      }),
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
    if (!context.initialized) {
      context.blade.reset();
      context.initialized = true;
    }
    this._currentBlade = context;
    this._formatSelect.value = format;

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

    if (format === 'gif') {
      const blade = this._currentBlade.blade as GIFBlade;
      if (blade.isRecording()) {
        return;
      }
      blade.setRecordingState('recording');
      try {
        await this._exportService.$requestExport('gif', options, {
          onGIFProgress: (progress) => {
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

    if (format === 'video') {
      const blade = this._currentBlade.blade as VideoBlade;
      if (blade.isRecording()) {
        return;
      }
      blade.setRecordingState('recording');
      try {
        await this._exportService.$requestExport('video', options, {
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
      await this._clipboardService.$copy(format, options);
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
    if (format === 'gif' && this._currentBlade.blade instanceof GIFBlade) {
      const blade = this._currentBlade.blade;
      const progress = this._state.snapshot.gifProgress;
      if (blade.isRecording()) {
        this._exportButton.setDisabled(true);
        if (progress?.totalFrames) {
          const current = progress.frameIndex ?? 0;
          this._exportButton.setLabel(`recording ${current}/${progress.totalFrames}`);
        } else {
          this._exportButton.setLabel('recording…');
        }
      } else {
        this._exportButton.setDisabled(false);
        this._exportButton.setLabel('start recording');
      }
      return;
    }

    if (format === 'video' && this._currentBlade.blade instanceof VideoBlade) {
      const blade = this._currentBlade.blade;
      const progress = this._state.snapshot.videoProgress;
      if (blade.isRecording()) {
        this._exportButton.setDisabled(true);
        if (progress?.totalFrames) {
          const current = progress.frameIndex ?? 0;
          this._exportButton.setLabel(`recording ${current}/${progress.totalFrames} frames`);
        } else {
          this._exportButton.setLabel('recording…');
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
