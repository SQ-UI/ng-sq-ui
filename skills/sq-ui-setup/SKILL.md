---
name: sq-ui-setup
description: Install and configure ng-sq-ui in a new or existing Angular application.
---

Read `get_overview` and, for existing work, `inspect_workspace`. Match Angular and package versions before changing dependencies. Workspace mode requires the seven built library packages; installed mode uses exact versioned dependencies.

Import standalone declarations from their public package entries. Load the common theme and form Sass once in a global stylesheet and keep `.sq` on a parent. Fonts and Font Awesome are optional consumer assets. Sass imports do not register Angular components.

Use `plan_ui` for a dependency plan. For existing applications provide the real routes and styles files. Validate a production build after setup; preserve unrelated routes, configuration and styles.
