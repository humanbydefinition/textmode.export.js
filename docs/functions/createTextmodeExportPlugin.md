[**textmode.export.js v0.0.0**](../README.md)

***

[textmode.export.js](../README.md) / createTextmodeExportPlugin

# Function: createTextmodeExportPlugin()

> **createTextmodeExportPlugin**(`options`): `TextmodePlugin`

Defined in: [index.ts:31](https://github.com/humanbydefinition/textmode.export.js/blob/b139a19f4bf774f3e0d95bc7580f4dc7e25a4c0f/src/index.ts#L31)

Initializes the export plugin for `textmode.js` use.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`TextmodeExportPluginOptions`](../interfaces/TextmodeExportPluginOptions.md) | Plugin options |

## Returns

`TextmodePlugin`

The export plugin instance to pass to `textmode.js`.

## Example

```typescript
import { textmode } from 'textmode.js';
import { createExportPlugin } from 'textmode.export.js';

const exportPlugin = createExportPlugin({ overlay: true });

const textmodifier = textmode.create({
 plugins: [exportPlugin],
});

// Now textmodifier has export methods like saveSVG, saveCanvas, etc.
// textmodifier.saveSVG({ filename: 'my-artwork' });
// textmodifier.saveCanvas({ format: 'png', scale: 2.0 });
```
