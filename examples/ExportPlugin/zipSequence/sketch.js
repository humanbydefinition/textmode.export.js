/** @title ExportPlugin.zipSequence */
const size = window.innerWidth < 700 ? 8 : 16;
const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: size,
	plugins: [ExportPlugin],
});

const RAMP = ' .:-=+*#%@';
const labelLayer = t.layers.add({ fontSize: size });
let exportStatus = 'PRESS Z TO EXPORT 48 PNG FRAMES';

function drawLabel(lines) {
	const { cols, rows } = labelLayer.grid;
	const [left, top] = [-Math.floor(cols / 2), -Math.floor(rows / 2)];
	const width = Math.max(...lines.map(([text]) => [...text].length)) + 2;
	t.push();
	t.translate(left + (width + 4) / 2, top + (lines.length + 5) / 2);
	t.cellColor(6, 10, 22);
	t.rect(width, lines.length + 2);
	t.pop();
	t.printAlign('left', 'top');
	lines.forEach(([text, color], i) => {
		t.charColor(color[0], color[1], color[2]);
		t.print(text, left + 3, top + 3 + i);
	});
}

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

labelLayer.draw(() => {
	t.clear();
	drawLabel([
		['EXPORTPLUGIN.ZIPSEQUENCE', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: ZIP FRAME SEQUENCE', [140, 210, 255]],
		['Saves 48 PNG frames as a ZIP.', [140, 160, 190]],
		['Deterministic, 24 fps playback.', [140, 160, 190]],
		['------------------------------------', [70, 100, 140]],
		['PRESS Z: EXPORT 48 FRAMES', [255, 200, 80]],
		[`STATUS: ${exportStatus.slice(0, 32)}`, [140, 255, 200]],
	]);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
