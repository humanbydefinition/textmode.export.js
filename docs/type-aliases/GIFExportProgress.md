[**textmode.export.js v0.0.0**](../README.md)

***

[textmode.export.js](../README.md) / GIFExportProgress

# Type Alias: GIFExportProgress

> **GIFExportProgress** = `object`

Defined in: [exporters/gif/types.ts:10](https://github.com/humanbydefinition/textmode.export.js/blob/b139a19f4bf774f3e0d95bc7580f4dc7e25a4c0f/src/exporters/gif/types.ts#L10)

Progress information emitted during the GIF export process.

## Properties

### frameIndex?

> `optional` **frameIndex**: `number`

Defined in: [exporters/gif/types.ts:18](https://github.com/humanbydefinition/textmode.export.js/blob/b139a19f4bf774f3e0d95bc7580f4dc7e25a4c0f/src/exporters/gif/types.ts#L18)

Number of frames that have been recorded so far.

***

### message?

> `optional` **message**: `string`

Defined in: [exporters/gif/types.ts:26](https://github.com/humanbydefinition/textmode.export.js/blob/b139a19f4bf774f3e0d95bc7580f4dc7e25a4c0f/src/exporters/gif/types.ts#L26)

Optional status message for UI consumption.

***

### state

> **state**: `"idle"` \| `"recording"` \| `"completed"` \| `"error"`

Defined in: [exporters/gif/types.ts:14](https://github.com/humanbydefinition/textmode.export.js/blob/b139a19f4bf774f3e0d95bc7580f4dc7e25a4c0f/src/exporters/gif/types.ts#L14)

Current state of the recording process.

***

### totalFrames?

> `optional` **totalFrames**: `number`

Defined in: [exporters/gif/types.ts:22](https://github.com/humanbydefinition/textmode.export.js/blob/b139a19f4bf774f3e0d95bc7580f4dc7e25a4c0f/src/exporters/gif/types.ts#L22)

Total number of frames planned for the recording.
