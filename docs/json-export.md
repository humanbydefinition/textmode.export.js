# JSON export

`textmode.export.js` produces editable cell data in the
[`textmode.document@2.0.0` format](https://unpkg.com/@textmode/document@1.0.0/docs/specification-2.0.md).
The independent `@textmode/document` package owns its specification, schema,
document types, and decoder.

## Export a document

After installing `ExportPlugin` on a Textmodifier instance, use `toJSON` for an
object, `toJSONString` for serialized JSON, or `saveJSON` for a download:

```js
const document = t.toJSON({ target: 'selected', colorMode: 'rgba' });
const json = t.toJSONString({ target: 'all', pretty: true });
t.saveJSON({ filename: 'artwork', target: 'all' });
```

| Option | Default | Effect |
| --- | --- | --- |
| `target` | `selected` | Export one layer or all layers. |
| `layer` | Base layer | Select the layer when `target` is `selected`. |
| `colorMode` | `hex` | Write hexadecimal colors or RGBA channel objects. |
| `pretty` | `true` | Indent serialized JSON with two spaces, a given number of spaces, or no spaces when `false`. |
| `includeMetadata` | `true` | Include the timestamp and exporter name and version. |
| `filename` | Generated name | Set the download name for `saveJSON`. |

A selected export contains a cell snapshot and grid metrics. An all-layer export
contains the ordered layer stack and its presentation values. Documents describe
the current cell data, without authored animation, font identity, editor project
history, or final post-processing pixels.

## Use document types and validation

Import export options from this package and document types from their owner:

```ts
import type { JSONExportOptions, TextmodeExportAPI } from 'textmode.export.js';
import type { TextmodeDocumentJSON } from '@textmode/document';

function exportArtwork(api: TextmodeExportAPI): TextmodeDocumentJSON {
	const options: JSONExportOptions = { target: 'all', colorMode: 'rgba' };
	return api.toJSON(options);
}
```

Use `@textmode/document` directly to decode imported files or use its schema:

```js
import { parseTextmodeDocumentJSON } from '@textmode/document';
import schema from '@textmode/document/schema/2.0' with { type: 'json' };
```

See the [consumer guide](https://unpkg.com/@textmode/document@1.0.0/docs/consumer-guide.md)
for decoding, resource limits, supported versions, and schema validation.
The exporter exposes its plugin and export options through its package root.

## Protocol package

Install the public protocol package from npm when you need to decode or validate
exported documents:

```sh
npm install @textmode/document
```

The protocol package owns the document format, schema, types, and decoder.
`textmode.export.js` owns serialization and exporter-specific options. Package
versions are independent from the on-disk `textmode.document@2.0.0` format version.
