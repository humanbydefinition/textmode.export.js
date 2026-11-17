/**
 * @title ExportPlugin.jsonDocument
 */
const size = window.innerWidth < 700 ? 8 : 16;
const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: size,
	plugins: [ExportPlugin],
});
const motionLayer = t.layers.add({ fontSize: size, blendMode: t.BLEND_ADDITIVE });
const labelLayer = t.layers.add({ fontSize: size });
t.exportOverlay.hide();
let report = { layers: 0, bytes: 0 };
let status = 'CLICK TO BUILD JSON';
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
			const value =
				Math.sin(x * 0.1 + t.frameCount * 0.025) * Math.cos(y * 0.12 - t.frameCount * 0.0175) * 0.5 + 0.5;
			t.charColor(30 + value * 50, 100 + value * 130, 210);
			t.cellColor(4, 8 + value * 20, 26);
			t.print(' .:-=+*#%@'[Math.floor(value * 9)], x, y);
		}
	}
});
motionLayer.draw(() => {
	t.clear();
	t.printAlign('left', 'top');
	const halfCols = Math.floor(t.grid.cols / 2),
		halfRows = Math.floor(t.grid.rows / 2);
	for (let y = -halfRows; y <= halfRows; y++) {
		for (let x = -halfCols; x <= halfCols; x++) {
			const beam = Math.sin((x + y) * 0.16 - t.frameCount * 0.12) * 0.5 + 0.5;
			if (beam < 0.72) continue;
			t.charColor(255, 170 + beam * 60, 90);
			t.print(beam > 0.9 ? '@' : '*', x, y);
		}
	}
});
function buildDocument() {
	try {
		const document = t.toJSON();
		const layers = document.frames[0].layers;
		report.layers = layers.length;
		report.bytes = t.toJSONString({ pretty: false }).length;
		t.saveJSON({ filename: 'prism-stack', pretty: false });
		status = 'ALL-LAYER JSON SENT';
	} catch (error) {
		status = error instanceof Error ? error.message : 'JSON EXPORT FAILED';
	}
}
t.mousePressed(buildDocument);
t.touchStarted(buildDocument);
labelLayer.draw(() => {
	t.clear();
	drawLabel([
		['EXPORTPLUGIN.JSONDOCUMENT', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CLICK: SAVE ALL-LAYER JSON', [255, 200, 80]],
		[`LAYERS: ${report.layers} BYTES: ${report.bytes}`, [140, 255, 200]],
		[`STATUS: ${status.slice(0, 32)}`, [140, 255, 200]],
	]);
});
t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const nextSize = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(nextSize);
	for (const layer of t.layers.all) layer.fontSize(nextSize);
});
