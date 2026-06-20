export type GIFRecordingState = 'idle' | 'recording' | 'encoding' | 'completed' | 'error';

/**
 * Progress information emitted during the GIF export process.
 *
 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/GIFExportProgress | GIFExportProgress API reference}
 */
export type GIFExportProgress = {
	/**
	 * Current state of the recording process.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/GIFExportProgress#state | GIFExportProgress.state API reference}
	 */
	state: 'idle' | 'recording' | 'encoding' | 'completed' | 'error';
	/**
	 * Number of frames that have been recorded so far.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/GIFExportProgress#frameindex | GIFExportProgress.frameIndex API reference}
	 */
	frameIndex?: number;
	/**
	 * Total number of frames planned for the recording.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/GIFExportProgress#totalframes | GIFExportProgress.totalFrames API reference}
	 */
	totalFrames?: number;
	/**
	 * Optional status message for UI consumption.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/GIFExportProgress#message | GIFExportProgress.message API reference}
	 */
	message?: string;
};

/**
 * Options for exporting the textmode content to GIF format.
 *
 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/GIFExportOptions | GIFExportOptions API reference}
 */
export type GIFExportOptions = {
	/**
	 * Target filename without extension. Defaults to an auto-generated value.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/GIFExportOptions#filename | GIFExportOptions.filename API reference}
	 */
	filename?: string;
	/**
	 * Desired total number of frames to capture. Defaults to `300`.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/GIFExportOptions#framecount | GIFExportOptions.frameCount API reference}
	 */
	frameCount?: number;
	/**
	 * Target frame rate for the export, in frames per second. Defaults to `60`.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/GIFExportOptions#framerate | GIFExportOptions.frameRate API reference}
	 */
	frameRate?: number;
	/**
	 * Scale factor for the output image.
	 *
	 * `1.0` = original size, `2.0` = double size, `0.5` = half size.
	 *
	 * Defaults to `1.0`.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/GIFExportOptions#scale | GIFExportOptions.scale API reference}
	 */
	scale?: number;
	/**
	 * GIF loop count. 0 = loop forever. Defaults to `0`.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/GIFExportOptions#repeat | GIFExportOptions.repeat API reference}
	 */
	repeat?: number;
	/**
	 * Progress callback invoked throughout the recording lifecycle.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.export.js/type-aliases/GIFExportOptions#onprogress | GIFExportOptions.onProgress API reference}
	 */
	onProgress?: (progress: GIFExportProgress) => void;
};

export interface GIFGenerationOptions {
	filename?: string;
	frameCount: number;
	frameRate: number;
	scale: number;
	repeat: number;
}

export interface GIFFrame {
	imageData: ImageData;
	width: number;
	height: number;
	delayMs?: number;
}
