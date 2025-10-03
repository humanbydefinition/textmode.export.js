declare module 'webm-writer' {
  interface WebMWriterOptions {
    quality?: number;
    alphaQuality?: number;
    transparent?: boolean;
    frameDuration?: number;
    frameRate?: number;
    fileWriter?: unknown;
    fd?: unknown;
  }

  class WebMWriter {
    constructor(options?: WebMWriterOptions);
    addFrame(
      frame: HTMLCanvasElement | string,
      alphaOrDuration?: HTMLCanvasElement | string | number,
      durationOverrideMs?: number
    ): void;
    complete(): Promise<Blob>;
    getWrittenSize(): number;
  }

  export default WebMWriter;
}
