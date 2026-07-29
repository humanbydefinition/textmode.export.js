# textmode.export.js (✿◕‿◕)ﾉ

<div align="center">

<img alt="textmode.export.js — save textmode in every format" src=".github/assets/readme-og.png" />

| [![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/) | [![API](https://img.shields.io/badge/API-typedoc-3178c6?logo=typescript&logoColor=white)](docs/README.md) [![docs](https://img.shields.io/badge/docs-vitepress-646cff?logo=vitepress&logoColor=white)](https://code.textmode.art/docs/exporting.html) [![Discord](https://img.shields.io/discord/1357070706181017691?color=5865F2&label=Discord&logo=discord&logoColor=white)](https://discord.gg/sjrw8QXNks) | [![ko-fi](https://shields.io/badge/ko--fi-donate-ff5f5f?logo=ko-fi)](https://ko-fi.com/V7V8JG2FY) [![GitHub-sponsors](https://img.shields.io/badge/sponsor-30363D?logo=GitHub-Sponsors&logoColor=#EA4AAA)](https://github.com/sponsors/humanbydefinition) |
| :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |

</div>

`textmode.export.js` is an add-on library for [`textmode.js`](https://github.com/humanbydefinition/textmode.js) that adds various export options to your `Textmodifier` instance, including:

- Plain text (`.txt`)
- JSON document data (`.json`)
- Image files (`.png`, `.jpg`, `.webp`)
- Animated image files (`.gif`)
- Video files (`.webm`, `.mp4`)
- Scalable vector graphics (`.svg`)

Besides exporting programatically, `textmode.export.js` also provides an overlay UI for users to easily export their creations.

## Installation

Follow the [official installation guide](https://code.textmode.art/docs/installation) to install
`textmode.export.js` alongside `textmode.js` with npm or browser-ready UMD bundles.

## Quick start

```javascript
import { textmode } from 'textmode.js';
import { ExportPlugin } from 'textmode.export.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 16,
	plugins: [ExportPlugin],
});

t.draw(() => {
	t.background(32);
	t.char('A');
	t.charColor(255, 0, 0);
	t.rect(t.grid.cols / 2, t.grid.rows / 2);

	if (t.frameCount === 60) {
		void t.saveCanvas({
			format: 'png',
			filename: 'my-sketch',
		});
	}
});
```

The plugin also exposes `t.exportOverlay` for showing, hiding, and configuring the built-in export controls:

```javascript
t.exportOverlay.hide();
t.exportOverlay.show();
t.exportOverlay.setDefaults({ image: { scale: 2 } });
```

## Next steps

Now that you have `textmode.export.js` set up, you can explore the following resources to learn more about its features and capabilities:

📚 **[Visit the Official Documentation](https://code.textmode.art/docs/exporting.html)** for a detailed guide on how to use the `textmode.export.js` and all its features.

🔍 **[Browse the TypeDoc API reference](docs/README.md)** hosted right here in the repository for in-depth API details.

## Acknowledgements

`textmode.export.js` packages [`mediabunny`](https://github.com/Vanilagy/mediabunny) by [**Vanilagy**](https://github.com/Vanilagy) to provide WebM and MP4 video export support via WebCodecs. `mediabunny` is distributed under the [**MPL-2.0**](https://www.mozilla.org/en-US/MPL/2.0/) license.

Animated GIF export relies on [`gifenc`](https://github.com/mattdesl/gifenc) by [**Matt DesLauriers**](https://github.com/mattdesl), available under the [**MIT License**](https://opensource.org/licenses/MIT).
