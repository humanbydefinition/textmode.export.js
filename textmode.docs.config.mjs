import { defineDocs } from '@textmode/docs';

export default defineDocs({
	memberPageKinds: ['method'],
	checks: {
		docstrings: ['function', 'method', 'accessor'],
	},
	examples: {
		checkSketches: false,
	},
});
