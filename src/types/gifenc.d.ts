declare module 'gifenc' {
  export type GIFPaletteColor = [number, number, number] | [number, number, number, number];
  export type GIFPalette = GIFPaletteColor[];

  export interface GIFWriteFrameOptions {
    transparent?: boolean;
    transparentIndex?: number;
    delay?: number;
    palette?: GIFPalette;
    repeat?: number;
    colorDepth?: number;
    dispose?: number;
    first?: boolean;
  }

  export interface GIFEncoderInstance {
    reset(): void;
    finish(): void;
    bytes(): Uint8Array;
    bytesView(): Uint8Array;
    readonly buffer: ArrayBufferLike;
    readonly stream: unknown;
    writeHeader(): void;
    writeFrame(indexedPixels: Uint8Array, width: number, height: number, opts?: GIFWriteFrameOptions): void;
  }

  export interface GIFEncoderOptions {
    initialCapacity?: number;
    auto?: boolean;
  }

  export function GIFEncoder(options?: GIFEncoderOptions): GIFEncoderInstance;

  export interface QuantizeOptions {
    format?: 'rgb565' | 'rgb444' | 'rgba4444';
    clearAlpha?: boolean;
    clearAlphaColor?: number;
    clearAlphaThreshold?: number;
    oneBitAlpha?: boolean | number;
    useSqrt?: boolean;
  }

  export function quantize(data: Uint32Array, maxColors: number, options?: QuantizeOptions): GIFPalette;

  export function applyPalette(
    data: Uint32Array,
    palette: GIFPalette,
    format?: 'rgb565' | 'rgb444' | 'rgba4444'
  ): Uint8Array;

  export function prequantize(
    data: Uint32Array,
    options?: {
      roundRGB?: number;
      roundAlpha?: number;
      oneBitAlpha?: boolean | number;
    }
  ): void;

  export function nearestColorIndex(palette: GIFPalette, color: number[]): number;
  export function nearestColor(palette: GIFPalette, color: number[]): number[];
}
