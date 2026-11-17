/**
 * @title ExportPlugin.init
 * @author humanbydefinition
 * @description Installs ExportPlugin and demonstrates the overlay visibility controls.
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
	t.background(5, 9, 20);
	t.printAlign('left', 'top');
	for (let i = 0; i < 70; i++) {
		const angle = i * 0.61 + Math.sin(t.frameCount * 0.03) * 0.15;
		const radius = 3 + (i % 17);
		const lit = i % 6 === 0;
		t.charColor(lit ? 90 : 42, lit ? 220 : 120, 190);
		t.print(lit ? '#' : '+', Math.round(-16 + Math.cos(angle) * radius), Math.round(7 + Math.sin(angle) * radius));
	}
	for (const button of buttons) {
		t.push();
		t.translate(button.x, 0);
		t.cellColor(24, 34, 58);
		t.rect(button.label.length + 2, 3);
		t.charColor(120, 240, 180);
		t.printAlign('center', 'center');
		t.print(button.label, 0, 0);
		t.pop();
	}
});

let lastTouch = -Infinity;
function gesture(x, y, touch = false) {
	if (!touch && performance.now() - lastTouch < 600) return;
	if (touch) lastTouch = performance.now();
	const button = buttons.find((item) => Math.abs(x - item.x) <= item.label.length / 2 + 1 && Math.abs(y) <= 1.5);
	if (!button) return;
	if (button.label === 'SHOW') t.exportOverlay.show();
	if (button.label === 'HIDE') t.exportOverlay.hide();
	if (button.label === 'TOGGLE') t.exportOverlay.toggle();
}
t.mousePressed(({ position }) => gesture(position.x, position.y));
t.touchStarted(({ touch }) => gesture(touch.x, touch.y, true));

labelLayer.draw(() => {
	t.clear();
	const visibility = t.exportOverlay.isVisible() ? 'VISIBLE' : 'HIDDEN';
	drawLabel([
		['EXPORTPLUGIN.INIT', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: OVERLAY CONTROL', [140, 210, 255]],
		['Click a deck button to call one.', [140, 160, 190]],
		['------------------------------------', [70, 100, 140]],
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
