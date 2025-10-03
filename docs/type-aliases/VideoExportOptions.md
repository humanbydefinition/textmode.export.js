[**textmode.export.js v0.0.0**](../README.md)

***

[textmode.export.js](../README.md) / VideoExportOptions

# Type Alias: VideoExportOptions

> **VideoExportOptions** = `object`

Defined in: [exporters/video/types.ts:33](https://github.com/humanbydefinition/textmode.export.js/blob/b139a19f4bf774f3e0d95bc7580f4dc7e25a4c0f/src/exporters/video/types.ts#L33)

Options for exporting the textmode content to video format.

## Properties

### debugLogging?

> `optional` **debugLogging**: `boolean`

Defined in: [exporters/video/types.ts:61](https://github.com/humanbydefinition/textmode.export.js/blob/b139a19f4bf774f3e0d95bc7580f4dc7e25a4c0f/src/exporters/video/types.ts#L61)

Enables verbose logging. Defaults to `false`.

***

### filename?

> `optional` **filename**: `string`

Defined in: [exporters/video/types.ts:37](https://github.com/humanbydefinition/textmode.export.js/blob/b139a19f4bf774f3e0d95bc7580f4dc7e25a4c0f/src/exporters/video/types.ts#L37)

Target filename without extension. Defaults to an auto-generated value.

***

### frameCount?

> `optional` **frameCount**: `number`

Defined in: [exporters/video/types.ts:41](https://github.com/humanbydefinition/textmode.export.js/blob/b139a19f4bf774f3e0d95bc7580f4dc7e25a4c0f/src/exporters/video/types.ts#L41)

Desired total number of frames to capture. Defaults to `300`.

***

### frameRate?

> `optional` **frameRate**: `number`

Defined in: [exporters/video/types.ts:45](https://github.com/humanbydefinition/textmode.export.js/blob/b139a19f4bf774f3e0d95bc7580f4dc7e25a4c0f/src/exporters/video/types.ts#L45)

Target frame rate for the export, in frames per second. Defaults to `60`.

***

### onProgress()?

> `optional` **onProgress**: (`progress`) => `void`

Defined in: [exporters/video/types.ts:57](https://github.com/humanbydefinition/textmode.export.js/blob/b139a19f4bf774f3e0d95bc7580f4dc7e25a4c0f/src/exporters/video/types.ts#L57)

Progress callback invoked throughout the recording lifecycle.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `progress` | [`VideoExportProgress`](VideoExportProgress.md) |

#### Returns

`void`

***

### quality?

> `optional` **quality**: `number`

Defined in: [exporters/video/types.ts:49](https://github.com/humanbydefinition/textmode.export.js/blob/b139a19f4bf774f3e0d95bc7580f4dc7e25a4c0f/src/exporters/video/types.ts#L49)

Encoder quality between 0.0 and 1.0. Higher values request higher fidelity. Defaults to `1.0` *(lossless)*.

***

### transparent?

> `optional` **transparent**: `boolean`

Defined in: [exporters/video/types.ts:53](https://github.com/humanbydefinition/textmode.export.js/blob/b139a19f4bf774f3e0d95bc7580f4dc7e25a4c0f/src/exporters/video/types.ts#L53)

When true, attempts to preserve alpha data in the recording *(experimental)*. Defaults to `false`.
