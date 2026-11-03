# Phase 4: Remaining components and expanded preview

Implemented on 2026-11-03. Figma remains read-only. Source: [SQUI Design System](https://www.figma.com/design/jeP0qbpUUGZbbxaWnvFr6i/SQUI-Design-System?node-id=28-10).

The implementation is available for review in the demo's **Preview** navigation item (`/#/preview`), also embedded in `/#/sq-ui`. It uses the actual Angular library components and deterministic local data rather than external services.

## Reference coverage

The detailed Phase 3 references for M buttons and small fields remain the verified base. The previously saved Figma metadata establishes additional dimensions, including table densities, calendar cells, modal widths and progress heights. A fresh attempt to read the remaining detailed component contexts still returned the Figma Starter-plan MCP quota error.

Accordingly, the additional geometry below follows that metadata, while its palette, typography, spacing and interaction styling reuse the shared foundations or retain documented transitional values. This is a shared-pattern implementation awaiting final Figma comparison, not a claim that all component variants now match their detailed Figma designs. No Figma nodes were changed.

## Preview coverage

| Family | Examples |
| --- | --- |
| Buttons | S/M/L/XL at 24/32/40/48px, primary, neutral and disabled |
| Fields | S/M/L at 28/32/40px, labels, helper, error, disabled input and dropdown |
| Other form controls | Textarea, tags, interactive typeahead, checkbox/radio states |
| Progress | 4/8/12px determinate bars and an infinite bar |
| Tables | Three densities, sortable columns, integrated pagination, empty message |
| Paginator | Independent example with current-page summary |
| Calendar/time | Single date, seeded range, range hover/selection, disabled calendar, editable AM/PM, spinner-only and disabled time |
| Modals | 360/400/440px launchers, long content, title/subtitle and footer actions |

Button sizes beyond M currently retain the verified M typography (14px/24px). They vary vertical padding using `--sq-button-padding-block` (0/4/8/12px). Field examples retain 12px text and vary their internal line height through `--sq-field-line-height` (20/24/32px), with 4px vertical padding. The default button and field dimensions remain M (32px) and small (28px), respectively. These are CSS customization hooks; no new button or field `size` input is introduced before the remaining detailed references are available. The gallery explicitly labels this limitation.

## Component changes

| Component | Result | Behavior retained |
| --- | --- | --- |
| Paginator | Neutral 32px controls, 4px gaps/corners, brand current page, accessible navigation names and `aria-current` | Page calculations, disabled/truncated controls, collection slicing and page events |
| Datatable | Shared text/borders, neutral header/stripes, `size` for 36/40/44px desktop row/header minimum heights, named sort buttons, opt-in `emptyText` status | Full sort cycle/events, pagination, custom headers/bodies/cells, responsive cards |
| Calendar | 280px width, 320px height with 40px header/weekday/day rows, compact text, shared neutral heading and brand selected/range edges, named previous/next buttons | Month/year menus, outside-month and disabled dates, Temporal values, single/range selection and two-click hover preview |
| Time picker | Compact 56px control with 24px input row, named hours/minutes, spinners shown on hover/focus and touch devices | Editable/spinner-only behavior, AM/PM, increments and disabled state |
| Modal | `size` for 360/400/440px widths, 16px viewport spacing, viewport-limited height, scrolling body with visible header/footer | Projection, show model, custom animation settings, X/Escape/outside closing |
| Progress | Shared track/fill and 4/8/12px heights, accessible `label`, determinate value semantics | Existing size values, loaded/infinite behavior and inline color overrides |

New geometry values are shared tokens in `ng-sq-common`; they support the existing Sass override and inherited CSS variable mechanisms. Styling remains under the `.sq` theme convention.

### Consumer options

```html
<sq-datatable size="small" [items]="rows()" emptyText="No results"></sq-datatable>
<sq-modal size="large" [(show)]="showDetails">...</sq-modal>
<sq-progress-bar size="medium" label="Uploading documents" [loaded]="62"></sq-progress-bar>
```

Table and modal `size` use the existing exported `Size` type (`'small' | 'medium' | 'large'`). Both default to `'medium'`. `emptyText` defaults to `''`, so existing empty tables do not acquire an unsolicited message. A custom body template always retains control of its content. Progress `label` defaults to `'Progress'`.

The modal's default width changes from viewport-relative to 400px. Its body now scrolls within the viewport. Consumers with CSS coupled to previous component geometry should review their overrides. Full API details are in the [table](../datatable-module.md), [modal](../modal-module.md) and [progress](../progressbar-module.md) documentation.

## Validation

- All seven library production builds passed in dependency order; the date/time library was rebuilt after the final range-preview cascade correction.
- Production application build passed.
- 37 Vitest files / **191 tests** passed with two workers. New behavior checks cover optional table empty messages/custom bodies, progress accessibility and paginator navigation/current-page semantics.
- ESLint over `src` and all `projects`, TypeScript no-emit, package exports and eight isolated-consumer Sass imports passed.
- Real Chrome checks passed at **1440px and 390px**: button/field/progress geometry, desktop table heights, mobile cards, no horizontal document overflow, paginator next/last page, desktop ascending/descending/reset sort, range preview/completion, time increments and all modal sizes.
- Modal checks use a 640px-high viewport and confirm body scrolling, viewport clamping and X/Escape/outside closing. At 390px the browser scrollbar leaves 375px of available width, yielding a 343px dialog after the two 16px margins.
- [36 screenshots](phase-4/screenshots/README.md) and the [measurement/interaction manifest](phase-4/screenshots/manifest.json) are separate from the earlier phase captures. Fonts were loaded before measurement; no uncaught runtime exceptions were recorded. Representative desktop button/table/calendar and mobile field/range/dialog screenshots were visually inspected.

To reproduce, build the libraries, serve the application on port 4201, then run:

```powershell
$env:STYLE_BASELINE_URL = 'http://127.0.0.1:4201'
node scripts/check-component-preview.mjs
```

The runner uses installed Chrome with an isolated temporary profile, resets the page between viewport runs and writes its manifest/screenshots under `docs/style-migration/phase-4/screenshots/`. The overview is a viewport capture; each component section has its own capture, with additional range-interaction and modal images.

## Pending source comparison and existing limits

- Detailed Figma typography, secondary/status/hover/disabled variants, icons, shadows and remaining palette values still require source inspection. The modal shadow, calendar preview/outside/disabled values and some control states retain transitional tokens.
- Larger button/field typography is intentionally not inferred from dimensions alone. Final variant APIs and exact visuals remain pending.
- The table's opt-in empty message is a functional addition; no detailed Figma empty-state layout has been read. Segmented progress/stepper and unsupported standalone components remain feature gaps.
- The calendar still has no dedicated today style. Month/year menu behavior and existing date semantics are preserved; browser coverage here focuses on single/range controls rather than every date-navigation edge case.
- Existing mobile table cards hide the header, including its sort controls; this phase preserves that behavior. A mobile sorting interaction would require a separate UI decision.
- Existing modal focus trapping/restoration and background scroll handling are not expanded in this styling phase. The viewport and close checks do not establish complete dialog accessibility.
- Final screenshot-to-Figma fidelity review remains pending the missing source access. Phase 4 implementation and local validation are complete for the available evidence; full design migration remains partial.
