---
name: sq-ui-theme
description: Create or update a complete ng-sq-ui brand theme with light, dark and system modes.
---

Use `list_tokens` before choosing overrides. `create_theme` derives a complete set of semantic values from a brand seed and checks readable foreground/background pairs. Inspect any brand adjustment or failed contrast diagnostic.

Generate a theme artifact through `generate_ui`, or call `update_theme` for an existing artifact. Inspect and apply its changeset. Keep theme changes separate from page behavior and preserve user edits detected by hash conflicts.

Verify both modes, system preference changes, persistence, nested `.sq` roots and overlays. Independent selection, range and shadow values need explicit values. An application using ThemeService should instantiate it and supply any selected external webfont.
