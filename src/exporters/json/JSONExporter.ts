import type { Textmodifier } from 'textmode.js';
import { FileHandler } from '../base';
import { JSONDataExtractor } from './JSONDataExtractor';
import { TEXTMODE_EXPORT_VERSION } from '../../version';
import type {
	JSONCellData,
	JSONColorValue,
	JSONExportOptions,
	JSONGenerationOptions,
	JSONObjectRowCell,
	TextmodeLayerJSON,
} from './types';

const TEXTMODE_LAYER_SCHEMA = 'https://textmode.art/schemas/textmode-layer-1.0.schema.json';

/**
 * Main JSON exporter for the textmode.js library.
 * Orchestrates structured base-layer export and file download.
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
			pretty: options.pretty ?? true,
			colorMode: options.colorMode ?? 'hex',
			includeMetadata: options.includeMetadata ?? true,
			filename: options.filename,
		};
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
	 * @param textmodifier The Textmodifier instance for grid dimensions
	 * @param colorMode Configured color mode
	 * @returns Readable row-based cell structure
	 */
	private _createObjectRowsCells(
		cells: JSONCellData[],
		textmodifier: Textmodifier,
		colorMode: JSONGenerationOptions['colorMode']
	): TextmodeLayerJSON['layer']['cells'] {
		const rows: JSONObjectRowCell[][] = [];

		for (let y = 0; y < textmodifier.grid!.rows; y++) {
			const rowStart = y * textmodifier.grid!.cols;
			const rowCells = cells.slice(rowStart, rowStart + textmodifier.grid!.cols).map((cell) => ({
				x: cell.x,
				y: cell.y,
				character: cell.character,
				foreground: this._formatColor(cell.foreground, colorMode),
				background: this._formatColor(cell.background, colorMode),
				transform: { ...cell.transform },
			}));

			rows.push(rowCells);
		}

		return {
			encoding: 'object-rows-v1',
			rows,
		};
	}

	/**
	 * Generates structured JSON layer data without serializing it.
	 *
	 * @param textmodifier The Textmodifier instance to extract data from
	 * @param options Export options
	 * @returns Structured JSON document for the base layer
	 */
	public $generateJSONData(textmodifier: Textmodifier, options: JSONExportOptions = {}): TextmodeLayerJSON {
		const generationOptions = this._applyDefaultOptions(options);
		const cells = new JSONDataExtractor().$extractCellData(textmodifier);
		const layerCells = this._createObjectRowsCells(cells, textmodifier, generationOptions.colorMode);

		return {
			$schema: TEXTMODE_LAYER_SCHEMA,
			format: 'textmode.layer',
			formatVersion: '1.0.0',
			...(generationOptions.includeMetadata
				? {
						metadata: {
							createdAt: new Date().toISOString(),
							generator: {
								name: 'textmode.export.js',
								version: TEXTMODE_EXPORT_VERSION,
							},
						},
					}
				: {}),
			canvas: {
				width: textmodifier.grid!.width,
				height: textmodifier.grid!.height,
			},
			grid: {
				cols: textmodifier.grid!.cols,
				rows: textmodifier.grid!.rows,
				cellWidth: textmodifier.grid!.cellWidth,
				cellHeight: textmodifier.grid!.cellHeight,
			},
			layer: {
				id: 'base',
				cells: layerCells,
			},
		};
	}

	/**
	 * Generates the serialized JSON string for the current base layer.
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
