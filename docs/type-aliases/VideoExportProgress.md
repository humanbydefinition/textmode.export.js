[**textmode.export.js v1.0.0**](../README.md)

***

[textmode.export.js](../README.md) / VideoExportProgress

# Type Alias: VideoExportProgress

> **VideoExportProgress** = `object`

Defined in: [exporters/video/types.ts:11](https://github.com/humanbydefinition/textmode.export.js/blob/ca75473df965aa1ff01c2e4c1b01c8321648d368/src/exporters/video/types.ts#L11)

Progress information emitted during the video export process.

## Properties

### frameIndex?

> `optional` **frameIndex**: `number`

Defined in: [exporters/video/types.ts:19](https://github.com/humanbydefinition/textmode.export.js/blob/ca75473df965aa1ff01c2e4c1b01c8321648d368/src/exporters/video/types.ts#L19)

Number of frames that have been recorded so far.

***

### message?

> `optional` **message**: `string`

Defined in: [exporters/video/types.ts:27](https://github.com/humanbydefinition/textmode.export.js/blob/ca75473df965aa1ff01c2e4c1b01c8321648d368/src/exporters/video/types.ts#L27)

Optional status message for UI consumption.

***

### state

> **state**: `"idle"` \| `"recording"` \| `"encoding"` \| `"completed"` \| `"error"`

Defined in: [exporters/video/types.ts:15](https://github.com/humanbydefinition/textmode.export.js/blob/ca75473df965aa1ff01c2e4c1b01c8321648d368/src/exporters/video/types.ts#L15)

Current state of the recording process.

***

### totalFrames?

> `optional` **totalFrames**: `number`

Defined in: [exporters/video/types.ts:23](https://github.com/humanbydefinition/textmode.export.js/blob/ca75473df965aa1ff01c2e4c1b01c8321648d368/src/exporters/video/types.ts#L23)

Total number of frames planned for the recording.
