/**
 * @title ExportPlugin.init
 * @author humanbydefinition
 * @description Installs ExportPlugin and reveals its overlay.
 */
const size = window.innerWidth < 700 ? 8 : 16;
const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: size,
	plugins: [ExportPlugin],
});

const RAMP = ' .:-=+*#%@';
const labelLayer = t.layers.add({ fontSize: size });
t.exportOverlay.show();
t.exportOverlay.setPosition({
	offsetX: Math.max(8, window.innerWidth - 280),
	offsetY: Math.max(8, window.innerHeight - 310),
});

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
	t.background('#050914');
	const time = t.frameCount * 0.028;
	const halfW = Math.floor(t.grid.cols / 2);
	const halfH = Math.floor(t.grid.rows / 2);

	for (let y = -halfH + 1; y < halfH; y++) {
		for (let x = -halfW + 1; x < halfW; x++) {
			const distance = Math.hypot(x + 8, y - 1);
			const rings = 0.5 + 0.5 * Math.sin(distance * 0.38 - time * 2.2);
			const sweep = 0.5 + 0.5 * Math.sin((x - y) * 0.16 + time);
			const value = rings * 0.72 + sweep * 0.28;
			if (value < 0.12) continue;
			t.push();
			t.translate(x, y, 0);
			t.char(RAMP[Math.min(RAMP.length - 1, Math.floor(value * RAMP.length))]);
			t.charColor(value > 0.72 ? '#ffd166' : value > 0.38 ? '#54e6c1' : '#3b5b86');
			t.cellColor('#071326');
			t.point();
			t.pop();
		}
	}

	t.char('+');
	t.charColor('#9ad7ff');
	t.point(-halfW + 4, -halfH + 4);
	t.point(halfW - 4, -halfH + 4);
	t.point(-halfW + 4, halfH - 4);
	t.point(halfW - 4, halfH - 4);
	t.char('@');
	t.charColor('#fff0a6');
	t.translate(Math.sin(time * 0.7) * 12, Math.cos(time * 0.9) * 5, 0);
	t.point();
});

labelLayer.draw(() => {
	t.clear();
	drawLabel([
		['EXPORTPLUGIN.INIT', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: EXPORT OVERLAY', [140, 210, 255]],
		['Plugin exposes the EXPORT API.', [140, 160, 190]],
		['Overlay opens with all formats.', [140, 160, 190]],
		['------------------------------------', [70, 100, 140]],
		[`OVERLAY: ${t.exportOverlay.isVisible() ? 'VISIBLE' : 'HIDDEN'}`, [140, 255, 200]],
	]);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
