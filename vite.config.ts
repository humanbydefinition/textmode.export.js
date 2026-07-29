import { defineTextmodeLibrary } from '@textmode/vite-config';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

export default defineTextmodeLibrary({
	globalName: 'TextmodeExport',
	plugins: [cssInjectedByJsPlugin()],
});
