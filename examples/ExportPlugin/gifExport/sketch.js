/**
 * @title ExportPlugin.gifExport
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
const frameCount = 12,
	frameRate = 10;
const controlRow = () => Math.floor(t.grid.rows / 2) - 2;
let status = 'CLICK BLOB OR SAVE',
	busy = false;
function drawLabel(rows) {
	const left = -Math.floor((labelLayer.grid.cols - 1) / 2) + 2;
	const top = -Math.floor(labelLayer.grid.rows / 2) + 2;
	const width = Math.max(...rows.map(([text]) => text.length)) + 2;
	t.printAlign('left', 'top');
	t.push();
	t.cellColor(6, 10, 22);
	t.charColor(6, 10, 22);
	for (let row = 0; row < rows.length + 2; row++) {
		t.print('#'.repeat(width), left, top + row);
	}
	rows.forEach(([text, color], index) => {
		t.charColor(...color);
		t.print(text, left + 1, top + 1 + index);
	});
	t.pop();
}
t.draw(() => {
	t.background(20, 8, 18);
	t.printAlign('left', 'top');
	const time = t.frameCount * 0.05;
	const halfCols = Math.floor(t.grid.cols / 2),
		halfRows = Math.floor(t.grid.rows / 2);
	for (let y = -halfRows; y <= halfRows; y++) {
		for (let x = -halfCols; x <= halfCols; x++) {
			const flow = Math.sin(x * 0.15 + time) * Math.cos(y * 0.12 - time * 1.3);
			const heat = Math.max(0, 0.8 - Math.abs(y - Math.sin(x * 0.12 + time) * 5) * 0.09) + flow * 0.25;
			if (heat < 0.18) continue;
			const value = Math.min(1, heat);
			t.charColor(220 + value * 35, 70 + value * 150, 40 + value * 80);
			t.cellColor(30 + value * 40, 6 + value * 12, 20);
			t.print(' .:-=+*#%@'[Math.floor(value * 9)], x, y);
		}
	}
	t.printAlign('center', 'center');
	t.charColor(255, 210, 140);
	t.print('[ BLOB ]     [ SAVE ]', 0, controlRow());
});
function onProgress(progress) {
	status = `${progress.state.toUpperCase()} ${progress.frameIndex ?? 0}/${progress.totalFrames ?? frameCount}`;
}
async function run(name) {
	if (busy) return;
	busy = true;
	try {
		const options = { frameCount, frameRate, scale: 1, repeat: 0, onProgress };
		if (name === 'BLOB') {
			const blob = await t.toGIFBlob(options);
			status = `GIF ${(blob.size / 1024).toFixed(1)} KB IN MEMORY`;
		} else {
			await t.saveGIF({ ...options, filename: 'lava-loop' });
			status = 'GIF FILE SENT';
		}
	} catch (error) {
		status = error instanceof Error ? error.message : 'GIF EXPORT FAILED';
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
		['EXPORTPLUGIN.GIFEXPORT', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['12F 10FPS: BLOB OR SAVE FILE', [255, 200, 80]],
		[`STATUS: ${status.slice(0, 32)}`, [140, 255, 200]],
	]);
});
t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const nextSize = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(nextSize);
	for (const layer of t.layers.all) layer.fontSize(nextSize);
});
