/**
 * @title ExportPlugin.layerTargets
 */
const size = window.innerWidth < 700 ? 8 : 16;
const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: size,
	plugins: [ExportPlugin],
});
const glowLayer = t.layers.add({ fontSize: size, blendMode: t.BLEND_SCREEN });
const noteLayer = t.layers.add({ fontSize: size, blendMode: t.BLEND_ADDITIVE });
const labelLayer = t.layers.add({ fontSize: size });
t.exportOverlay.hide();
const targets = [
	{ name: 'NOTE', layer: noteLayer, y: -1 },
	{ name: 'GLOW', layer: glowLayer, y: 6 },
	{ name: 'BASE', layer: t.layers.base, y: 13 },
];
let report = { name: 'BASE', glyphs: 0 };
function drawBand(center, color) {
	const halfCols = Math.floor(t.grid.cols / 2);
	const time = t.frameCount * 0.03;
	for (let x = -halfCols + 2; x <= halfCols - 2; x++) {
		const y = center + Math.round(Math.sin(x * 0.12 + time + center) * 2);
		for (let d = 0; d < 3; d++) {
			t.charColor(color[0] - d * 20, color[1] - d * 25, color[2] - d * 20);
			t.print(d === 0 ? '#' : d === 1 ? '=' : '.', x, y + d);
		}
	}
}
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
	t.background(5, 8, 15);
	t.printAlign('left', 'top');
	const halfCols = Math.floor(t.grid.cols / 2),
		halfRows = Math.floor(t.grid.rows / 2);
	for (let y = -halfRows; y <= halfRows; y++) {
		for (let x = -halfCols; x <= halfCols; x++) {
			const value = Math.sin(x * 0.08 + y * 0.06 + t.frameCount * 0.02) * 0.5 + 0.5;
			if (value < 0.52) continue;
			t.charColor(14 + value * 18, 28 + value * 24, 52 + value * 24);
			t.print(value > 0.78 ? '+' : '.', x, y);
		}
	}
	drawBand(13, [120, 180, 230]);
});
glowLayer.draw(() => {
	t.clear();
	drawBand(6, [255, 190, 80]);
});
noteLayer.draw(() => {
	t.clear();
	drawBand(-1, [120, 240, 180]);
});
function gesture(x, y) {
	const target = targets.find((item) => Math.abs(y - item.y) <= 2);
	if (!target) return;
	const text = t.toString({ layer: target.layer });
	report = { name: target.name, glyphs: text.replace(/\s/g, '').length };
	t.saveStrings({ filename: `layer-${target.name.toLowerCase()}`, layer: target.layer });
}
t.mousePressed(({ position }) => gesture(position.x, position.y));
t.touchStarted(({ touch }) => gesture(touch.x, touch.y));
labelLayer.draw(() => {
	t.clear();
	drawLabel([
		['EXPORTPLUGIN.LAYERTARGETS', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: LAYER DATA EXPORT', [140, 210, 255]],
		['Top to bottom: NOTE, GLOW, BASE.', [140, 160, 190]],
		['CLICK A RIBBON TO SAVE TXT', [255, 200, 80]],
		[`TARGET: ${report.name} / ${report.glyphs} GLYPHS`, [140, 255, 200]],
	]);
});
t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const nextSize = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(nextSize);
	for (const layer of t.layers.all) layer.fontSize(nextSize);
});
