import type { Textmodifier } from 'textmode.js';
import {
	FileHandler,
	resolveLayerExportTarget,
	resolveLayerStackExportTargets,
	type ResolvedLayerExportTarget,
	type ResolvedLayerStackExportTarget,
} from '../base';
import { JSONDataExtractor } from './JSONDataExtractor';
import { TEXTMODE_EXPORT_VERSION } from '../../version';
import type {
	JSONCellData,
	JSONCellCollection,
	JSONColorValue,
	JSONExportMetadata,
	JSONExportOptions,
	JSONGenerationOptions,
	JSONLayerGrid,
	JSONObjectRowCell,
	TextmodeDocumentJSON,
	TextmodeDocumentLayer,
} from './types';

const TEXTMODE_DOCUMENT_FORMAT = 'textmode.document' as const;
const TEXTMODE_DOCUMENT_FORMAT_VERSION = '2.0.0' as const;

/**
 * Main JSON exporter for the textmode.js library.
 * Orchestrates structured selected-layer or layer-stack export and file download.
 */
export class JSONExporter {
	/**
	 * Applies default values to JSON export options.
	 *
	 * @param options User-provided options
	 * @returns Complete options with defaults applied
	 */
	private _applyDefaultOptions(options: JSONExportOptions): JSONGenerationOptions {
		return {
			target: options.target ?? 'selected',
			pretty: options.pretty ?? true,
			colorMode: options.colorMode ?? 'hex',
			includeMetadata: options.includeMetadata ?? true,
			filename: options.filename,
			layer: options.layer,
		};
	}

	private _createMetadata(generationOptions: JSONGenerationOptions): JSONExportMetadata | undefined {
		return generationOptions.includeMetadata
			? {
					createdAt: new Date().toISOString(),
					generator: {
						name: 'textmode.export.js',
						version: TEXTMODE_EXPORT_VERSION,
					},
				}
			: undefined;
	}

	/**
	 * Converts an RGBA color to the configured JSON representation.
	 *
	 * @param color Source color
	 * @param colorMode Output color mode
	 * @returns JSON-ready color value
	 */
	private _formatColor(
		color: JSONCellData['foreground'],
		colorMode: JSONGenerationOptions['colorMode']
	): JSONColorValue {
		if (colorMode === 'rgba') {
			return { ...color };
		}

		const hex = [color.r, color.g, color.b, color.a]
			.map((channel) => channel.toString(16).padStart(2, '0'))
			.join('');
		return `#${hex}`;
	}

	/**
	 * Creates the row-based cell encoding.
	 *
	 * @param cells Extracted cell data
	 * @param cols Number of grid columns
	 * @param rows Number of grid rows
	 * @param colorMode Configured color mode
	 * @returns Readable row-based cell structure
	 */
	private _createObjectRowsCells(
		cells: JSONCellData[],
		cols: number,
		rows: number,
		colorMode: JSONGenerationOptions['colorMode']
	): JSONCellCollection {
		const rowCollections: JSONObjectRowCell[][] = [];

		for (let y = 0; y < rows; y++) {
			const rowStart = y * cols;
			const rowCells = cells.slice(rowStart, rowStart + cols).map((cell) => ({
				x: cell.x,
				y: cell.y,
				character: cell.character,
				foreground: this._formatColor(cell.foreground, colorMode),
				background: this._formatColor(cell.background, colorMode),
				transform: { ...cell.transform },
			}));

			rowCollections.push(rowCells);
		}

		return {
			encoding: 'object-rows-v1',
			rows: rowCollections,
		};
	}

	private _createLayerGrid(target: ResolvedLayerExportTarget): JSONLayerGrid {
		return {
			cols: target.grid.cols,
			rows: target.grid.rows,
			cellWidth: target.grid.cellWidth,
			cellHeight: target.grid.cellHeight,
		};
	}

	private _createLayerCells(
		target: ResolvedLayerExportTarget,
		generationOptions: JSONGenerationOptions
	): JSONCellCollection {
		const cells = new JSONDataExtractor().$extractCellData(target);
		return this._createObjectRowsCells(cells, target.grid.cols, target.grid.rows, generationOptions.colorMode);
	}

	private _createStackLayer(
		target: ResolvedLayerStackExportTarget,
		generationOptions: JSONGenerationOptions
	): TextmodeDocumentLayer {
		return {
			id: target.id,
			visible: target.visible,
			opacity: target.opacity,
			blendMode: target.blendMode,
			offsetX: target.offsetX,
			offsetY: target.offsetY,
			rotationZ: target.rotationZ,
			grid: this._createLayerGrid(target),
			cells: this._createLayerCells(target, generationOptions),
		};
	}

	/**
	 * Generates structured JSON document data without serializing it.
	 *
	 * @param textmodifier The Textmodifier instance to extract data from
	 * @param options Export options
	 * @returns Structured JSON document for the selected layer or layer stack
	 */
	public $generateJSONData(textmodifier: Textmodifier, options: JSONExportOptions = {}): TextmodeDocumentJSON {
		const generationOptions = this._applyDefaultOptions(options);
		const metadata = this._createMetadata(generationOptions);

		if (generationOptions.target === 'all') {
			const targets = resolveLayerStackExportTargets(textmodifier);
			const canvasGrid = targets[0].grid;

			return {
				format: TEXTMODE_DOCUMENT_FORMAT,
				formatVersion: TEXTMODE_DOCUMENT_FORMAT_VERSION,
				target: 'all',
				...(metadata ? { metadata } : {}),
				canvas: {
					width: canvasGrid.width,
					height: canvasGrid.height,
				},
				layers: targets.map((target) => this._createStackLayer(target, generationOptions)),
			};
		}

		const target = resolveLayerExportTarget(textmodifier, generationOptions.layer);

		return {
			format: TEXTMODE_DOCUMENT_FORMAT,
			formatVersion: TEXTMODE_DOCUMENT_FORMAT_VERSION,
			target: 'selected',
			...(metadata ? { metadata } : {}),
			canvas: {
				width: target.grid.width,
				height: target.grid.height,
			},
			grid: this._createLayerGrid(target),
			layer: {
				id: target.id,
				cells: this._createLayerCells(target, generationOptions),
			},
		};
	}

	/**
	 * Generates the serialized JSON string for the selected layer or layer stack.
	 *
	 * @param textmodifier The Textmodifier instance to extract data from
	 * @param options Export options
	 * @returns Serialized JSON string
	 */
	public $generateJSONString(textmodifier: Textmodifier, options: JSONExportOptions = {}): string {
		const generationOptions = this._applyDefaultOptions(options);
		const data = this.$generateJSONData(textmodifier, generationOptions);
		const indentation =
			typeof generationOptions.pretty === 'number' ? generationOptions.pretty : generationOptions.pretty ? 2 : 0;
		return JSON.stringify(data, null, indentation);
	}

	/**
	 * Exports the generated JSON to a downloadable file.
	 *
	 * @param textmodifier The Textmodifier instance to extract data from
	 * @param options Export options
	 */
	public $saveJSON(textmodifier: Textmodifier, options: JSONExportOptions = {}): void {
		const generationOptions = this._applyDefaultOptions(options);
		new FileHandler().$downloadFile(
			new Blob([this.$generateJSONString(textmodifier, generationOptions)], {
				type: 'application/json;charset=utf-8',
			}),
			generationOptions.filename
		);
	}
}
