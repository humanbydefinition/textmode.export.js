import { createReleaseConfig } from '@textmode/release-config';

export default createReleaseConfig({
	githubAssets: ['dist/textmode.export.esm.js', 'dist/textmode.export.umd.js'],
});
