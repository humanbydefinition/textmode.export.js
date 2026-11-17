/**
 * @title ExportPlugin.videoExport
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
	frameRate = 12;
const controlRow = () => Math.floor(t.grid.rows / 2) - 2;
let status = 'CLICK BLOB OR SAVE';
let busy = false;
function drawLabel(rows) {
	const left = -Math.floor(labelLayer.grid.cols / 2) + 2;
	const top = -Math.floor(labelLayer.grid.rows / 2) + 2;
	const width = Math.max(...rows.map(([text]) => text.length)) + 2;
	t.push();
	t.translate(left + width / 2, top + (rows.length + 2) / 2);
	t.cellColor(6, 10, 22);
	t.rect(width, rows.length + 2);
	t.pop();
	t.printAlign('left', 'top');
	rows.forEach(([text, color], index) => {
		t.charColor(...color);
		t.print(text, left + 1, top + 1 + index);
	});
}
t.draw(() => {
	t.printAlign('left', 'top');
	const halfCols = Math.floor(t.grid.cols / 2),
		halfRows = Math.floor(t.grid.rows / 2);
	for (let y = -halfRows; y <= halfRows; y++) {
		for (let x = -halfCols; x <= halfCols; x++) {
			const bar = Math.floor(((x + halfCols) / t.grid.cols) * 7);
			const scan = Math.sin((y + t.frameCount * 0.24) * 0.6) > -0.2 ? 1 : 0.5;
			const red = 120 + 135 * Math.sin(bar * 0.9 + 0.2);
			const green = 120 + 135 * Math.sin(bar * 0.9 + 2.1);
			const blue = 120 + 135 * Math.sin(bar * 0.9 + 4.2);
			t.charColor(red * scan, green * scan, blue * scan);
			t.cellColor(red * 0.12, green * 0.12, blue * 0.12);
			t.print(scan === 1 ? '#' : '-', x, y);
		}
	}
	t.printAlign('center', 'center');
	t.print('[ BLOB ]     [ SAVE ]', 0, controlRow());
});
function onProgress(progress) {
	const phase = progress.phase ?? progress.state;
	status = `${phase.toUpperCase()} ${progress.frame ?? progress.frameIndex ?? 0}/${progress.totalFrames ?? frameCount}`;
}
async function run(name) {
	if (busy) return;
	busy = true;
	try {
		const options = { format: 'webm', frameCount, frameRate, quality: 'low', pixelDensity: 1, onProgress };
		if (name === 'BLOB') {
			const blob = await t.toVideoBlob(options);
			status = `WEBM ${(blob.size / 1024).toFixed(1)} KB IN MEMORY`;
		} else {
			await t.saveVideo({ ...options, filename: 'test-card' });
			status = 'WEBM FILE SENT';
		}
	} catch (error) {
		status = error instanceof Error ? error.message : 'VIDEO EXPORT FAILED';
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
		['EXPORTPLUGIN.VIDEOEXPORT', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['12F 12FPS: BLOB OR SAVE FILE', [255, 200, 80]],
		[`STATUS: ${status.slice(0, 32)}`, [140, 255, 200]],
	]);
});
t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const nextSize = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(nextSize);
	for (const layer of t.layers.all) layer.fontSize(nextSize);
});
