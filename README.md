# textmode.export.js (✿◕‿◕)ﾉ

<div align="center">

| [![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/) | [![API](https://img.shields.io/badge/API-typedoc-3178c6?logo=typescript&logoColor=white)](docs/README.md) [![docs](https://img.shields.io/badge/docs-vitepress-646cff?logo=vitepress&logoColor=white)](https://code.textmode.art/docs/exporting.html) [![Discord](https://img.shields.io/discord/1357070706181017691?color=5865F2&label=Discord&logo=discord&logoColor=white)](https://discord.gg/sjrw8QXNks) | [![ko-fi](https://shields.io/badge/ko--fi-donate-ff5f5f?logo=ko-fi)](https://ko-fi.com/V7V8JG2FY) [![Github-sponsors](https://img.shields.io/badge/sponsor-30363D?logo=GitHub-Sponsors&logoColor=#EA4AAA)](https://github.com/sponsors/humanbydefinition) |
|:-------------|:-------------|:-------------|

</div>

`textmode.export.js` is an add-on library for [`textmode.js`](https://github.com/humanbydefinition/textmode.js) that adds various export options to your `Textmodifier` instance, including:
- Plain text (`.txt`)
- Image files (`.png`, `.jpg`, `.webp`)
- Animated image files (`.gif`)
- Video files (`.webm`)
- Scalable vector graphics (`.svg`)

Besides exporting programatically, `textmode.export.js` also provides an overlay UI for users to easily export their creations.

## Installation

### Prerequisites
- The latest `textmode.export.js` version requires `textmode.js` v0.7.0 or later.

### UMD

To use `textmode.export.js` in a UMD environment, download the latest `umd` build from the [**GitHub releases page**](https://github.com/humanbydefinition/textmode.export.js/releases/) or import it directly from a CDN like [**jsDelivr**](https://www.jsdelivr.com/package/npm/textmode.export.js). The library is distributed as a single JavaScript file, which you can include in your project by adding the following script tag to your HTML file:

```html
<!-- index.html -->
<!DOCTYPE html>
<html>
<head>
    <title>textmode.js sketch</title>

    <!-- Import textmode.js from jsDelivr CDN -->
    <script src="https://cdn.jsdelivr.net/npm/textmode.js@latest/dist/textmode.umd.js"></script>

    <!-- Import textmode.export.js from jsDelivr CDN -->
    <script src="https://cdn.jsdelivr.net/npm/textmode.export.js@latest/dist/textmode.export.umd.js"></script>
</head>
<body>
    <script src="sketch.js"></script>
</body>
</html>
```

```javascript
// sketch.js
const t = textmode.create({
    width: window.innerWidth,
    height: window.innerHeight,
    fontSize: 16,
    frameRate: 60,
    plugins: [
        createTextmodeExportPlugin({
            overlay: false
        })
    ]
});

t.setup(() => {
    // Optional setup code here (e.g., load fonts/shaders, initialize variables that access 't')
});

t.draw(() => {
    t.background(32); // Dark gray background

    t.char('A');
    t.charColor(255, 0, 0); // Cover the top-left quarter of the grid with a rectangle of red 'A's
    t.rect(0, 0, t.grid.cols / 2, t.grid.rows / 2);

    // ...add your drawing code here!

    if (t.frameCount === 60) {
        t.saveCanvas({
            format: 'png',
            filename: 'my-sketch'
        });
    }
});

t.windowResized(() => {
    t.resizeCanvas(window.innerWidth, window.innerHeight);
});
```

#### ESM

To use `textmode.export.js` in an ESM environment, you can install it via `npm`:

```bash
npm install textmode.export.js
```

Then, you can import it in your JavaScript or TypeScript files:

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>textmode.js sketch</title>
</head>
<body>
    <script type="module" src="./sketch.js"></script>
</body>
</html>
```

```javascript
// sketch.js
import { textmode } from 'textmode.js';
import { createTextmodeExportPlugin } from 'textmode.export.js';

const t = textmode.create({
    width: window.innerWidth,
    height: window.innerHeight,
    fontSize: 16,
    frameRate: 60,
    plugins: [
        createTextmodeExportPlugin({
            overlay: false
        })
    ]
});

t.setup(() => {
    // Optional setup code here (e.g., load fonts/shaders, initialize variables that access 't')
});

t.draw(() => {
    t.background(32); // Dark gray background

    t.char('A');
    t.charColor(255, 0, 0); // Cover the top-left quarter of the grid with a rectangle of red 'A's
    t.rect(0, 0, t.grid.cols / 2, t.grid.rows / 2);

    // ...add your drawing code here!

    if (t.frameCount === 60) {
        t.saveCanvas({
            format: 'png',
            filename: 'my-sketch'
        });
    }
});

t.windowResized(() => {
    t.resizeCanvas(window.innerWidth, window.innerHeight);
});
```

## Next steps

Now that you have `textmode.export.js` set up, you can explore the following resources to learn more about its features and capabilities:

📚 **[Visit the Official Documentation](https://code.textmode.art/docs/exporting.html)** for a detailed guide on how to use the `textmode.export.js` and all its features.

🔍 **[Browse the TypeDoc API reference](docs/README.md)** hosted right here in the repository for in-depth API details.

## Acknowledgements

`textmode.export.js` packages [`webm-writer-js`](https://github.com/thenickdude/webm-writer-js) by [**Nicholas Sherlock**](https://github.com/thenickdude) to provide WebM video export support. `webm-writer-js` is distributed under the [**WTFPL v2**](https://en.wikipedia.org/wiki/WTFPL) license.

Animated GIF export relies on [`gifenc`](https://github.com/mattdesl/gifenc) by [**Matt DesLauriers**](https://github.com/mattdesl), available under the [**MIT License**](https://opensource.org/licenses/MIT).
