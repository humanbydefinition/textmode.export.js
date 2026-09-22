import path from 'node:path';

import { defineConfig } from 'vite';

export default defineConfig({
	build: {
		emptyOutDir: false,
		lib: {
			entry: path.resolve(import.meta.dirname, 'src/document/index.ts'),
			formats: ['es'],
			fileName: () => 'textmode.document.esm.js',
		},
		minify: 'terser',
		terserOptions: {
			ecma: 2020,
			compress: {
				drop_debugger: true,
				passes: 2,
			},
			format: {
				comments: false,
			},
		},
		rolldownOptions: {
			treeshake: {
				moduleSideEffects: false,
			},
		},
	},
});
