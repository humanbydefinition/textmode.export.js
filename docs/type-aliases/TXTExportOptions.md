[**textmode.export.js v1.0.0**](../README.md)

***

[textmode.export.js](../README.md) / TXTExportOptions

# Type Alias: TXTExportOptions

> **TXTExportOptions** = `object`

Defined in: [exporters/txt/types.ts:4](https://github.com/humanbydefinition/textmode.export.js/blob/ca75473df965aa1ff01c2e4c1b01c8321648d368/src/exporters/txt/types.ts#L4)

Options for exporting the textmode content to TXT format.

## Properties

### emptyCharacter?

> `optional` **emptyCharacter**: `string`

Defined in: [exporters/txt/types.ts:25](https://github.com/humanbydefinition/textmode.export.js/blob/ca75473df965aa1ff01c2e4c1b01c8321648d368/src/exporters/txt/types.ts#L25)

Character to use for empty cells *(when no character is rendered in it)*.
Defaults to space `' '`.

***

### filename?

> `optional` **filename**: `string`

Defined in: [exporters/txt/types.ts:10](https://github.com/humanbydefinition/textmode.export.js/blob/ca75473df965aa1ff01c2e4c1b01c8321648d368/src/exporters/txt/types.ts#L10)

The filename to save the TXT file as. 

If not provided, a default filename is used.

***

### preserveTrailingSpaces?

> `optional` **preserveTrailingSpaces**: `boolean`

Defined in: [exporters/txt/types.ts:19](https://github.com/humanbydefinition/textmode.export.js/blob/ca75473df965aa1ff01c2e4c1b01c8321648d368/src/exporters/txt/types.ts#L19)

Whether to preserve trailing spaces on each line.

When `false`, trailing spaces are trimmed from each line.

Defaults to `false`.
