/**
 * @title ExportPlugin.defaults
 * @author humanbydefinition
 * @description Shows how to override overlay defaults at runtime.
 */
const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 32,
	plugins: [ExportPlugin],
});

// Override the default values pre-filled in the overlay inputs
t.exportOverlay.setDefaults({
	image: { scale: 2 },
	gif: { frameCount: 120, frameRate: 30 },
	video: { frameCount: 240, frameRate: 30, bitrate: 'low' },
});

console.log('Current image defaults:', t.exportOverlay.getDefaults().image);
console.log('Current GIF defaults:', t.exportOverlay.getDefaults().gif);

t.draw(() => {
	t.background(0);

	const time = t.frameCount * 0.01;
	const step = 3;

	t.translate(-t.grid.cols / 2, -t.grid.rows / 2, 0);

	for (let y = 0; y < t.grid.rows; y += step) {
		for (let x = 0; x < t.grid.cols; x += step) {
			t.push();

			const distance = Math.sqrt(x ** 2 + y ** 2);

			const wave = Math.sin(distance * 0.3 - time * 8) * 0.5 + 0.5;

			const wave2 = Math.sin(x * 0.2 + time * 4) * Math.sin(y * 0.15 + time * 3);
			const combined = (wave + wave2 * 0.3) / 1.3;

			if (combined > 0.7) {
				t.char('#');
				t.charColor(255, 200, 100);
			} else if (combined > 0.5) {
				t.char('@');
				t.charColor(200, 150, 255);
			} else if (combined > 0.3) {
				t.char('%');
				t.charColor(100, 255, 200);
			} else if (combined > 0.1) {
				t.char('.');
				t.charColor(150, 100, 255);
			} else {
				t.char(' ');
			}

			t.cellColor(0, 0, 0);
			t.translate(x, y, 0);
			t.rect(step, step);

			t.pop();
		}
	}
});

// Press 'r' to reset default values
t.keyPressed(() => {
	if (t.key === 'r') {
		t.exportOverlay.resetDefaults();
		console.log('Defaults reset to library values');
	}
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
