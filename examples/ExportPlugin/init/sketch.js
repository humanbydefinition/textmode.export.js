/**
 * @title ExportPlugin.init
 * @author humanbydefinition
 * @description Installs ExportPlugin and reveals its overlay.
 */
const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 16,
	plugins: [ExportPlugin],
});

const RAMP = ' .:-=+*#%@';
const labelLayer = t.layers.add();
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
	const left = -Math.floor(t.grid.cols / 2);
	const top = -Math.floor(t.grid.rows / 2);
	const x = left + 3;
	let y = top + 3;
	drawText('EXPORTPLUGIN.INIT', x, y++, '#64f2c2');
	drawText('------------------------------------', x, y++, '#345273');
	drawText('CONCEPT: EXPORT OVERLAY', x, y++, '#8fcae8');
	drawText('Plugin exposes the EXPORT API.', x, y++);
	drawText('Overlay opens with all formats.', x, y++);
	drawText('------------------------------------', x, y++, '#345273');
	drawText('STATUS: OVERLAY VISIBLE', x, y, '#ffd166');
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
