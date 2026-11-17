/**
 * @title ExportPlugin.canvasStills
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
const controlRow = () => Math.floor(t.grid.rows / 2) - 2;
let status = 'CLICK A SHUTTER',
	busy = false;
const actions = {
	SAVE: async () => {
		await t.saveCanvas({ filename: 'aperture-still', format: 'png', scale: 2 });
		return 'PNG SAVED AT 2X';
	},
	BLOB: async () => {
		const blob = await t.toImageBlob({ format: 'webp', scale: 1 });
		return `WEBP ${(blob.size / 1024).toFixed(1)} KB IN MEMORY`;
	},
	COPY: async () => {
		await t.copyCanvas({ format: 'png' });
		return 'PNG COPIED TO CLIPBOARD';
	},
};
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
	t.background(4, 12, 16);
	t.printAlign('left', 'top');
	const halfCols = Math.floor(t.grid.cols / 2),
		halfRows = Math.floor(t.grid.rows / 2);
	for (let y = -halfRows; y <= halfRows; y++) {
		for (let x = -halfCols; x <= halfCols; x++) {
			const ring = Math.sin(Math.hypot(x * 0.8, y + 1) * 1.1 - t.frameCount * 0.09) * 0.5 + 0.5;
			const value = ring * 0.75 + (Math.sin(Math.atan2(y + 1, x) * 8 + t.frameCount * 0.03) * 0.5 + 0.5) * 0.25;
			t.charColor(50 + value * 160, 150 + value * 100, 200);
			t.cellColor(4, 10 + value * 20, 24);
			t.print('.:-=+*#%@'[Math.floor(value * 8)], x, y);
		}
	}
	t.printAlign('center', 'center');
	t.print('[ SAVE ]  [ BLOB ]  [ COPY ]', 0, controlRow());
});
async function run(name) {
	if (busy) return;
	busy = true;
	try {
		status = await actions[name]();
	} catch (error) {
		status = error instanceof Error ? error.message : 'EXPORT FAILED';
	}
	busy = false;
}
function gesture(x, y) {
	if (Math.abs(x + 10) <= 4 && Math.abs(y - controlRow()) <= 1.5) void run('SAVE');
	if (Math.abs(x) <= 4 && Math.abs(y - controlRow()) <= 1.5) void run('BLOB');
	if (Math.abs(x - 10) <= 4 && Math.abs(y - controlRow()) <= 1.5) void run('COPY');
}
t.mousePressed(({ position }) => gesture(position.x, position.y));
t.touchStarted(({ touch }) => gesture(touch.x, touch.y));
labelLayer.draw(() => {
	t.clear();
	drawLabel([
		['EXPORTPLUGIN.CANVASSTILLS', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CLICK SAVE / BLOB / COPY', [255, 200, 80]],
		[`STATUS: ${status.slice(0, 32)}`, [140, 255, 200]],
	]);
});
t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const nextSize = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(nextSize);
	for (const layer of t.layers.all) layer.fontSize(nextSize);
});
