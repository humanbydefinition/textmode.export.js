[**textmode.export.js v1.0.0**](../README.md)

***

[textmode.export.js](../README.md) / GIFExportOptions

# Type Alias: GIFExportOptions

> **GIFExportOptions** = `object`

Defined in: [exporters/gif/types.ts:32](https://github.com/humanbydefinition/textmode.export.js/blob/ca75473df965aa1ff01c2e4c1b01c8321648d368/src/exporters/gif/types.ts#L32)

Options for exporting the textmode content to GIF format.

## Properties

### filename?

> `optional` **filename**: `string`

Defined in: [exporters/gif/types.ts:36](https://github.com/humanbydefinition/textmode.export.js/blob/ca75473df965aa1ff01c2e4c1b01c8321648d368/src/exporters/gif/types.ts#L36)

Target filename without extension. Defaults to an auto-generated value.

***

### frameCount?

> `optional` **frameCount**: `number`

Defined in: [exporters/gif/types.ts:40](https://github.com/humanbydefinition/textmode.export.js/blob/ca75473df965aa1ff01c2e4c1b01c8321648d368/src/exporters/gif/types.ts#L40)

Desired total number of frames to capture. Defaults to `300`.

***

### frameRate?

> `optional` **frameRate**: `number`

Defined in: [exporters/gif/types.ts:44](https://github.com/humanbydefinition/textmode.export.js/blob/ca75473df965aa1ff01c2e4c1b01c8321648d368/src/exporters/gif/types.ts#L44)

Target frame rate for the export, in frames per second. Defaults to `60`.

***

### onProgress()?

> `optional` **onProgress**: (`progress`) => `void`

Defined in: [exporters/gif/types.ts:60](https://github.com/humanbydefinition/textmode.export.js/blob/ca75473df965aa1ff01c2e4c1b01c8321648d368/src/exporters/gif/types.ts#L60)

Progress callback invoked throughout the recording lifecycle.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `progress` | [`GIFExportProgress`](GIFExportProgress.md) |

#### Returns

`void`

***

### repeat?

> `optional` **repeat**: `number`

Defined in: [exporters/gif/types.ts:56](https://github.com/humanbydefinition/textmode.export.js/blob/ca75473df965aa1ff01c2e4c1b01c8321648d368/src/exporters/gif/types.ts#L56)

GIF loop count. 0 = loop forever. Defaults to `0`.

***

### scale?

> `optional` **scale**: `number`

Defined in: [exporters/gif/types.ts:52](https://github.com/humanbydefinition/textmode.export.js/blob/ca75473df965aa1ff01c2e4c1b01c8321648d368/src/exporters/gif/types.ts#L52)

Scale factor for the output image.

`1.0` = original size, `2.0` = double size, `0.5` = half size.

Defaults to `1.0`.
