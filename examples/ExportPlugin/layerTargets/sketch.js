/** @title ExportPlugin.layerTargets */
const size = window.innerWidth < 700 ? 8 : 16;
const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: size,
	plugins: [ExportPlugin],
});
const RAMP = ' .:-=+*#%@';
const energyLayer = t.layers.add({ opacity: 0.9, blendMode: t.BLEND_SCREEN, fontSize: size });
const annotationLayer = t.layers.add({ opacity: 0.95, blendMode: t.BLEND_NORMAL, fontSize: size });
const labelLayer = t.layers.add({ fontSize: size });
t.exportOverlay.setDefaults({ format: 'json', json: { target: 'all', pretty: true } });
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
	t.background('#070b12');
	const halfW = Math.floor(t.grid.cols / 2);
	const halfH = Math.floor(t.grid.rows / 2);
	for (let y = -halfH; y <= halfH; y++) {
		for (let x = -halfW; x <= halfW; x++) {
			const ridge = Math.sin(x * 0.17) * 3 + Math.sin(x * 0.07 + 1) * 4;
			const depth = (y - ridge + halfH * 0.32) / (halfH * 1.1);
			const contour = 0.5 + 0.5 * Math.sin((y - ridge) * 0.72);
			const value = depth > 0 ? Math.min(1, 0.3 + depth * 0.45 + contour * 0.25) : 0;
			if (value < 0.2) continue;
			t.push();
			t.translate(x, y, 0);
			t.char(RAMP[Math.min(RAMP.length - 1, Math.floor(value * RAMP.length))]);
			t.charColor(value > 0.72 ? '#a9b8c9' : '#53657f');
			t.cellColor('#111b29');
			t.point();
			t.pop();
		}
	}
});
energyLayer.draw(() => {
	t.background(0, 0, 0, 0);
	const time = t.frameCount * 0.04;
	for (let x = -Math.floor(energyLayer.grid.cols / 2); x < energyLayer.grid.cols / 2; x += 2) {
		const y = Math.sin(x * 0.25 + time) * 3 - 1;
		t.push();
		t.translate(x, y, 0);
		t.char(x % 6 === 0 ? '*' : '~');
		t.charColor(x % 6 === 0 ? '#ffe082' : '#54e6c1');
		t.cellColor(0, 0, 0, 0);
		t.point();
		t.pop();
	}
});
annotationLayer.draw(() => {
	t.background(0, 0, 0, 0);
	t.charColor('#e8efff');
	t.printAlign('center', 'center');
	t.print('BASE', -Math.min(Math.floor(annotationLayer.grid.cols / 2) - 5, 15), 6);
	t.charColor('#ffd166');
	t.print('ENERGY', Math.min(Math.floor(annotationLayer.grid.cols / 2) - 5, 15), 6);
});

window.inspectStackJSON = () => t.toJSON({ target: 'all' });
window.inspectEnergySVG = () => t.toSVG({ layer: energyLayer, drawMode: 'stroke' });
window.inspectAnnotationsTXT = () => t.toString({ layer: annotationLayer });

labelLayer.draw(() => {
	t.clear();
	drawLabel([
		['EXPORTPLUGIN.LAYERTARGETS', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: LAYERED OUTPUT', [140, 210, 255]],
		['JSON saves the whole stack.', [140, 160, 190]],
		['SVG and TXT target one layer.', [140, 160, 190]],
		['------------------------------------', [70, 100, 140]],
		['DEFAULT TARGET: ALL LAYERS', [140, 255, 200]],
	]);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
