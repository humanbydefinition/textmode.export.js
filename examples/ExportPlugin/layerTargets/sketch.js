/**
 * @title ExportPlugin.layerTargets
 * @author humanbydefinition
 */
const tm = textmode.create({
	canvas: document.getElementById('textmode-canvas'),
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 28,
	plugins: [ExportPlugin],
});

const foregroundLayer = tm.layers.add({
	opacity: 0.85,
	blendMode: 'screen',
});

const annotationLayer = tm.layers.add({
	opacity: 0.95,
	blendMode: 'normal',
});

function drawGridBackground() {
	tm.background('#080a0f');
	tm.translate(-tm.grid.cols / 2, -tm.grid.rows / 2, 0);

	for (let y = 0; y < tm.grid.rows + 1; y++) {
		for (let x = 0; x < tm.grid.cols + 1; x++) {
			const checker = (x + y) % 2 === 0;
			tm.char(checker ? '.' : ' ');
			tm.charColor(checker ? '#253044' : '#131823');
			tm.cellColor(checker ? '#070b12' : '#0b1018');
			tm.translate(x, y, 0);
			tm.point();
			tm.translate(-x, -y, 0);
		}
	}
}

function drawOrbitingMarks(layerGrid, char, color, phase) {
	const time = tm.frameCount * 0.025 + phase;
	const count = 18;

	for (let i = 0; i < count; i++) {
		const angle = time + (Math.PI * 2 * i) / count;
		const radiusX = layerGrid.cols * 0.25;
		const radiusY = layerGrid.rows * 0.28;
		const x = Math.cos(angle) * radiusX;
		const y = Math.sin(angle * 1.7) * radiusY;

		tm.push();
		tm.translate(x, y, 0);
		tm.char(char);
		tm.charColor(color);
		tm.cellColor(0, 0, 0, 0);
		tm.rotateZ(angle * 40);
		tm.rect(2, 2);
		tm.pop();
	}
}

tm.draw(() => {
	tm.push();
	drawGridBackground();
	tm.pop();

	tm.push();
	tm.translate(0, -tm.grid.rows * 0.18, 0);
	tm.char('B');
	tm.charColor('#d7e7ff');
	tm.cellColor('#142036');
	tm.rect(10, 3);
	tm.pop();
});

foregroundLayer.draw(() => {
	tm.background(0, 0, 0, 0);
	drawOrbitingMarks(foregroundLayer.grid, '*', '#66ffd8', 0);
	drawOrbitingMarks(foregroundLayer.grid, '+', '#ff73c7', Math.PI * 0.5);
});

annotationLayer.draw(() => {
	tm.background(0, 0, 0, 0);

	tm.push();
	tm.translate(-annotationLayer.grid.cols * 0.34, annotationLayer.grid.rows * 0.3, 0);
	tm.char('A');
	tm.charColor('#101820');
	tm.cellColor('#f6e27a');
	tm.rect(7, 2);
	tm.pop();

	tm.push();
	tm.translate(annotationLayer.grid.cols * 0.3, annotationLayer.grid.rows * 0.3, 0);
	tm.char('L');
	tm.charColor('#eef4ff');
	tm.cellColor('#6246ea');
	tm.rect(7, 2);
	tm.pop();
});

window.exportBaseJSON = () => tm.saveJSON({ filename: 'base-layer', layer: tm.layers.base });
window.exportForegroundSVG = () => tm.saveSVG({ filename: 'foreground-layer', layer: foregroundLayer });
window.exportAnnotationTXT = () => tm.saveStrings({ filename: 'annotation-layer', layer: annotationLayer });

tm.windowResized(() => {
	tm.resizeCanvas(window.innerWidth, window.innerHeight);
});
