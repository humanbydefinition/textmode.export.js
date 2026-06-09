# All Member Pages Router

## Purpose

This TypeDoc router makes direct public methods render as focused Markdown pages when an owner page would otherwise
render too many Sandpack examples.

`typedoc-plugin-markdown` can render top-level API structures as pages, but textmode.js also needs compact class and
interface overview pages that link to individual methods once their inline examples would make the page heavy. This
router keeps those owner pages small and gives each direct method a stable page.

## Member Pages

The router creates pages for direct class/interface methods when rendering the owner page inline would exceed three
Sandpack examples:

- methods

Nested type-literal fields intentionally remain inline or anchor-based so structural types do not explode into many
small pages.

## Paths

Examples:

- `classes/Textmodifier/methods/background.md`
- `namespaces/layering/classes/TextmodeLayer/methods/draw.md`

## Preserved Output Contract

- The router name remains `all-member-pages`.
- Direct methods get pages only when their class/interface owner would otherwise exceed three Sandpack examples.
- Properties, accessors, constructors, variables, type aliases, functions, and nested type-literal members do not get
  extra pages from this router.
- Existing `MemberRouter` behavior for modules, namespaces, documents, and configured `membersWithOwnFile` kinds is
  preserved.
- Project-root namespaces use the flattened textmode.js path shape, for example `namespaces/color/classes/TextmodeColor.md`.
- Sidebar entries include generated member pages under their owners.

## Contributor Notes

- Safe to edit: constants, helper names, tests, and README wording.
- Be careful with: `child-pages.js`, which intentionally mirrors upstream `MemberRouter` traversal.
- Do not casually change: path segment names, namespace path flattening, example-count thresholds, or direct-method page
  eligibility.

## Maintenance

This plugin extends `typedoc-plugin-markdown`'s `MemberRouter` and copies its child-page traversal policy so direct
members can participate in TypeDoc's `hasOwnDocument` behavior. Re-check this router after upgrading TypeDoc or
`typedoc-plugin-markdown`, especially around router APIs, `membersWithOwnFile`, and namespace path handling.

Upgrade checklist:

- Compare `child-pages.js` against the current upstream `MemberRouter.buildChildPages`.
- Confirm `PageKind.Reflection`, `Slugger`, `fullUrls`, and `sluggers` are still the correct router APIs.
- Run `npm run build:docs` and verify generated method links still resolve.
