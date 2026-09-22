import path from 'path';

import { defineTextmodeProject } from '@textmode/build';

export default defineTextmodeProject({
	projects: [
		{
			test: {
				name: 'unit',
				include: ['src/**/*.test.ts', 'tests/unit/**/*.test.ts'],
			},
		},
		{
			test: {
				name: 'integration',
				include: ['tests/{integration,contracts}/**/*.test.ts'],
			},
		},
	],
	alias: {
		'textmode.export.js/document': path.resolve(import.meta.dirname, 'src/document/index.ts'),
		'textmode.export.js': path.resolve(import.meta.dirname, 'src/index.ts'),
	},
});
