# Tabs implementation plan

- [x] Build standalone `TabsComponent`, `TabComponent`, label and lazy-content directives in `ng-sq-common`; export through both common and umbrella packages.
- [x] Implement stable-ID two-way selection, change/close events, disabled and hidden tabs, dynamic insertion/removal, custom labels, icons and badges.
- [x] Implement ARIA tab/panel relationships, roving focus, automatic/manual activation, arrow wrapping, Home/End, Enter/Space, Delete, vertical orientation and RTL.
- [x] Add lazy instantiation, optional preservation of visited panels, nested groups, three appearances and sizes, stretch alignment and overflow scrolling using shared theme tokens.
- [x] Integrate interactive playground and embedded examples, and document API, keyboard behavior, content lifecycle and consumer-controlled close handling.
- [x] Verify behavior with unit/integration tests, a browser regression script, lint, type checking, production builds and package checks.

Scope: tabs switch local panels. Use the existing navbar for route navigation. Consumers own their tab collection and decide whether to honor close requests.

## Verification

- 261 tests across 41 files pass, including 32 tabs behavior tests and the embedded add/close integration example.
- Workspace lint and TypeScript checks pass.
- All seven libraries and the production demo build successfully.
- Published package exports and isolated Sass consumer checks pass.
- Chromium browser checks pass at 1440px, 390px and 320px: ARIA references, keyboard navigation and Tab/Shift+Tab exits, lazy content lifecycle, preserved form values, all appearances/sizes, vertical/RTL layouts, scrolling, disabled groups and manual close/disable focus recovery.
- Desktop and mobile screenshots are generated under `tmp/tabs-preview/` for visual inspection.

## Review fixes

- [x] Keep a focused replacement header visible after closing an unselected tab in manual mode, including RTL overflow.
- [x] Recover focus when an unselected focused header becomes disabled, without stealing focus from outside controls.
- [x] Track the focused header as the tab stop while inside the list; restore the selected header as the entry point on exit.
- [x] Resolve selection and focus by surviving IDs in the previous order when tabs are removed or reordered together.
