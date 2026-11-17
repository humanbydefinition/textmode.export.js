/**
 * @title ExportPlugin.init
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
const placeOverlay = () =>
	t.exportOverlay.setPosition({
		offsetX: Math.max(8, window.innerWidth - 260),
		offsetY: Math.max(8, window.innerHeight - 320),
	});
placeOverlay();
const buttons = [
	{ label: 'SHOW', x: -18 },
	{ label: 'TOGGLE', x: -9 },
	{ label: 'HIDE', x: 0 },
];

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
	t.background(5, 9, 20);
	t.printAlign('center', 'center');
	const pulse = Math.sin(t.frameCount * 0.04);
	const visible = t.exportOverlay.isVisible();
	for (let y = -4; y <= 15; y++) {
		for (let x = -23; x <= 3; x++) {
			const wave = Math.sin(x * 0.4 + y * 0.7 - t.frameCount * 0.04);
			if (wave < 0.55) continue;
			t.charColor(30, 75 + wave * 45, 115 + wave * 45);
			t.print(wave > 0.85 ? '+' : '.', x, y);
		}
	}
	t.charColor(visible ? 120 : 55, visible ? 240 : 90, visible ? 180 : 120);
	t.print(visible ? '>>> SIGNAL OPEN >>>' : '--- SIGNAL CLOSED ---', -9, 7);
	t.charColor(255, 200 + pulse * 25, 80);
	t.print(visible ? 'TRANSMITTING' : 'STANDBY', -9, 12);
	for (const button of buttons) {
		t.push();
		t.translate(button.x, 0);
		t.cellColor(24, 44, 65);
		t.rect(button.label.length + 2, 3);
		t.charColor(140, 255, 200);
		t.print(button.label, 0, 0);
		t.pop();
	}
});

function gesture(x, y) {
	const button = buttons.find((item) => Math.abs(x - item.x) <= item.label.length / 2 + 1 && Math.abs(y) <= 1.5);
	if (!button) return;
	if (button.label === 'SHOW') t.exportOverlay.show();
	if (button.label === 'HIDE') t.exportOverlay.hide();
	if (button.label === 'TOGGLE') t.exportOverlay.toggle();
}
t.mousePressed(({ position }) => gesture(position.x, position.y));
t.touchStarted(({ touch }) => gesture(touch.x, touch.y));

labelLayer.draw(() => {
	t.clear();
	const visibility = t.exportOverlay.isVisible() ? 'VISIBLE' : 'HIDDEN';
	drawLabel([
		['EXPORTPLUGIN.INIT', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: OVERLAY CONTROL', [140, 210, 255]],
		['Open or close the export panel.', [140, 160, 190]],
		['CLICK SHOW / HIDE / TOGGLE', [255, 200, 80]],
		[`OVERLAY: ${visibility}`, [140, 255, 200]],
	]);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const nextSize = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(nextSize);
	for (const layer of t.layers.all) layer.fontSize(nextSize);
	placeOverlay();
});
