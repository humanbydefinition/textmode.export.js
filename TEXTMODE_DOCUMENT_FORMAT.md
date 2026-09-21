# Textmode document format 2.0

## Status

This document defines `textmode.document` version `2.0.0`. The JSON Schema is
published at `schemas/textmode-document-2.0.schema.json`. The runtime codec is
available from `textmode.export.js/document`.

The format represents editable cell data. It does not represent final rendered
pixels, post-processing, an editor project, or authored animation.

## Encoding

A textmode document is a UTF-8 JSON object. Producers should follow the I-JSON
profile in RFC 7493:

- object member names are unique;
- integers remain within the interoperable safe range;
- non-finite numbers are not emitted;
- timestamps use an uppercase, timezone-qualified RFC 3339 representation.

The media type is `application/json`. Suggested filenames end in
`.textmode.json`. Extensions and media types are discovery hints; consumers
must route a decoded object using its `format` member.

## Root discriminator

Every v2 document contains:

```json
{
	"format": "textmode.document",
	"formatVersion": "2.0.0",
	"target": "selected"
}
```

`target` is an on-disk shape discriminator:

- `selected` contains one cell snapshot in `layer`;
- `all` contains a layer stack in `layers`.

It is not an instruction to an exporter and must not be extended with temporal
values such as `animation`. Authored animation requires a distinct document or
container format.

## Version compatibility

The version is SemVer-shaped for release communication. Version 2 does not
define reader negotiation or a formal extension mechanism. Consumers therefore
accept only explicitly tested versions and migrations; they must not assume an
unknown `2.x` version is compatible.

For a supported version, consumers ignore unknown ordinary object members.
They reject unknown values of tagged members such as `format`, `target`, and
`encoding` because those values change interpretation.

Version 2 does not define `extensionsUsed`, `extensionsRequired`, extension
namespacing, or an extension registry. A later revision must define those
rules before claiming extension compatibility.

## Selected cell snapshot

The `selected` shape contains:

- legacy grid pixel extent in `canvas`;
- logical grid dimensions and cell metrics in `grid`;
- an informational source ID and complete cell rows in `layer`.

This shape is a cell snapshot, not a lossless layer document. It does not carry
visibility, opacity, blend mode, offsets, layer rotation, or font identity.

## Layer stack

The `all` shape contains one or more layers. Each layer includes:

- informational ID;
- visibility and opacity;
- blend mode name;
- x/y offsets and z rotation;
- logical grid and cell metrics;
- complete cell rows.

The order of `layers` is the stack order emitted by the producer.

## Canvas field

The v2 field named `canvas` is the grid pixel extent, not necessarily the HTML
canvas or final output surface. Its values obey:

```text
canvas.width  = grid.cols × grid.cellWidth
canvas.height = grid.rows × grid.cellHeight
```

For an `all` document, the root extent is derived from the first layer's grid.
Consumers must not infer composite placement or clipping from this field.

A future major format may replace this legacy name with `gridPixelSize`; v2
semantics must not be changed in place.

## Cell encoding

Version 2 defines one encoding:

```json
{
	"encoding": "object-rows-v1",
	"rows": []
}
```

The encoding is dense and row-major:

- `rows.length` equals `grid.rows`;
- every row length equals `grid.cols`;
- a cell's `x` equals its array index within the row;
- a cell's `y` equals the row index;
- every grid coordinate is present, including transparent cells.

Consumers reject coordinate disagreement rather than silently repairing or
reordering cells.

## Glyph identity

`character` contains a non-empty, bounded, well-formed Unicode glyph string.
Vector fonts commonly use one Unicode scalar, while tileset maps may use an
extended grapheme cluster containing combining marks, variation selectors, or
zero-width joiners. Unpaired surrogates are invalid. The default codec budget
is 64 Unicode scalar values per glyph string.

No Unicode normalization is implied. Consumers preserve the string exactly and
apply product-specific representability rules after protocol decoding.

## Colors

Foreground and background colors use either:

- `#RRGGBB`, whose alpha is implicitly 255;
- `#RRGGBBAA`;
- `{ "r": 0, "g": 0, "b": 0, "a": 255 }` with integer channels from
  0 through 255.

The canonical decoder normalizes colors to RGBA channel objects.

A cell is visually empty only when both foreground and background alpha are
zero. A space with a visible background remains meaningful cell data.

## Transforms

Every cell contains:

- `invert`: boolean;
- `flipX`: boolean;
- `flipY`: boolean;
- `rotation`: finite degrees.

The canonical decoder normalizes rotation into `[0, 360)`. It therefore
normalizes both `360` and `-360` to `0` and `-90` to `270`.

Consumers must reject unsupported meaningful transforms instead of
approximating them. In particular, swapping foreground and background is not a
general replacement for inversion when alpha is present.

## Metadata

Metadata is optional and informational:

```json
{
	"createdAt": "2026-08-28T12:00:00.000Z",
	"generator": {
		"name": "textmode.export.js",
		"version": "1.8.1"
	}
}
```

Consumers must not use metadata to select executable behavior, fetch resources,
or bypass document validation.

## Safety limits

The shared codec enforces structural safety limits and accepts caller-supplied
budgets. Product-specific policy belongs to the product. For example,
`create.textmode.art` may accept fewer cells than another document consumer.

Consumers should:

- check file bytes before reading;
- cap total layers and total decoded cells;
- use checked multiplication for grid dimensions;
- bound identifiers and metadata strings;
- parse large files away from latency-sensitive UI work;
- abort work when the owning import session is cancelled.

Documents never authorize URL fetching, font installation, or code execution.

## Legacy migration

The compatibility decoder recognizes:

- `textmode.layer@1.0.0` as a selected cell snapshot;
- `textmode.layer@1.1.0` as a layer stack.

Both migrate to the canonical v2 union and return a migration warning. Callers
may disable legacy decoding.

## JSON Schema and runtime decoder

The JSON Schema describes the portable structure and is suitable for
documentation and general tooling. The runtime decoder remains authoritative
for:

- cross-field row and grid invariants;
- grid pixel extent equality;
- total resource budgets;
- well-formed and bounded glyph-string validation;
- rotation and color normalization;
- legacy migration;
- stable error codes and JSON paths.
