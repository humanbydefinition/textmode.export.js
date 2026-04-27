# Repository Guidelines

## Project Structure & Module Organization

This is a TypeScript export plugin for `textmode.js`. Public exports start in `src/index.ts` and shared public types live in `src/types.ts`. Format-specific exporters are under `src/exporters/` (`image`, `svg`, `txt`, `gif`, `video`) with shared helpers in `src/exporters/base/`. The overlay UI is organized under `src/overlay/`, split into `components/`, `services/`, `models/`, `core/`, and `blades/`. Example sketches and local demo pages are in `examples/`. Generated build and documentation output belong in `dist/` and `api/`; do not edit those by hand.

## Build, Test, and Development Commands

- `npm run dev` starts the Vite dev server on port 5174 for examples and local testing.
- `npm run build` creates the bundled library and TypeScript declarations.
- `npm run check` runs formatting, linting, Markdown linting, type checks, API docs checks, tests, and build.
- `npm run build:docs` regenerates TypeDoc API documentation.
- `npm run test`, `npm run test:watch`, and `npm run test:coverage` run Vitest in CI, watch, or coverage mode.

## Coding Style & Naming Conventions

Use TypeScript modules with explicit exports from feature `index.ts` files where practical. Follow the existing class-based naming for services, controllers, and exporters: `ImageExporter`, `OverlayController`, `ClipboardService`. Use camelCase for variables and methods, PascalCase for classes, interfaces, and type aliases, and kebab-free directory names that match the existing structure.

Formatting is handled by Prettier: tabs, tab width 4, semicolons, single quotes, trailing commas where valid in ES5, and 120-character print width. ESLint covers `src/**/*.{ts,js}` with TypeScript and JSDoc rules; unused parameters should be prefixed with `_`.

## Testing Guidelines

Vitest is configured, but the repository currently has no committed `*.test.*` or `*.spec.*` files. Add focused tests next to the code they verify or in a nearby `__tests__/` folder. Prefer names like `ImageExporter.test.ts` or `OverlayController.spec.ts`. Cover exporter behavior, option handling, and browser API fallbacks with mocks where direct canvas, clipboard, or media APIs are unavailable.

## Commit & Pull Request Guidelines

Commits use Conventional Commits enforced by commitlint, for example `fix: correct SVG path generation` or `feat: add WEBP quality option`. Allowed types include `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, and `revert`; keep headers under 100 characters.

Pull requests should describe the user-visible change, list validation commands run, link related issues, and include screenshots or recordings for overlay UI changes.
