import { defineDocs } from '@textmode/docs';

export default defineDocs({
	checks: {
		docstrings: ['function', 'method', 'accessor'],
	},
	typedoc: {
		categoryOrder: [
			'Workflow',
			'Canvas capture',
			'GIF export',
			'Video export',
			'Layer data export',
			'JSON document data',
			'Overlay',
			'*',
		],
		defaultCategory: 'Uncategorized',
		intentionallyNotExported: [
			'src/document/types.ts:TextmodeSelectedDocumentJSON',
			'src/document/types.ts:TextmodeAllDocumentJSON',
			'src/exporters/base/FramePreparation.ts:PrepareExportFrame',
			'src/exporters/video/types.ts:VideoCodec',
		],
	},
});
