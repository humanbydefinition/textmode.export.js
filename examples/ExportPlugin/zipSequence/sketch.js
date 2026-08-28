/**
 * @title ExportPlugin.zipSequence
 * @author humanbydefinition
 * @description Press Z to export a deterministic PNG frame sequence as a ZIP archive.
 */
const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 16,
	plugins: [ExportPlugin],
});

const RAMP = ' .:-=+*#%@';
let exportStatus = 'PRESS Z TO EXPORT 48 PNG FRAMES';

t.draw(() => {
	t.background('#071018');
	const time = t.frameCount / 24;
	const halfW = Math.floor(t.grid.cols / 2);
	const halfH = Math.floor(t.grid.rows / 2);

	for (let y = -halfH + 3; y < halfH - 3; y++) {
		for (let x = -halfW + 2; x < halfW - 2; x++) {
			const wave = 0.5 + 0.5 * Math.sin(Math.hypot(x, y) * 0.5 - time * 4 + Math.atan2(y, x) * 3);
			if (wave < 0.22) continue;
			t.push();
			t.char(RAMP[Math.floor(wave * (RAMP.length - 1))]);
			t.charColor(wave > 0.72 ? '#ffe08a' : '#60d8c4');
			t.cellColor('#0c1d2b');
			t.point(x, y);
			t.pop();
		}
	}

	t.push();
	t.printAlign('center', 'bottom');
	t.charColor('#d7e8ef');
	t.print(exportStatus, 0, halfH - 1);
	t.pop();
});

async function exportZipSequence() {
	try {
		exportStatus = 'CAPTURING 0/48';
		await t.saveZip({
			format: 'png',
			filename: 'textmode-wave-frames',
			frameCount: 48,
			frameRate: 24,
			frameOptions: { scale: 1 },
			onProgress: ({ state, frameIndex, totalFrames }) => {
				exportStatus = `${state.toUpperCase()} ${frameIndex}/${totalFrames}`;
			},
		});
		exportStatus = 'ZIP DOWNLOAD STARTED';
	} catch (error) {
		exportStatus = error instanceof Error ? error.message.toUpperCase() : 'ZIP EXPORT FAILED';
	}
}

t.keyPressed((data) => {
	if (data.key.toLowerCase() === 'z') void exportZipSequence();
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
