[**textmode.export.js v1.0.0**](../README.md)

***

[textmode.export.js](../README.md) / GIFExportProgress

# Type Alias: GIFExportProgress

> **GIFExportProgress** = `object`

Defined in: [exporters/gif/types.ts:10](https://github.com/humanbydefinition/textmode.export.js/blob/ca75473df965aa1ff01c2e4c1b01c8321648d368/src/exporters/gif/types.ts#L10)

Progress information emitted during the GIF export process.

## Properties

### frameIndex?

> `optional` **frameIndex**: `number`

Defined in: [exporters/gif/types.ts:18](https://github.com/humanbydefinition/textmode.export.js/blob/ca75473df965aa1ff01c2e4c1b01c8321648d368/src/exporters/gif/types.ts#L18)

Number of frames that have been recorded so far.

***

### message?

> `optional` **message**: `string`

Defined in: [exporters/gif/types.ts:26](https://github.com/humanbydefinition/textmode.export.js/blob/ca75473df965aa1ff01c2e4c1b01c8321648d368/src/exporters/gif/types.ts#L26)

Optional status message for UI consumption.

***

### state

> **state**: `"idle"` \| `"recording"` \| `"completed"` \| `"error"`

Defined in: [exporters/gif/types.ts:14](https://github.com/humanbydefinition/textmode.export.js/blob/ca75473df965aa1ff01c2e4c1b01c8321648d368/src/exporters/gif/types.ts#L14)

Current state of the recording process.

***

### totalFrames?

> `optional` **totalFrames**: `number`

Defined in: [exporters/gif/types.ts:22](https://github.com/humanbydefinition/textmode.export.js/blob/ca75473df965aa1ff01c2e4c1b01c8321648d368/src/exporters/gif/types.ts#L22)

Total number of frames planned for the recording.
