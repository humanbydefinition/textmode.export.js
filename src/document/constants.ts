/**
 * Canonical format discriminator for textmode document files.
 *
 * @see {@link https://code.textmode.art/api/textmode.export.js/variables/TEXTMODE_DOCUMENT_FORMAT | TEXTMODE_DOCUMENT_FORMAT API reference}
 */
export const TEXTMODE_DOCUMENT_FORMAT = 'textmode.document' as const;

/**
 * Current textmode document schema revision.
 *
 * @see {@link https://code.textmode.art/api/textmode.export.js/variables/TEXTMODE_DOCUMENT_FORMAT_VERSION | TEXTMODE_DOCUMENT_FORMAT_VERSION API reference}
 */
export const TEXTMODE_DOCUMENT_FORMAT_VERSION = '2.0.0' as const;

/** Legacy format discriminator accepted by the compatibility decoder. */
export const LEGACY_TEXTMODE_LAYER_FORMAT = 'textmode.layer' as const;

/** Legacy selected-layer schema revision. */
export const LEGACY_TEXTMODE_SELECTED_VERSION = '1.0.0' as const;

/** Legacy layer-stack schema revision. */
export const LEGACY_TEXTMODE_ALL_VERSION = '1.1.0' as const;

/**
 * Canonical dense row encoding used by textmode document v2.
 *
 * @see {@link https://code.textmode.art/api/textmode.export.js/variables/TEXTMODE_OBJECT_ROWS_ENCODING | TEXTMODE_OBJECT_ROWS_ENCODING API reference}
 */
export const TEXTMODE_OBJECT_ROWS_ENCODING = 'object-rows-v1' as const;

/** Default protocol safety limits. Product-specific limits belong to callers. */
export const DEFAULT_TEXTMODE_DOCUMENT_LIMITS = {
	maxCells: 16_777_216,
	maxLayers: 4_096,
	maxLayerIdLength: 1_024,
	maxCharacterLength: 64,
	maxMetadataStringLength: 4_096,
} as const;
