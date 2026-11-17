/**
 * @title ExportPlugin.jsonSequence
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
const frameCount = 4,
	frameRate = 4;
const controlRow = () => Math.floor(t.grid.rows / 2) - 2;
let status = 'CLICK BLOB OR SAVE';
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
	t.printAlign('left', 'top');
	const time = t.frameCount * 0.04;
	const halfCols = Math.floor(t.grid.cols / 2),
		halfRows = Math.floor(t.grid.rows / 2);
	for (let y = -halfRows; y <= halfRows; y++) {
		for (let x = -halfCols; x <= halfCols; x++) {
			const distance = Math.hypot(x * 0.7, y);
			const angle = Math.atan2(y, x);
			const value = Math.sin(distance * 0.8 - time * 3 + Math.sin(angle * 4 + time) * 2) * 0.5 + 0.5;
			t.charColor(120 + value * 130, 100 + value * 100, 255);
			t.cellColor(10, 6 + value * 20, 30 + value * 20);
			t.print(' .:-=+*#%@'[Math.floor(value * 9)], x, y);
		}
	}
	t.printAlign('center', 'center');
	t.charColor(220, 190, 255);
	t.print('[ BLOB ]', -10, controlRow());
	t.print('[ SAVE FILE ]', 8, controlRow());
});
function onProgress(progress) {
	status = `${progress.state.toUpperCase()} ${progress.frameIndex}/${progress.totalFrames}`;
}
async function run(name) {
	if (busy) return;
	busy = true;
	try {
		const options = { frameCount, frameRate, target: 'selected', layer: t.layers.base, pretty: false, onProgress };
		if (name === 'BLOB') {
			const blob = await t.toJSONSequenceBlob({ ...options, pretty: false, includeMetadata: false });
			status = `BLOB ${(blob.size / 1048576).toFixed(2)} MB`;
		} else {
			await t.saveJSONSequence({ ...options, filename: 'flipbook-sequence' });
			status = 'JSON SEQUENCE SENT';
		}
	} catch (error) {
		status = error instanceof Error ? error.message : 'SEQUENCE FAILED';
	}
	busy = false;
}
function gesture(x, y) {
	if (Math.abs(x + 10) <= 4 && Math.abs(y - controlRow()) <= 1.5) void run('BLOB');
	if (Math.abs(x - 8) <= 6 && Math.abs(y - controlRow()) <= 1.5) void run('SAVE');
}
t.mousePressed(({ position }) => gesture(position.x, position.y));
t.touchStarted(({ touch }) => gesture(touch.x, touch.y));
labelLayer.draw(() => {
	t.clear();
	drawLabel([
		['EXPORTPLUGIN.JSONSEQUENCE', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['4 frames, 4 fps; blob or download.', [140, 160, 190]],
		['CLICK BLOB OR SAVE FILE', [255, 200, 80]],
		[`STATUS: ${status.slice(0, 32)}`, [140, 255, 200]],
	]);
});
t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const nextSize = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(nextSize);
	for (const layer of t.layers.all) layer.fontSize(nextSize);
});
