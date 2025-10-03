[**textmode.export.js v0.0.0**](../README.md)

***

[textmode.export.js](../README.md) / TextmodeExportAPI

# Interface: TextmodeExportAPI

Defined in: [types.ts:10](https://github.com/humanbydefinition/textmode.export.js/blob/b139a19f4bf774f3e0d95bc7580f4dc7e25a4c0f/src/types.ts#L10)

Runtime export helpers that `createExportPlugin` attaches to the `Textmodifier` instance.

## Methods

### copyCanvas()

> **copyCanvas**(`options?`): `Promise`\<`void`\>

Defined in: [types.ts:21](https://github.com/humanbydefinition/textmode.export.js/blob/b139a19f4bf774f3e0d95bc7580f4dc7e25a4c0f/src/types.ts#L21)

Copies the current canvas to the user's clipboard as an image.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options?` | [`ImageExportOptions`](../type-aliases/ImageExportOptions.md) | Export options. |

#### Returns

`Promise`\<`void`\>

***

### saveCanvas()

> **saveCanvas**(`options?`): `Promise`\<`void`\>

Defined in: [types.ts:15](https://github.com/humanbydefinition/textmode.export.js/blob/b139a19f4bf774f3e0d95bc7580f4dc7e25a4c0f/src/types.ts#L15)

Saves the current canvas content to an image file *(`'png'` by default)*.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options?` | [`ImageExportOptions`](../type-aliases/ImageExportOptions.md) | Export options. |

#### Returns

`Promise`\<`void`\>

***

### saveGIF()

> **saveGIF**(`options?`): `Promise`\<`void`\>

Defined in: [types.ts:53](https://github.com/humanbydefinition/textmode.export.js/blob/b139a19f4bf774f3e0d95bc7580f4dc7e25a4c0f/src/types.ts#L53)

Records an animated GIF and saves it to disk.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options?` | [`GIFExportOptions`](../type-aliases/GIFExportOptions.md) | Export options. |

#### Returns

`Promise`\<`void`\>

***

### saveStrings()

> **saveStrings**(`options?`): `void`

Defined in: [types.ts:33](https://github.com/humanbydefinition/textmode.export.js/blob/b139a19f4bf774f3e0d95bc7580f4dc7e25a4c0f/src/types.ts#L33)

Downloads the current text content as a plain-text file.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options?` | [`TXTExportOptions`](../type-aliases/TXTExportOptions.md) | Export options. |

#### Returns

`void`

***

### saveSVG()

> **saveSVG**(`options?`): `void`

Defined in: [types.ts:27](https://github.com/humanbydefinition/textmode.export.js/blob/b139a19f4bf774f3e0d95bc7580f4dc7e25a4c0f/src/types.ts#L27)

Downloads the current frame as an SVG file.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options?` | [`SVGExportOptions`](../type-aliases/SVGExportOptions.md) | Export options. |

#### Returns

`void`

***

### saveWEBM()

> **saveWEBM**(`options?`): `Promise`\<`void`\>

Defined in: [types.ts:59](https://github.com/humanbydefinition/textmode.export.js/blob/b139a19f4bf774f3e0d95bc7580f4dc7e25a4c0f/src/types.ts#L59)

Captures a WEBM video and saves it to disk.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options?` | [`VideoExportOptions`](../type-aliases/VideoExportOptions.md) | Export options. |

#### Returns

`Promise`\<`void`\>

***

### toString()

> **toString**(`options?`): `string`

Defined in: [types.ts:47](https://github.com/humanbydefinition/textmode.export.js/blob/b139a19f4bf774f3e0d95bc7580f4dc7e25a4c0f/src/types.ts#L47)

Produces the current text content as a string.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options?` | [`TXTExportOptions`](../type-aliases/TXTExportOptions.md) | Export options. |

#### Returns

`string`

The textual representation of the artwork.

***

### toSVG()

> **toSVG**(`options?`): `string`

Defined in: [types.ts:40](https://github.com/humanbydefinition/textmode.export.js/blob/b139a19f4bf774f3e0d95bc7580f4dc7e25a4c0f/src/types.ts#L40)

Generates the SVG markup for the current frame.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options?` | [`SVGExportOptions`](../type-aliases/SVGExportOptions.md) | Export options. |

#### Returns

`string`

The SVG content representing the artwork.
