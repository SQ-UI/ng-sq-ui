---
name: sq-ui-component
description: Use or extend an ng-sq-ui component with its exact public API and template slots.
---

Discover the declaration with `list_components`, then read `get_component_api` and `get_component_example`. Check the chosen variant, required bindings, imports, inherited inputs and template context before composing it.

Use the public selector and entry point. Treat a `model()` binding as a writable signal and account for its generated change output. Custom projected templates own their labels and event callbacks. For a custom table body, iterate caller-owned rows and leave automatic items empty to avoid duplication.

When extending the library, use its Angular lifecycle, change detection and shared tokens. Keep proposed additions visible as new APIs. Compile the consuming component with strict templates and exercise the changed interaction.
