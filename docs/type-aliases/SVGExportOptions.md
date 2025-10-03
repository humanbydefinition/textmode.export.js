[**textmode.export.js v0.0.1**](../README.md)

***

[textmode.export.js](../README.md) / SVGExportOptions

# Type Alias: SVGExportOptions

> **SVGExportOptions** = `object`

Defined in: [exporters/svg/types.ts:64](https://github.com/humanbydefinition/textmode.export.js/blob/241a52e7274d60bd9f433936679cfec4de4793a9/src/exporters/svg/types.ts#L64)

Options for exporting the textmode content to SVG format.

## Properties

### drawMode?

> `optional` **drawMode**: `"fill"` \| `"stroke"`

Defined in: [exporters/svg/types.ts:90](https://github.com/humanbydefinition/textmode.export.js/blob/241a52e7274d60bd9f433936679cfec4de4793a9/src/exporters/svg/types.ts#L90)

The drawing mode for ASCII characters.

When set to `'fill'`, characters are rendered as filled shapes.

When set to `'stroke'`, characters are rendered as outlines.

Defaults to `'fill'`.

***

### filename?

> `optional` **filename**: `string`

Defined in: [exporters/svg/types.ts:70](https://github.com/humanbydefinition/textmode.export.js/blob/241a52e7274d60bd9f433936679cfec4de4793a9/src/exporters/svg/types.ts#L70)

The filename to save the SVG file as. 

If not provided, a default filename is used.

***

### includeBackgroundRectangles?

> `optional` **includeBackgroundRectangles**: `boolean`

Defined in: [exporters/svg/types.ts:79](https://github.com/humanbydefinition/textmode.export.js/blob/241a52e7274d60bd9f433936679cfec4de4793a9/src/exporters/svg/types.ts#L79)

Whether to include cell background rectangles in the SVG output.

When `false`, only the character paths are included.

Defaults to `true`.

***

### strokeWidth?

> `optional` **strokeWidth**: `number`

Defined in: [exporters/svg/types.ts:97](https://github.com/humanbydefinition/textmode.export.js/blob/241a52e7274d60bd9f433936679cfec4de4793a9/src/exporters/svg/types.ts#L97)

The stroke width to use when drawMode is set to `'stroke'`.

Defaults to `1.0`.
