[**textmode.export.js v0.0.0**](../README.md)

***

[textmode.export.js](../README.md) / ImageExportOptions

# Type Alias: ImageExportOptions

> **ImageExportOptions** = `object`

Defined in: [exporters/image/types.ts:13](https://github.com/humanbydefinition/textmode.export.js/blob/b139a19f4bf774f3e0d95bc7580f4dc7e25a4c0f/src/exporters/image/types.ts#L13)

Options for exporting the textmode content to image format.

## Properties

### filename?

> `optional` **filename**: `string`

Defined in: [exporters/image/types.ts:17](https://github.com/humanbydefinition/textmode.export.js/blob/b139a19f4bf774f3e0d95bc7580f4dc7e25a4c0f/src/exporters/image/types.ts#L17)

Target filename without extension. Defaults to an auto-generated value.

***

### format?

> `optional` **format**: `"png"` \| `"jpg"` \| `"webp"`

Defined in: [exporters/image/types.ts:22](https://github.com/humanbydefinition/textmode.export.js/blob/b139a19f4bf774f3e0d95bc7580f4dc7e25a4c0f/src/exporters/image/types.ts#L22)

The image format to export *(`'png'`, `'jpg'`, or `'webp'`)*. Defaults to `'png'`.

***

### scale?

> `optional` **scale**: `number`

Defined in: [exporters/image/types.ts:31](https://github.com/humanbydefinition/textmode.export.js/blob/b139a19f4bf774f3e0d95bc7580f4dc7e25a4c0f/src/exporters/image/types.ts#L31)

Scale factor for the output image.

`1.0` = original size, `2.0` = double size, `0.5` = half size.

Defaults to `1.0`.
