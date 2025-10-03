import { GIFBlade, ImageBlade, SVGBlade, TextBlade, VideoBlade } from './blades';
import type { ExportFormat } from './types';
import type { FormatDefinition } from './models/FormatDefinition';

const DEFINITIONS: ReadonlyArray<FormatDefinition<ExportFormat>> = [
  {
    format: 'txt',
    label: 'plain text (.txt)',
    supportsClipboard: true,
    createBlade: () => new TextBlade({
      format: 'txt',
      label: 'plain text (.txt)',
      supportsClipboard: true,
      defaultOptions: { preserveTrailingSpaces: false, emptyCharacter: ' ' },
    }),
  },
  {
    format: 'image',
    label: 'image (.png / .jpg / .webp)',
    supportsClipboard: true,
    createBlade: () => new ImageBlade({
      format: 'image',
      label: 'image (.png / .jpg / .webp)',
      supportsClipboard: true,
      defaultOptions: { format: 'png', scale: 1 },
    }),
  },
  {
    format: 'svg',
    label: 'vector (.svg)',
    supportsClipboard: true,
    createBlade: () => new SVGBlade({
      format: 'svg',
      label: 'vector (.svg)',
      supportsClipboard: true,
      defaultOptions: {
        includeBackgroundRectangles: true,
        drawMode: 'fill',
        strokeWidth: 1,
      },
    }),
  },
  {
    format: 'gif',
    label: 'animated GIF (.gif)',
    supportsClipboard: false,
    createBlade: () => new GIFBlade({
      format: 'gif',
      label: 'animated GIF (.gif)',
      supportsClipboard: false,
      defaultOptions: {
        frameCount: 300,
        frameRate: 60,
        scale: 1,
        repeat: 0,
      },
    }),
  },
  {
    format: 'video',
    label: 'video (.webm)',
    supportsClipboard: false,
    createBlade: () => new VideoBlade({
      format: 'video',
      label: 'video (.webm)',
      supportsClipboard: false,
      defaultOptions: {
        frameCount: 480,
        frameRate: 60,
        quality: 0.7,
      },
    }),
  },
];

export function getExportFormatDefinitions(): ReadonlyArray<FormatDefinition<ExportFormat>> {
  return DEFINITIONS;
}
