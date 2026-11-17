/**
 * @title ExportPlugin.overlayPosition
 * @author humanbydefinition
 * @description Moves the export overlay with setPosition and reads or resets its placement.
 */
const size = window.innerWidth < 700 ? 8 : 16;
const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: size,
	plugins: [ExportPlugin],
});
const labelLayer = t.layers.add({ fontSize: size });
// Clear any saved placement, then start the overlay on the board.
t.exportOverlay.resetPosition();
const placeOverlay = () =>
	t.exportOverlay.setPosition({
		offsetX: Math.max(8, Math.min(window.innerWidth - 260, Math.round(window.innerWidth * 0.5))),
		offsetY: Math.max(8, window.innerHeight - 340),
	});
placeOverlay();
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
	t.background(4, 8, 18);
	const time = t.frameCount * 0.035;
	t.printAlign('left', 'top');
	for (let i = 0; i < 64; i++) {
		const angle = i * 0.45 + time;
		const radius = 3 + (i % 8) * 2;
		const lit = i % 4 === 0;
		t.charColor(lit ? 255 : 54, lit ? 200 : 120, lit ? 90 : 170);
		t.print(
			lit ? '+' : '.',
			Math.round(15 + Math.cos(angle) * radius),
			Math.round(2 + Math.sin(angle) * radius * 0.7)
		);
	}
	t.push();
	t.translate(-15, 13);
	t.cellColor(52, 24, 34);
	t.rect(14, 3);
	t.charColor(255, 200, 80);
	t.printAlign('center', 'center');
	t.print('HOME / RESET', 0, 0);
	t.pop();
});

let lastTouch = -Infinity;
function gesture(x, y, clientX, clientY, touch = false) {
	if (!touch && performance.now() - lastTouch < 600) return;
	if (touch) lastTouch = performance.now();
	if (Math.abs(x + 15) <= 7 && Math.abs(y - 13) <= 1.5) {
		t.exportOverlay.resetPosition();
		return;
	}
	const rect = t.canvas.getBoundingClientRect();
	t.exportOverlay.setPosition({ offsetX: clientX - rect.left, offsetY: clientY - rect.top });
}
t.mousePressed(({ position, originalEvent }) =>
	gesture(position.x, position.y, originalEvent.clientX, originalEvent.clientY)
);
t.touchStarted(({ touch }) => gesture(touch.x, touch.y, touch.clientX, touch.clientY, true));

labelLayer.draw(() => {
	t.clear();
	const position = t.exportOverlay.getPosition();
	drawLabel([
		['EXPORTPLUGIN.OVERLAYPOSITION', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: OVERLAY PLACEMENT', [140, 210, 255]],
		['Click the board: setPosition().', [140, 160, 190]],
		['HOME: resetPosition() clears it.', [140, 160, 190]],
		['------------------------------------', [70, 100, 140]],
		['CLICK BOARD OR HOME / RESET', [255, 200, 80]],
		[`POS: ${position.mode.toUpperCase()} ${position.offsetX},${position.offsetY}`, [140, 255, 200]],
	]);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const nextSize = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(nextSize);
	for (const layer of t.layers.all) layer.fontSize(nextSize);
	placeOverlay();
});
