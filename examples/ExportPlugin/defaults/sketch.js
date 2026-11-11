/** @title ExportPlugin.defaults */
const size = window.innerWidth < 700 ? 8 : 16;
const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: size,
	plugins: [ExportPlugin],
});
const labelLayer = t.layers.add({ fontSize: size });
t.exportOverlay.setDefaults({ format: 'image', image: { format: 'png', scale: 2 } });
t.exportOverlay.show();
const presets = [
	['1', 'txt', '1 TXT', '='],
	['2', 'image', '2 IMAGE', '@'],
	['3', 'svg', '3 SVG', '#'],
	['4', 'gif', '4 GIF', '*'],
	['5', 'json', '5 JSON', '{'],
	['6', 'video', '6 VIDEO', '~'],
];
function applyPreset(value) {
	if (value === 'txt') t.exportOverlay.setDefaults({ format: value, txt: { preserveTrailingSpaces: true } });
	if (value === 'image') t.exportOverlay.setDefaults({ format: value, image: { scale: 2 } });
	if (value === 'svg') t.exportOverlay.setDefaults({ format: value, svg: { drawMode: 'stroke' } });
	if (value === 'gif') t.exportOverlay.setDefaults({ format: value, gif: { frameRate: 24 } });
	if (value === 'json') t.exportOverlay.setDefaults({ format: value, json: { target: 'all' } });
	if (value === 'video') t.exportOverlay.setDefaults({ format: value, video: { frameRate: 30 } });
}
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
	t.background('#0a0712');
	const active = t.exportOverlay.getDefaults().format;
	const span = Math.max(8, Math.min(18, Math.floor(t.grid.cols / 4)));
	const pulse = 0.5 + 0.5 * Math.sin(t.frameCount * 0.06);

	for (let i = 0; i < presets.length; i++) {
		const item = presets[i];
		const x = ((i % 3) - 1) * span;
		const y = Math.floor(i / 3) * 8 - 4;
		const selected = active === item[1];
		t.push();
		t.translate(x, y, 0);
		t.char(item[3]);
		t.charColor(selected ? '#fff4cf' : '#b99bca');
		t.cellColor(selected ? '#51273a' : '#171022');
		t.rect(10, 4);
		t.pop();
		t.push();
		t.printAlign('center', 'center');
		t.charColor(selected ? '#fff4cf' : '#d0bddb');
		t.print(item[2], x, y);
		t.pop();
		if (selected) {
			t.push();
			t.char('>');
			t.charColor('#ff6b9d');
			t.translate(x + 6, y - 2 + pulse, 0);
			t.point();
			t.pop();
		}
	}
});
t.keyPressed((data) => {
	if (data.key === 'r') t.exportOverlay.resetDefaults();
	const preset = presets.find((item) => item[0] === data.key);
	if (preset) applyPreset(preset[1]);
});
labelLayer.draw(() => {
	t.clear();
	drawLabel([
		['EXPORTPLUGIN.DEFAULTS', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: OVERLAY DEFAULTS', [140, 210, 255]],
		['Format and options are preset.', [140, 160, 190]],
		['Reset restores curated values.', [140, 160, 190]],
		['------------------------------------', [70, 100, 140]],
		['KEYS 1-6 PRESET, R RESET', [255, 200, 80]],
		[`ACTIVE FORMAT: ${t.exportOverlay.getDefaults().format.toUpperCase()}`, [140, 255, 200]],
	]);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
