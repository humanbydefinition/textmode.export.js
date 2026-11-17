/**
 * @title ExportPlugin.overlayPosition
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
	t.background(8, 12, 24);
	t.printAlign('left', 'top');
	const halfCols = Math.floor(t.grid.cols / 2);
	const halfRows = Math.floor(t.grid.rows / 2);
	for (let y = -halfRows; y <= halfRows; y++) {
		for (let x = -halfCols; x <= halfCols; x++) {
			if (x % 4 !== 0 || y % 3 !== 0) continue;
			t.charColor(38, 72, 100);
			t.print('+', x, y);
		}
	}
	const position = t.exportOverlay.getPosition();
	const markerX = Math.round((position.offsetX / window.innerWidth) * t.grid.cols - halfCols);
	const markerY = Math.round((position.offsetY / window.innerHeight) * t.grid.rows - halfRows);
	t.charColor(255, 190, 80);
	t.print('[+]', markerX, markerY);
	t.push();
	t.translate(-halfCols + 9, halfRows - 3);
	t.cellColor(70, 38, 28);
	t.rect(14, 3);
	t.charColor(255, 210, 120);
	t.printAlign('center', 'center');
	t.print('HOME / RESET', 0, 0);
	t.pop();
});

function gesture(x, y, clientX, clientY) {
	const homeX = -Math.floor(t.grid.cols / 2) + 9;
	const homeY = Math.floor(t.grid.rows / 2) - 3;
	if (Math.abs(x - homeX) <= 7 && Math.abs(y - homeY) <= 1.5) {
		t.exportOverlay.resetPosition();
		return;
	}
	const rect = t.canvas.getBoundingClientRect();
	t.exportOverlay.setPosition({ offsetX: clientX - rect.left, offsetY: clientY - rect.top });
}
t.mousePressed(({ position, originalEvent }) =>
	gesture(position.x, position.y, originalEvent.clientX, originalEvent.clientY)
);
t.touchStarted(({ touch }) => gesture(touch.x, touch.y, touch.clientX, touch.clientY));

labelLayer.draw(() => {
	t.clear();
	const position = t.exportOverlay.getPosition();
	drawLabel([
		['EXPORTPLUGIN.OVERLAYPOSITION', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: OVERLAY PLACEMENT', [140, 210, 255]],
		['Click the board: setPosition().', [140, 160, 190]],
		['CLICK BOARD OR HOME / RESET', [255, 200, 80]],
		[`POS: ${position.mode.toUpperCase()} ${position.offsetX},${position.offsetY}`.slice(0, 40), [140, 255, 200]],
	]);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const nextSize = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(nextSize);
	for (const layer of t.layers.all) layer.fontSize(nextSize);
	placeOverlay();
});
