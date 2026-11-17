/**
 * @title ExportPlugin.svgExport
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
const FONT_URL = 'https://cdn.jsdelivr.net/gh/damianvila/font-bescii@main/fonts/v2.0/Bescii-Mono.ttf';
let status = 'LOADING VECTOR FONT';
let ready = false;
t.setup(async () => {
	try {
		// Vector font outlines let the SVG exporter draw the characters as paths.
		await t.loadFont(FONT_URL);
		ready = true;
		status = 'CLICK TO SAVE SVG';
	} catch {
		status = 'FONT LOAD FAILED';
	}
});

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
	t.background(8, 12, 28);
	t.cellColor(0, 0, 0, 0);
	t.printAlign('left', 'top');
	const halfCols = Math.floor(t.grid.cols / 2);
	const halfRows = Math.floor(t.grid.rows / 2);
	for (let y = -halfRows; y <= halfRows; y++) {
		for (let x = -halfCols; x <= halfCols; x++) {
			const ridge = Math.sin(x * 0.15) * 3 + Math.sin(x * 0.06 + 1) * 4;
			const depth = y - ridge;
			if (depth < 0) {
				if ((x * 13 + y * 7) % 37 === 0) {
					t.charColor(240, 205, 150);
					t.print('.', x, y);
				}
				continue;
			}
			const shimmer = Math.sin(x * 0.25 + y * 0.5 - t.frameCount * 0.025);
			t.charColor(55 + depth * 3, 135 + shimmer * 35, 200 + shimmer * 35);
			t.print(shimmer > 0.5 ? '~' : shimmer > -0.4 ? ':' : '.', x, y);
		}
	}
});

function saveLandscape() {
	if (!ready) return;
	try {
		const svg = t.toSVG({ background: 'layer' });
		t.saveSVG({ filename: 'character-landscape', background: 'layer' });
		status = `SVG ${svg.length} CHARS SAVED`;
	} catch (error) {
		status = error instanceof Error ? error.message : 'SVG EXPORT FAILED';
	}
}
t.mousePressed(saveLandscape);
t.touchStarted(saveLandscape);

labelLayer.draw(() => {
	t.clear();
	drawLabel([
		['EXPORTPLUGIN.SVGEXPORT', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: CHARACTER SVG', [140, 210, 255]],
		['A vector font supplies glyph paths.', [140, 160, 190]],
		['toSVG builds; saveSVG downloads.', [140, 160, 190]],
		['CLICK: SAVE SVG', [255, 200, 80]],
		[`STATUS: ${status.slice(0, 32)}`, [140, 255, 200]],
	]);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const nextSize = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(nextSize);
	for (const layer of t.layers.all) layer.fontSize(nextSize);
});
