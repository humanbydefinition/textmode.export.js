/**
 * TypeScript augmentation for `textmode.export.js`.
 */
import type { TextmodeExportAPI } from '../types';
import type {} from 'textmode.js/addon';

declare module 'textmode.js/addon' {
	interface TextmodifierExtensions extends TextmodeExportAPI {}
}
