/**
 * TypeScript augmentation for `textmode.export.js`.
 */
import type { TextmodeExportAPI } from '../types';

declare module 'textmode.js' {
	interface Textmodifier extends TextmodeExportAPI {}
}
