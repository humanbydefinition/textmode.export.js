/**
 * @name [textmode.js] Animated Wave Pattern
 * @description A sine wave interference pattern using character-based graphics.
 * @author humanbydefinition
 * @link https://github.com/humanbydefinition/textmode.js
 */

import { textmode } from 'textmode.js';
import { createTextmodeExportPlugin } from 'textmode.export.js';

// Create textmode instance
const tm = textmode.create({
    width: window.innerWidth,
    height: window.innerHeight,
    fontSize: 32,
    plugins: [createTextmodeExportPlugin({ overlay: true })],
});

console.log(textmode.version);

tm.draw(() => {
    tm.background(0);

    const time = tm.frameCount * 0.01;
    const step = 3;

    tm.translate(-tm.grid.cols / 2, -tm.grid.rows / 2, 0);
    
    for (let y = 0; y < tm.grid.rows; y += step) {
        for (let x = 0; x < tm.grid.cols; x += step) {
            tm.push();
            
            // Calculate distance from center (center is now at 0,0,0)
            const distance = Math.sqrt(x ** 2 + y ** 2);
            
            // Create ripple effect
            const wave = Math.sin(distance * 0.3 - time * 8) * 0.5 + 0.5;
            
            // Add secondary wave for interference
            const wave2 = Math.sin(x * 0.2 + time * 4) * Math.sin(y * 0.15 + time * 3);
            const combined = (wave + wave2 * 0.3) / 1.3;
            
            // Map to characters based on wave intensity
            if (combined > 0.7) {
                tm.char('#');
                tm.charColor(255, 200, 100);
            } else if (combined > 0.5) {
                tm.char('@');
                tm.charColor(200, 150, 255);
            } else if (combined > 0.3) {
                tm.char('%');
                tm.charColor(100, 255, 200);
            } else if (combined > 0.1) {
                tm.char('.');
                tm.charColor(150, 100, 255);
            } else {
                tm.char(' ');
            }
            
            tm.cellColor(0, 0, 0);
            tm.translate(x, y, 0);
            tm.rect(step, step);
            
            tm.pop();
        }
    }
});

tm.windowResized(() => {
    tm.resizeCanvas(window.innerWidth, window.innerHeight);
});