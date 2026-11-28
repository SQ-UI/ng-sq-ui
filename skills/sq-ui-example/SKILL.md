---
name: sq-ui-example
description: Generate a runnable standalone Angular example for an ng-sq-ui component variant.
---

Find the component and inspect its variants with `list_components` and `get_component_example`. Use UiSpec mode `example`, the exact component ID and an optional variant ID.

Call `plan_ui`, then `generate_ui`. Review complete TypeScript, HTML, styles, imports and dependencies in the changeset. Apply within the user's authorized workspace and run `validate_ui`.

Confirm the actual interaction in a browser. Template parsing alone does not prove that selectors, inputs, generic values or imports compile correctly.
