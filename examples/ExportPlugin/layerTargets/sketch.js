/**
 * @title ExportPlugin.layerTargets
 * @author humanbydefinition
 * @description Exports a layered scene as a selected layer or full stack.
 */
const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 16,
	plugins: [ExportPlugin],
});

const RAMP = ' .:-=+*#%@';
const energyLayer = t.layers.add({ opacity: 0.9, blendMode: t.BLEND_SCREEN });
const annotationLayer = t.layers.add({ opacity: 0.95, blendMode: t.BLEND_NORMAL });
const labelLayer = t.layers.add();
t.exportOverlay.setDefaults({ format: 'json', json: { target: 'all', pretty: true } });
t.exportOverlay.show();
t.exportOverlay.setPosition({
	offsetX: Math.max(8, window.innerWidth - 280),
	offsetY: Math.max(8, window.innerHeight - 310),
});

function drawText(text, x, y, color = '#a9b7d0') {
	t.push();
	t.printAlign('left', 'top');
	t.charColor(color);
	t.print(text, x, y);
	t.pop();
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
	const left = -Math.floor(t.grid.cols / 2);
	const top = -Math.floor(t.grid.rows / 2);
	const x = left + 3;
	let y = top + 3;
	drawText('EXPORTPLUGIN.LAYERTARGETS', x, y++, '#64f2c2');
	drawText('------------------------------------', x, y++, '#345273');
	drawText('CONCEPT: LAYERED OUTPUT', x, y++, '#8fcae8');
	drawText('JSON can save the whole stack.', x, y++);
	drawText('SVG and TXT can target one layer.', x, y++);
	drawText('------------------------------------', x, y++, '#345273');
	drawText('TARGET: ALL LAYERS', x, y, '#ffd166');
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
