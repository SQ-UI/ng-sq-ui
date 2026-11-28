---
name: sq-ui-adoption
description: Replace Bootstrap, CoreUI, Taiga or custom UI with equivalent ng-sq-ui compositions.
---

Inventory the source screen's interactions, form value types, route behavior and visual requirements. Use `list_components`, exact SQ APIs and `get_reference_links` to identify suitable replacements.

Map each behavior to a native component, caller-owned composition or explicit addition. Preserve semantics rather than renaming selectors blindly. Public API and markup from other libraries are not interchangeable with SQ controls.

Migrate one complete interaction at a time and validate it. Keep unsupported widgets visible in the plan instead of generating nonexistent SQ components.
