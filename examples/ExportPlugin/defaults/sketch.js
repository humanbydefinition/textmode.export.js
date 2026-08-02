/**
 * @title ExportPlugin.defaults
 * @author humanbydefinition
 * @description Changes overlay defaults and restores them with a key press.
 */
const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 16,
	plugins: [ExportPlugin],
});

const labelLayer = t.layers.add();
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

function drawText(text, x, y, color = '#a9b7d0') {
	t.push();
	t.printAlign('left', 'top');
	t.charColor(color);
	t.print(text, x, y);
	t.pop();
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
	const left = -Math.floor(t.grid.cols / 2),
		top = -Math.floor(t.grid.rows / 2);
	const x = left + 3;
	let y = top + 3;
	drawText('EXPORTPLUGIN.DEFAULTS', x, y++, '#64f2c2');
	drawText('------------------------------------', x, y++, '#5b3f76');
	drawText('CONCEPT: DEFAULT VALUES', x, y++, '#d3a6f2');
	drawText('Keys apply a format preset.', x, y++);
	drawText('R restores curated values.', x, y++);
	drawText('------------------------------------', x, y++, '#5b3f76');
	drawText('ACTIVE FORMAT:', x, y, '#ffcf70');
	drawText(t.exportOverlay.getDefaults().format.toUpperCase(), x + 15, y, '#fff4cf');
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
