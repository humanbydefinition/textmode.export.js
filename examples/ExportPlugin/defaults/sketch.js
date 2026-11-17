/**
 * @title ExportPlugin.defaults
 */
const size = window.innerWidth < 700 ? 8 : 16;
const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: size,
	plugins: [ExportPlugin],
});
const labelLayer = t.layers.add({ fontSize: size });
t.exportOverlay.show();
const placeOverlay = () =>
	t.exportOverlay.setPosition({
		offsetX: Math.max(8, window.innerWidth - 260),
		offsetY: Math.max(8, window.innerHeight - 320),
	});
placeOverlay();
const presets = [
	{ name: 'TXT', x: -18, y: 1, patch: { format: 'txt', txt: { preserveTrailingSpaces: true } } },
	{ name: 'JSON', x: -9, y: 1, patch: { format: 'json', json: { target: 'selected', pretty: false } } },
	{ name: 'IMAGE', x: 0, y: 1, patch: { format: 'image', image: { format: 'webp', scale: 2 } } },
	{ name: 'SVG', x: -18, y: 7, patch: { format: 'svg', svg: { drawMode: 'stroke' } } },
	{ name: 'GIF', x: -9, y: 7, patch: { format: 'gif', gif: { frameRate: 24 } } },
	{ name: 'VIDEO', x: 0, y: 7, patch: { format: 'video', video: { format: 'webm', frameRate: 30 } } },
];
const controlShift = () => (window.innerWidth < 700 ? -9 : 0);
function drawTile(preset, active, pulse) {
	t.push();
	t.translate(preset.x, preset.y + controlShift());
	t.cellColor(active ? 65 : 28, active ? 70 + pulse * 25 : 35, active ? 115 : 62);
	t.rect(preset.name.length + 2, 3);
	t.charColor(active ? 255 : 170, active ? 235 : 190, active ? 190 : 225);
	t.printAlign('center', 'center');
	t.print(preset.name, 0, 0);
	t.pop();
}
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
	t.background(12, 8, 24);
	const activeFormat = t.exportOverlay.getDefaults().format;
	const pulse = 0.5 + 0.5 * Math.sin(t.frameCount * 0.08);
	t.printAlign('center', 'center');
	t.charColor(75, 80, 135);
	for (let x = -23; x <= 5; x++) {
		const wave = Math.round(Math.sin(x * 0.4 + t.frameCount * 0.04) * 2);
		t.print(':', x, 10 + controlShift() + wave);
	}
	for (const preset of presets) drawTile(preset, activeFormat === preset.patch.format, pulse);
	t.push();
	t.translate(-9, 13 + controlShift());
	t.cellColor(70, 35, 45);
	t.rect(9, 3);
	t.charColor(255, 200, 80);
	t.print('RESET', 0, 0);
	t.pop();
});
function gesture(x, y) {
	if (Math.abs(x + 9) <= 4.5 && Math.abs(y - 13 - controlShift()) <= 1.5) {
		t.exportOverlay.resetDefaults();
		return;
	}
	const preset = presets.find((item) => Math.abs(x - item.x) <= 4 && Math.abs(y - item.y - controlShift()) <= 1.5);
	if (preset) t.exportOverlay.setDefaults(preset.patch);
}
t.mousePressed(({ position }) => gesture(position.x, position.y));
t.touchStarted(({ touch }) => gesture(touch.x, touch.y));
labelLayer.draw(() => {
	t.clear();
	const activeFormat = t.exportOverlay.getDefaults().format;
	drawLabel([
		['EXPORTPLUGIN.DEFAULTS', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CLICK A TILE OR RESET', [255, 200, 80]],
		[`FORMAT: ${activeFormat.toUpperCase()}`, [140, 255, 200]],
	]);
});
t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const nextSize = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(nextSize);
	for (const layer of t.layers.all) layer.fontSize(nextSize);
	placeOverlay();
});
