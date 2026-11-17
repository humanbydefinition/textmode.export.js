/**
 * @title ExportPlugin.zipSequence
 */
const size = window.innerWidth < 700 ? 8 : 16;
const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: size,
	plugins: [ExportPlugin],
});
const labelLayer = t.layers.add({ fontSize: size });
t.exportOverlay.hide();
const frameCount = 8,
	frameRate = 8;
const controlRow = () => Math.floor(t.grid.rows / 2) - 2;
let status = 'CLICK WEIGH OR PACK';
let busy = false;
function drawLabel(rows) {
	const left = -Math.floor(labelLayer.grid.cols / 2) + 2;
	const top = -Math.floor(labelLayer.grid.rows / 2) + 2;
	const width = Math.max(...rows.map(([text]) => text.length)) + 2;
	for (let i = 0; i < width * (rows.length + 2); i++) {
		t.cellColor(6, 10, 22);
		t.charColor(6, 10, 22);
		t.print('#', left + (i % width), top + Math.floor(i / width));
	}
	t.printAlign('left', 'top');
	rows.forEach(([text, color], index) => {
		t.charColor(...color);
		t.print(text, left + 1, top + 1 + index);
	});
}
t.draw(() => {
	t.background(14, 10, 6);
	t.printAlign('left', 'top');
	const time = t.frameCount * 0.2;
	const halfCols = Math.floor(t.grid.cols / 2),
		halfRows = Math.floor(t.grid.rows / 2);
	const gap = (controlRow() - 11 + halfRows) / 6;
	for (let row = 0; row < 7; row++) {
		const y = -halfRows + 6 + row * gap;
		for (let i = 0; i < 9; i++) {
			const x = -halfCols + 2 + ((i * 9 + time * (1 + row * 0.12)) % (t.grid.cols - 8));
			t.charColor(190 + row * 8, 150 + row * 10, 70);
			t.print('[#]', Math.round(x), y);
		}
	}
	t.printAlign('center', 'center');
	t.print('ZIP', halfCols - 7, -halfRows + 3);
	t.print('[ BLOB ]     [ PACK ]', 0, controlRow());
});
function onProgress(progress) {
	status = `${progress.state.toUpperCase()} ${progress.frameIndex}/${progress.totalFrames}`;
}
async function run(name) {
	if (busy) return;
	busy = true;
	try {
		const options = { format: 'png', frameCount, frameRate, frameOptions: { scale: 1 }, onProgress };
		if (name === 'BLOB') {
			const blob = await t.toZipBlob(options);
			status = `ZIP ${(blob.size / 1024).toFixed(1)} KB IN MEMORY`;
		} else {
			await t.saveZip({ ...options, filename: 'packed-frames' });
			status = 'ZIP FILE SENT';
		}
	} catch (error) {
		status = error instanceof Error ? error.message : 'ZIP EXPORT FAILED';
	}
	busy = false;
}
function gesture(x, y) {
	if (Math.abs(x + 7) <= 5 && Math.abs(y - controlRow()) <= 1.5) void run('BLOB');
	if (Math.abs(x - 7) <= 6 && Math.abs(y - controlRow()) <= 1.5) void run('SAVE');
}
t.mousePressed(({ position }) => gesture(position.x, position.y));
t.touchStarted(({ touch }) => gesture(touch.x, touch.y));
labelLayer.draw(() => {
	t.clear();
	drawLabel([
		['EXPORTPLUGIN.ZIPSEQUENCE', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: ZIP FRAME SEQUENCE', [140, 210, 255]],
		['8 PNG frames at 8 fps, scale 1.', [140, 160, 190]],
		['------------------------------------', [70, 100, 140]],
		['CLICK WEIGH ZIP OR PACK ZIP', [255, 200, 80]],
		[`STATUS: ${status.slice(0, 32)}`, [140, 255, 200]],
	]);
});
t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const nextSize = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(nextSize);
	for (const layer of t.layers.all) layer.fontSize(nextSize);
});
