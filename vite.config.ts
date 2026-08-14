import { defineTextmodeLibrary } from '@textmode/build';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

export default defineTextmodeLibrary({
	globalName: 'TextmodeExport',
	plugins: [cssInjectedByJsPlugin()],
});
