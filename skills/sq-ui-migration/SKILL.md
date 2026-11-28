---
name: sq-ui-migration
description: Plan and implement version-aware Angular and ng-sq-ui migrations.
---

Inspect installed versions and read `get_migration_guide` for the actual source and target. Migrate 1.x through the 2.x compatibility line before the 3.x standalone conversion.

For 2.x to 3.x, update Angular/toolchain compatibility, replace module imports, convert SQ control bindings to signal models or Signal Forms, and update patterns and generic payload types. Read exact public signatures for controls and custom templates.

Apply a mechanical codemod only when its transformation is unambiguous. Resolve remaining cases in the consuming code and validate behavior, exports, themes and production compilation.
