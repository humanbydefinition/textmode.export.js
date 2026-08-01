import { defineDocs } from '@textmode/docs';

export default defineDocs({
	entryPoints: ['typedoc-entrypoints/textmode.export.ts'],
	linkEntryPoints: [
		{
			path: 'typedoc-entrypoints/textmode.export.ts',
		},
		{
			path: 'src/index.ts',
			namespaceExportsOnly: true,
		},
	],
	typedoc: {
		// The facade deliberately omits implementation details referenced by user-facing types.
		validation: { notExported: false },
	},
	checks: {
		docstrings: ['function', 'method', 'accessor'],
	},
});
