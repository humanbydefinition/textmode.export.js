# textmode.export.js

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

## Try it online first

Open [editor.textmode.art](https://editor.textmode.art/), a browser-based live-coding environment for the
complete official `textmode.js` ecosystem. Sketches run as you edit, with no local toolchain required.

The editor includes `textmode.js` and all four official add-ons: `textmode.export.js`, `textmode.filters.js`,
`textmode.figlet.js`, and `textmode.synth.js`.

- Write with Monaco-powered completions, hover documentation, and diagnostics.
- Start with a blank sketch, an included example, or a community gallery sketch.
- Keep code and preferences saved in the browser, then share sketches through URL-based links.
- Use microphone or line-input analysis for audio-reactive work, and create on desktop or mobile.

Use it to experiment with export functionality while your sketch is running.

## Installation

Follow the [official installation guide](https://code.textmode.art/docs/installation) to install
`textmode.export.js` alongside `textmode.js` with npm or browser-ready UMD bundles.

## Next steps

- **[Read the exporting documentation](https://code.textmode.art/docs/exporting.html)** for supported formats and workflows.
- **[Browse the API reference](https://code.textmode.art/api/textmode.export.js/)** for the complete typed API.
- **[Explore the examples](./examples/)** to see export plugins and options in action.
- **[Try the live editor](https://editor.textmode.art/)** to experiment with exports in the browser.

## Contributing

Thank you for considering contributing to this project! (✿◠‿◠)

Please read the [Contributing Guide](https://github.com/humanbydefinition/textmode.js-dev/blob/dev/CONTRIBUTING.md) to get started.

<!-- TEXTMODE-CONTRIBUTORS:START -->
<!-- prettier-ignore-start -->
<!-- Generated from https://github.com/humanbydefinition/code.textmode.art/blob/main/.vitepress/data/contributors.json. Do not edit this section directly. -->
## Contributors

Thanks to the people who contribute code, documentation, design, examples, ideas, infrastructure, and care
across the textmode.js ecosystem.

<!-- markdownlint-disable MD033 -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%">
        <a href="https://github.com/humanbydefinition">
          <img src="https://github.com/humanbydefinition.png?s=100" width="100px" alt="humanbydefinition avatar" />
          <br /><sub><b>humanbydefinition</b></sub>
        </a>
        <br /><span title="Code: Commits and pull requests" aria-label="Code: Commits and pull requests">💻</span> <span title="Documentation: README, guides, and API documentation" aria-label="Documentation: README, guides, and API documentation">📖</span> <span title="Design: User experience, branding, and visual design" aria-label="Design: User experience, branding, and visual design">🎨</span> <span title="Examples: Usage examples and creative sketches" aria-label="Examples: Usage examples and creative sketches">💡</span> <span title="Ideas and planning: Feature proposals, planning, and feedback" aria-label="Ideas and planning: Feature proposals, planning, and feedback">🤔</span> <span title="Maintenance: Refactoring and project upkeep" aria-label="Maintenance: Refactoring and project upkeep">🚧</span> <span title="Infrastructure: Continuous integration, hosting, and build systems" aria-label="Infrastructure: Continuous integration, hosting, and build systems">🚇</span> <span title="Tools: Developer and community tooling" aria-label="Tools: Developer and community tooling">🔧</span> <span title="Plugins and libraries: Plugin and utility library development" aria-label="Plugins and libraries: Plugin and utility library development">🔌</span> <span title="Code review: Reviewing pull requests" aria-label="Code review: Reviewing pull requests">👀</span>
      </td>
      <td align="center" valign="top" width="14.28%">
        <a href="https://github.com/trintlermint">
          <img src="https://github.com/trintlermint.png?s=100" width="100px" alt="trintlermint avatar" />
          <br /><sub><b>trintlermint</b></sub>
        </a>
        <br /><span title="Design: User experience, branding, and visual design" aria-label="Design: User experience, branding, and visual design">🎨</span> <span title="Examples: Usage examples and creative sketches" aria-label="Examples: Usage examples and creative sketches">💡</span>
      </td>
    </tr>
  </tbody>
</table>
<!-- markdownlint-enable MD033 -->

Contribution details and profile links are maintained on the [textmode.js contributors page](https://code.textmode.art/docs/contributors).
<!-- prettier-ignore-end -->
<!-- TEXTMODE-CONTRIBUTORS:END -->

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

## License

`textmode.export.js` is licensed under the [MIT License](./LICENSE).

## Acknowledgements

- **[mediabunny](https://github.com/Vanilagy/mediabunny)** — WebM and MP4 video export support via WebCodecs, by [Vanilagy](https://github.com/Vanilagy). License: [MPL-2.0](https://github.com/Vanilagy/mediabunny/blob/main/LICENSE).

- **[gifenc](https://github.com/mattdesl/gifenc)** — Animated GIF encoding by [Matt DesLauriers](https://github.com/mattdesl). License: [MIT License](https://github.com/mattdesl/gifenc/blob/main/LICENSE.md).

---

<div align="center">

<br />

**[↑ back to top](#textmodeexportjs)**

</div>
