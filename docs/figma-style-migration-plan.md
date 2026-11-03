# Figma component style migration plan

Source: [SQUI Design System](https://www.figma.com/design/jeP0qbpUUGZbbxaWnvFr6i/SQUI-Design-System?node-id=28-10).

Use Figma exclusively as a read-only design reference. All implementation changes belong in this repository. Phase 2 implements the shared foundations; detailed component restyling follows in Phases 3 and 4.

Phase 1 progress (2026-11-03): [component/state inventory and browser baseline](style-migration/phase-1-inventory.md). All 17 Angular components have been inventoried and 38 baseline screenshots captured. Detailed Figma extraction remains partially blocked by the Starter-plan MCP quota; Phase 1 is not yet fully complete.

Phase 2 progress (2026-11-03): [shared foundations and consumer setup](style-migration/phase-2-foundations.md). Shared tokens, scoped theme/form rules, demo typography, inherited CSS customization, and portable Sass packages are implemented and checked. Unverified palette/shadow values retain documented transitional defaults.

Phase 3 progress (2026-11-03): [buttons and form controls](style-migration/phase-3-form-controls.md). Verified M buttons and small-field styles are implemented, with shared-field adaptations, optional help/error presentation, tests and browser checks. The phase remains partial: remaining exact variants and checkbox/radio/chip/menu designs are blocked by the Figma quota.

Phase 4 progress (2026-11-03): [remaining packages and expanded preview](style-migration/phase-4-components.md). Paginator, table densities/optional empty message, calendar/time controls, responsive modal sizes and progress heights now use the shared foundations. The `/#/preview` gallery includes all size examples and interactive states. 191 tests and browser checks at 1440px/390px pass. Geometry from the available Figma metadata is implemented; detailed visual fidelity remains pending because the Figma Starter MCP quota still blocks the remaining references. These adaptations do not close the source-design gaps in Phases 1 and 3.

Phase 5 progress (2026-11-03): [examples and consumer documentation](style-migration/phase-5-examples-and-docs.md). The gallery now includes interactive template contexts, helper/error recovery, local theme inheritance and direct source links. A [consumer styling/migration guide](styling.md) and [reference checklist](style-migration/preview-reference-checklist.md) cover setup, overrides, presentation options and exact known node IDs with evidence levels. Unread Figma variants remain explicitly pending for final comparison; Phase 5 does not close those source gaps.

Phase 6 progress (2026-11-03): [final local validation and remaining source gaps](style-migration/phase-6-validation.md). All seven production library builds, production app, 194 tests, lint, TypeScript, package exports and isolated Sass checks passed. Production-browser validation covers 1440/390/320px, 860/861px table breakpoints, real keyboard interaction/focus, labels, saved reference properties and previous custom-template/theme scenarios. Default checkbox/radio label associations, custom checkable focus and dialog title naming were corrected. **Local validation is complete; full Figma sign-off remains blocked** by the rechecked Starter MCP quota. Existing interaction limits and unread source variants are listed in the report.

1. **Phase 1: Establish the component and state inventory**

   1. Read each relevant Figma component's detailed design context and capture its reference screenshot. The supplied node `28:10` is the `_Tech` page; use the dedicated component pages for final colors, sizes, and states, and `_Tech` for the underlying structure.
   2. Record a mapping from Figma node to Angular component, including dimensions, typography, padding, borders, radii, shadows, icons, variants, and supported interaction states.
   3. Compare the current demo with the references and capture a visual baseline. Record existing public inputs, outputs, projected templates, Signal Forms behavior, and responsive behavior that the styling work must preserve.
   4. Mark every mapping as direct, shared-pattern adaptation, or separate feature. In particular, inspect textarea and typeahead against the shared input/dropdown patterns; do not invent Figma specifications for components without an exact counterpart. Treat standalone multiselect, steppers, and other absent components as separate features.

   Deliverable: component/state mapping with source node links, baseline screenshots, and explicit gaps. A component is ready for implementation only when its detailed reference has been read.

2. **Phase 2: Implement the shared style foundations**

   1. Extract the complete palette, text styles, spacing, radii, shadows, and control sizes from the reference. Introduce shared tokens under `projects/ng-sq-common/src/lib/styles/` and connect them to `sq-ui-theme.scss`.
   2. Use shared Sass values for compile-time styles and scoped CSS custom properties where consumer overrides are useful. Keep existing Sass entry points and compatible variable aliases. Retain the `.sq` theme convention and scope shared form rules so they do not affect unrelated controls.
   3. Replace duplicated palette values in the date picker, modal, table, and paginator with the shared tokens. Check the cascade carefully because the components use `ViewEncapsulation.None`.
   4. Define the component typography and document font loading. Apply IBM Plex Sans in the demo and use IBM Plex Mono where the inspected design calls for it. Preserve the library's documented ability to inherit a consumer font; verify any other required font's availability before using it.
   5. Ensure tokens and theme files are copied into the published packages. Verify their imports resolve from the built package layout as well as from repository sources.

   Deliverable: a shared foundation used by the theme and ready for all component packages, with documented font and override behavior.

3. **Phase 3: Update buttons and form controls**

   1. Restyle buttons first: typography, S/M/L/XL dimensions, primary/secondary appearance, status colors, hover, disabled, and keyboard focus. Map existing usage to a documented default; add optional presentation inputs only where needed to expose the designed variants. Keep the native button `type` behavior intact.
   2. Update the shared form styles and input/textarea/form-group templates where necessary for labels above fields, complete borders, padding, placeholder text, helper/error placement, and disabled states.
   3. Update checkbox and radio geometry, labels, selected/unchecked appearance, and disabled states. Keep native controls and label associations usable by keyboard and assistive technology.
   4. Update dropdown and typeahead triggers, menus, options, selection, scrolling, and loading presentation. Apply the shared field and option patterns where no direct component reference exists.
   5. Update tags input using the Chips and Tags references, preserving custom tag templates and add/remove interactions.
   6. Check default, hover, focus-visible, disabled, invalid, selected, and open states wherever applicable. For states absent from Figma, use the shared tokens and document the implementation choice. Verify Signal Forms bindings and projected templates after markup changes.

   Deliverable: styled `ng-form-elements` controls with equivalent behavior and examples of supported variants.

4. **Phase 4: Update the remaining component packages**

   1. Update the paginator in `ng-sq-common`: sizes, spacing, selected page, navigation icons, truncation, and disabled navigation.
   2. Update `ng-datatable`: header and row typography, colors, borders, density, sort indicators, and pagination integration. Record the Figma empty-state presentation as a separate addition: Phase 1 confirmed there is no built-in empty-state UI yet. Preserve custom cells, sorting events, and responsive behavior.
   3. Update `ng-datetime-picker`: calendar header, navigation, weekday/date cells, selected/today/disabled/outside-month states, month/year menus, and time-picker controls. Preserve date selection modes, the existing two-click range selection and hover preview, and Temporal behavior. Confirm whether Figma specifies a separate today appearance; the current implementation does not expose a dedicated today class.
   4. Update `ng-modal`: dimensions, spacing, surface, title/subtitle presentation where supported, close button, footer actions, shadow, and overlay. Let content and viewport constraints determine usable height rather than blindly copying fixed canvas dimensions. Preserve projection and existing close behavior.
   5. Update `ng-progress-bar`: designed heights, colors, and supported determinate/indeterminate presentation. Keep segmented and stepper designs in the feature-gap list unless the current API already supports them.

   Deliverable: all existing component families mapped to their Figma references, with unsupported features documented separately.

5. **Phase 5: Update examples and consumer documentation**

   1. Extend the existing demo routes with a compact gallery of the implemented sizes, variants, and states, using deterministic sample data.
   2. Use the shared typography and tokens in the demo where needed to assess the components accurately. Keep broader navigation, branding, and application layout redesign outside this component migration.
   3. Document theme imports, font setup, token overrides, presentation options, and any visible migration effects. Keep custom-template examples working.
   4. Maintain a checklist linking each implementation example to its exact Figma reference. Record unresolved design gaps without changing Figma.

   Deliverable: an inspectable demo and consumer instructions covering the updated component styles.

6. **Phase 6: Validate and finish**

   1. Compare rendered components against Figma screenshots at matching sizes, after fonts load. Check typography, dimensions, spacing, colors, borders, shadows, icon geometry, and all applicable states. Use real Angular components in these comparisons.
   2. Exercise keyboard navigation, visible focus, label associations, disabled behavior, error presentation, dropdown clipping, modal overflow, and narrow-screen layouts. Preserve a usable focus indicator even where the existing reset removes outlines.
   3. Run targeted existing component tests during each implementation phase. Add behavior tests only for meaningful markup or interaction changes; verify appearance in a real browser because the existing Vitest/jsdom suite cannot establish visual fidelity.
   4. Run the repository checks: `npm run build:libs`, then `npm run check:exports`, `npm run typecheck`, `npm test`, `npm run lint`, and `npm run build`. Explicitly cover all library lint targets; the root lint command alone targets the application. Verify published theme/form SCSS imports in a consumer-style Sass compilation.
   5. Review the final diff for accidental API changes, global style leakage, repeated tokens, and temporary Figma asset URLs. If assets are required, use local packaged assets and verify their rendered geometry.

   Deliverable: validated component updates, comparison screenshots, check results, and a concise list of any unresolved source-design gaps. No Figma edits or package publication are part of this plan.

## Initial source mapping

| Figma page | Existing implementation | Planned treatment |
| --- | --- | --- |
| Colors `0:1`, Text `7:2`, Grid `26:10` | `ng-sq-common` styles and theme | Shared foundations; inspect grid spacing without adding a grid system |
| Buttons `8:3` | `ng-form-elements/button` | Button sizes, appearances, status colors, and states |
| Input `8:4` | Input, textarea, form-group | Direct input styling; shared-pattern adaptation for related controls |
| Checkbox `36:46`, Radiobutton `36:47` | Checkbox, radiobutton | Geometry and interaction states |
| Dropdown `69:1364` | Dropdown, typeahead | Direct dropdown styling; shared-pattern adaptation for typeahead |
| Chips `88:432`, Tags `91:1284` | Tags input | Chip/tag appearance and removal control |
| Paginator `106:766` | `ng-sq-common/components/paginator` | Pagination styling |
| Table `8:5` | `ng-datatable` | Table densities, headers, rows, sorting, pagination |
| Datepickers `8:6` | `ng-datetime-picker` | Calendar and time-picker styling |
| Modal `221:2766` | `ng-modal` | Dialog surface, spacing, sizing, and actions |
| Progress Bar `92:1576` | `ng-progress-bar` | Supported progress-bar styles |
| Multiselect and Custom pages | Check against current APIs and template examples | Record feature gaps; do not automatically add components |

## Confirmed design details

These values were read from detailed component context, not estimated from screenshots. The complete token inventory remains a Phase 1-2 task.

- Primary brand button `31:44`: brand `#00C474`, white text, 4px corners, 16px horizontal and 4px vertical padding; IBM Plex Sans Medium, 14px/24px. The M button height is 32px.
- Button page metadata exposes S/M/L/XL heights of 24/32/40/48px, primary/secondary appearances, and brand/OK/warning/critical/hover/disabled examples. Exact styles for all variants still need detailed inspection.
- Field with label and error `69:850`: text `#202020`, border `#DCDCDC`, error `#FF3815`, 4px corners, and 8px horizontal/4px vertical padding. Label and field text use IBM Plex Sans Regular 12px/20px; error text uses 10px/16px.
- Current code uses older translucent teal colors, uppercase control labels, partial field borders, duplicated date-picker colors, and a demo font stack based on Open Sans/Nunito. Updating only the palette would leave substantial differences in layout and typography.

Proceed in phase order. Verify each component family before moving to the next so shared-style changes have a manageable scope.
