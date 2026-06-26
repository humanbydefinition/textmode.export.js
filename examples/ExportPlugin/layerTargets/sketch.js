/**
 * @title ExportPlugin.layerTargets
 * @author humanbydefinition
 */
const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 28,
	plugins: [ExportPlugin],
});

const foregroundLayer = t.layers.add({
	opacity: 0.85,
	blendMode: 'screen',
});

const annotationLayer = t.layers.add({
	opacity: 0.95,
	blendMode: 'normal',
});

function drawGridBackground() {
	t.background('#080a0f');
	t.translate(-t.grid.cols / 2, -t.grid.rows / 2, 0);

	for (let y = 0; y < t.grid.rows + 1; y++) {
		for (let x = 0; x < t.grid.cols + 1; x++) {
			const checker = (x + y) % 2 === 0;
			t.char(checker ? '.' : ' ');
			t.charColor(checker ? '#253044' : '#131823');
			t.cellColor(checker ? '#070b12' : '#0b1018');
			t.translate(x, y, 0);
			t.point();
			t.translate(-x, -y, 0);
		}
	}
}

function drawOrbitingMarks(layerGrid, char, color, phase) {
	const time = t.frameCount * 0.025 + phase;
	const count = 18;

	for (let i = 0; i < count; i++) {
		const angle = time + (Math.PI * 2 * i) / count;
		const radiusX = layerGrid.cols * 0.25;
		const radiusY = layerGrid.rows * 0.28;
		const x = Math.cos(angle) * radiusX;
		const y = Math.sin(angle * 1.7) * radiusY;

		t.push();
		t.translate(x, y, 0);
		t.char(char);
		t.charColor(color);
		t.cellColor(0, 0, 0, 0);
		t.rotateZ(angle * 40);
		t.rect(2, 2);
		t.pop();
	}
}

t.draw(() => {
	t.push();
	drawGridBackground();
	t.pop();

	t.push();
	t.translate(0, -t.grid.rows * 0.18, 0);
	t.char('B');
	t.charColor('#d7e7ff');
	t.cellColor('#142036');
	t.rect(10, 3);
	t.pop();
});

foregroundLayer.draw(() => {
	t.background(0, 0, 0, 0);
	drawOrbitingMarks(foregroundLayer.grid, '*', '#66ffd8', 0);
	drawOrbitingMarks(foregroundLayer.grid, '+', '#ff73c7', Math.PI * 0.5);
});

annotationLayer.draw(() => {
	t.background(0, 0, 0, 0);

	t.push();
	t.translate(-annotationLayer.grid.cols * 0.34, annotationLayer.grid.rows * 0.3, 0);
	t.char('A');
	t.charColor('#101820');
	t.cellColor('#f6e27a');
	t.rect(7, 2);
	t.pop();

	t.push();
	t.translate(annotationLayer.grid.cols * 0.3, annotationLayer.grid.rows * 0.3, 0);
	t.char('L');
	t.charColor('#eef4ff');
	t.cellColor('#6246ea');
	t.rect(7, 2);
	t.pop();
});

window.inspectBaseJSON = () => t.toJSON({ layer: t.layers.base });
window.inspectForegroundSVG = () => t.toSVG({ layer: foregroundLayer });
window.inspectAnnotationText = () => t.toString({ layer: annotationLayer });

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
