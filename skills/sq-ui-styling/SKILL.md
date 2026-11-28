---
name: sq-ui-styling
description: Configure ng-sq-ui Sass, scoped CSS properties and responsive styling helpers.
---

Read the styling guide through `get_doc_page` and inspect `list_tokens`. Emit runtime `--sq-*` properties for compiled components; Sass configuration alone cannot rewrite CSS already embedded in a package.

Keep `.sq` on the application theme root and use component public CSS hooks. Prefer logical properties for direction-sensitive spacing. Existing ng-sq-ui has no CoreUI utility API; implement only the local helpers the consuming layout needs.

Load global styles once. Check nested inheritance and ensure styles do not escape the intended wrapper. Recheck focus, menu clipping and narrow-screen wrapping after layout changes.
