---
name: sq-ui-i18n
description: Localize generated ng-sq-ui pages and adapt layouts for text direction.
---

The built-in UI recipes supply en-US and bg-BG application text. Set UiSpec locale and direction explicitly. Inspect calendar/time APIs separately for their locale inputs and output value types.

Use Angular locale data for formatted dates and numbers. Keep stored models independent of visible translations. Use logical CSS properties and inspect long labels, navigation and table actions in the requested direction.

Additional languages and full application SSR require implementation and validation. The generated theme service guards browser APIs; this alone is not full SSR coverage.
