# Phase 1: component, state, and visual inventory

Inspected on 2026-11-03 against commit `2ff11a9e43bc447bc87a1019da1f86372e6d3db0`.

**Status: repository inventory and browser baseline complete; detailed Figma inventory partially blocked.** Figma returned `You've reached the Figma MCP tool call limit on the Starter plan`. The remaining designs must be read when access is available before claiming Phase 1 is complete. No component implementation or Figma document was changed.

Source: [SQUI Design System](https://www.figma.com/design/jeP0qbpUUGZbbxaWnvFr6i/SQUI-Design-System?node-id=28-10). The linked node is the `_Tech` page. Dedicated component pages contain the presentation variants. `_Tech` contains reusable building blocks and must not be treated as the final appearance of every variant.

## Evidence and completion checklist

- [x] Inspect all 17 Angular component implementations, their templates, and stylesheet dependencies.
- [x] Snapshot signal inputs/models/outputs, projection slots, template contexts, events, and media queries in [source-inventory.json](source-inventory.json).
- [x] Classify mappings as direct, shared-pattern adaptation, or separate feature.
- [x] Capture 38 current-demo screenshots at 1440x1000 and 390x1000, plus computed styles and font status in [baseline/manifest.json](baseline/manifest.json).
- [x] Read detailed context and screenshots for `_Tech / Button M` and `_Tech / Field Title Info`; read detailed Primary Brand M button context during the initial planning pass.
- [x] Record known page/node IDs, metadata dimensions, public-contract constraints, and feature gaps.
- [ ] Read detailed context for every remaining relevant component/state/size and save its reference screenshot. Quota blocked.
- [ ] Complete exact per-variant typography, padding, borders, shadows, colors, and icon asset mapping. Metadata alone is insufficient.
- [ ] Compare every component family with its detailed Figma reference. Initial button/field differences are established; other comparisons remain provisional.

Evidence levels below distinguish **detailed** context (actual styles), **metadata** (names/structure/dimensions only), and **pending** (not yet retrieved). No component family has complete implementation references for all of its variants yet.

## Component mapping

| Existing component and source | Figma reference | Mapping | Evidence and remaining work |
| --- | --- | --- | --- |
| [sq-button](../../projects/ng-form-elements/src/lib/button/button.component.ts) | [Buttons `8:3`](https://www.figma.com/design/jeP0qbpUUGZbbxaWnvFr6i/SQUI-Design-System?node-id=8-3); Primary Brand M `31:44`; base M `31:33` | Direct | Detailed M examples, metadata for 48 variants. Read every other size/appearance/status before implementation. |
| [sq-input](../../projects/ng-form-elements/src/lib/input/input.component.ts) | [Input `8:4`](https://www.figma.com/design/jeP0qbpUUGZbbxaWnvFr6i/SQUI-Design-System?node-id=8-4); field/title/error base `69:850` | Direct | Detailed base S field; metadata for 21 final variants. Active, success, filled, and final error appearance still require detailed context. |
| [sq-textarea](../../projects/ng-form-elements/src/lib/textarea/textarea.component.ts) | Input field foundations, starting with `69:850` | Shared-pattern adaptation | No dedicated textarea page in the page listing. Adapt verified field styling to multiline content; retain editable behavior and minHeight. Do not claim an exact textarea Figma specification. |
| [sq-form-group](../../projects/ng-form-elements/src/lib/form-group/form-group.component.ts) | Input labels plus checkbox/radio layouts | Shared-pattern adaptation | Container and projected content, not a distinct verified Figma component. Do not automatically apply a text-field border around the whole group. |
| [sq-checkbox](../../projects/ng-form-elements/src/lib/checkbox/checkbox.component.ts) | [Checkbox `36:46`](https://www.figma.com/design/jeP0qbpUUGZbbxaWnvFr6i/SQUI-Design-System?node-id=36-46); icon `54:130`; shared row `41:132` | Direct | Dedicated page read was quota blocked. Tech metadata establishes 16x16 icon and 20px row examples; detailed checkbox states and assets pending. |
| [sq-radiobutton](../../projects/ng-form-elements/src/lib/radiobutton/radiobutton.component.ts) | [Radiobutton `36:47`](https://www.figma.com/design/jeP0qbpUUGZbbxaWnvFr6i/SQUI-Design-System?node-id=36-47); icon `54:283`; selected `89:800`; disabled `89:802` | Direct | Tech metadata includes 16x16 icon and 141x20 selected/disabled examples. Dedicated page and detailed states pending. |
| [sq-dropdown](../../projects/ng-form-elements/src/lib/dropdown/dropdown.component.ts) | [Dropdown `69:1364`](https://www.figma.com/design/jeP0qbpUUGZbbxaWnvFr6i/SQUI-Design-System?node-id=69-1364); `71:695`-`71:706`, `72:609`-`72:611` | Direct | Metadata for S/M/L triggers, labels, open options, and scrollable options. Detailed option, selection, chevron, border, and shadow styles pending. |
| [sq-tags-input](../../projects/ng-form-elements/src/lib/tags-input/tags-input.component.ts) | [Tags `91:1284`](https://www.figma.com/design/jeP0qbpUUGZbbxaWnvFr6i/SQUI-Design-System?node-id=91-1284), [Chips `88:432`](https://www.figma.com/design/jeP0qbpUUGZbbxaWnvFr6i/SQUI-Design-System?node-id=88-432); chip bases `90:1257`-`90:1259` | Direct family; exact composition pending | Chip Tech dimensions known. Dedicated Tags/Chips reads quota blocked; confirm composition and remove-icon assets before styling. |
| [sq-typeahead](../../projects/ng-form-elements/src/lib/typeahead/typeahead.component.ts) | Input + Dropdown + Chips; [Multiselect `88:505`](https://www.figma.com/design/jeP0qbpUUGZbbxaWnvFr6i/SQUI-Design-System?node-id=88-505) for visual comparison | Shared-pattern adaptation | Has search, loading, single/multiple selected chips. No exact search/typeahead page found. Multiselect metadata is not proof of equivalent interaction. |
| [sq-paginator](../../projects/ng-sq-common/src/lib/components/paginator/paginator.component.ts) | [Paginator `106:766`](https://www.figma.com/design/jeP0qbpUUGZbbxaWnvFr6i/SQUI-Design-System?node-id=106-766) | Direct | Page exists; page detail and final states quota blocked. Do not infer paginator sizes from unrelated arrow icons. |
| [sq-datatable](../../projects/ng-datatable/src/lib/datatable/datatable.component.ts) | [Table `8:5`](https://www.figma.com/design/jeP0qbpUUGZbbxaWnvFr6i/SQUI-Design-System?node-id=8-5); `111:1953`-`111:1955`, `111:2541`-`111:2543` | Direct | Metadata covers S/M/L with/without paginator and empty examples. Detailed header/row/sort/empty-state styles pending. |
| [sq-datatable-column](../../projects/ng-datatable/src/lib/datatable-column/datatable-column.component.ts) | Table header `111:1145`, top cell `111:1036`, title `111:941`; sort icons `107:888`, `107:919`, `211:5089` | Direct subcomponent | Tech metadata only. Confirm which sort assets correspond to unsorted/ascending/descending. |
| [sq-datatable-row](../../projects/ng-datatable/src/lib/datatable-row/datatable-row.component.ts) | Table row `111:1146`, cell `111:1127` | Direct subcomponent | Tech metadata only. Density, borders, row states, and typography pending. |
| [sq-datetime-picker](../../projects/ng-datetime-picker/src/lib/datetime-picker/datetime-picker/datetime-picker.component.ts) | [Datepickers `8:6`](https://www.figma.com/design/jeP0qbpUUGZbbxaWnvFr6i/SQUI-Design-System?node-id=8-6), Calendar `114:2287`; [Custom Datepickers `222:5296`](https://www.figma.com/design/jeP0qbpUUGZbbxaWnvFr6i/SQUI-Design-System?node-id=222-5296) | Direct; range styling requires confirmation | Metadata for standard and Custom calendars retrieved. Existing range behavior must survive; do not classify range selection as a missing feature. Detailed selected/range/disabled/outside-month states pending. |
| [sq-time-picker](../../projects/ng-datetime-picker/src/lib/datetime-picker/time-picker/time-picker.component.ts) | Timer Default `114:2766`, Picker `114:2771`, TypeIn `114:2776`, AMPM `114:2783` | Direct | Names and dimensions known. Detailed typography, spinners, edit, meridiem and disabled appearances pending. |
| [sq-modal](../../projects/ng-modal/src/lib/modal/modal.component.ts) | [Modal `221:2766`](https://www.figma.com/design/jeP0qbpUUGZbbxaWnvFr6i/SQUI-Design-System?node-id=221-2766); S `221:3650`, M `221:3634`, L `221:3662`; base `221:3206` | Direct | Metadata for sizes. Full styles, close asset, action arrangement, overlay, and Custom Modal references pending. |
| [sq-progress-bar](../../projects/ng-progress-bar/src/lib/progress-bar/progress-bar.component.ts) | [Progress Bar `92:1576`](https://www.figma.com/design/jeP0qbpUUGZbbxaWnvFr6i/SQUI-Design-System?node-id=92-1576); continuous `107:832`, `107:842`, `107:840` | Direct for continuous bars | Continuous/segmented/stepper metadata known. Only continuous progress and indeterminate animation currently supported. Detailed colors/corners and animation correspondence pending. |

Raw metadata retrieved during this phase is saved in [figma-metadata.json](figma-metadata.json). Other page/node dimensions above were observed during the initial planning pass. Detailed screenshots currently saved: [base M button](references/button-detail.png), [field with title and error](references/field-detail.png). Their context text is stored beside the images. These are reference images only, never implementation assets.

## Known dimensions and actual style evidence

| Family | Confirmed evidence | Interpretation |
| --- | --- | --- |
| Buttons | S/M/L/XL height 24/32/40/48px; 48 named examples = four sizes x primary/secondary x brand/OK/warning/critical/hover/disabled | Metadata dimensions, not complete variant specifications. Use natural text width; do not copy the width of a sample label. |
| Primary Brand M | `31:44`: `#00C474` background, white text, radius 4px, horizontal padding 16px, vertical padding 4px; IBM Plex Sans Medium 500, 14px/24px, zero letter spacing | Detailed context inspected. Its component name is M even though the associated text style is named Button S 14-24. Match actual properties rather than inferring from the name. |
| Base M button | `31:33`: `#FAFAFA` background, `#202020` text, same padding/type/radius as above | Tech building block, not the Primary Brand final variant. |
| Inputs | S/M/L bare field heights 28/32/40px; sample widths 240/280/320px. With title: 48/52/60px. With assistive text: 64/68/76px | Page metadata. Widths are sample sizes; responsive behavior needs a deliberate mapping. |
| Field/title/error base | `69:850`: 1px `#DCDCDC` border, radius 4px, horizontal/vertical padding 8/4px, text `#202020`; IBM Plex Sans Regular 400, 12px/20px; error `#FF3815`, 10px/16px | Detailed Tech S context inspected. Final Input Error/Success variants have not been read. |
| Dropdown | Bare S/M/L 28/32/40px; open-with-title examples 148/176/208px tall; scrollable >4 option examples 196/236/280px | Metadata. S no-title sample is 236px wide while titled S is 240px; preserve this discrepancy for verification rather than silently standardizing. |
| Chips | Tech S 70x20px, M 82x24px, L 109x32px | Metadata only. Width includes sample text and is not a fixed-width requirement. |
| Tables | S/M/L sample width 1024px; normal heights 252/280/308px; with paginator 288/320/352px; empty example headers 36/40/44px | Metadata. Inspect actual cell/row styles before introducing density options. |
| Calendar/time | Calendar 280x320px; Tech date cell 40x40px; four timer examples 96x56px | Metadata only. Keep sizing flexible for consumer layouts and long localized month names. |
| Modal | S 360x312px, M 400x384px, L 440x432px | Instance dimensions only; no verified min/max height or breakpoint behavior yet. |
| Progress | Continuous small/medium/large examples have heights 4/8/12px, sample width 512px | Metadata. Existing `small`/`medium`/`large` API can retain its names while changing style values later. |

The typography page names IBM Plex Sans Regular/Medium/Bold, IBM Plex Mono Regular/Bold, and an H1 font named `Insitut`. Only the Sans styles above have detailed properties recorded. H1 font spelling, availability, loading rights, complete palette, grid spacing, shadows, and focus styles remain unverified. Do not substitute guessed values.

## Public behavior to preserve

The nine form controls share `name`, `controlId`, `controlLabel`, `controlPlaceholder`, `required`, `pattern: readonly RegExp[]`, `disabled`, a two-way `value` model, and `touch`. IDs must remain unique. The runtime [contract tests](../../projects/ng-form-elements/src/lib/form-field-contract.spec.ts) currently exercise input/checkbox/tags; the [Signal Forms integration tests](../../projects/ng-form-elements/src/lib/signal-forms.integration.spec.ts) exercise input/checkbox model-to-view, view-to-model, required, and touch. This is useful existing coverage, not proof that every control/state has been browser-verified.

| Family | Additional public surface | Projection/templates and behavior |
| --- | --- | --- |
| Button | `type` defaults to button and validates button/submit/reset; `disabled` | Arbitrary content in `.inner`. Existing callers listen to host click; preserve native submit/reset behavior. No current appearance/size/status inputs. |
| Input | `type`, `value: string` | Native input, linked label, placeholder, native required/pattern, blur emits touch. No helper/error/success presentation inputs or message slot. |
| Textarea | `minHeight` defaults to 100; `value: string` | Contenteditable div, multiline text/linebreak preservation, placeholder pseudo-element, ARIA textbox; disabled blocks editing/focus. Replacing it with a native textarea would be a behavior change. |
| Checkbox | `value: boolean`, `isSelectedChange` | `sq-checkbox-label` context `{isSelected}`. Invisible native checkbox overlays the entire control; preserve the single native event path and visible focus styling. |
| Radio | `radioValue`, generic `value: TValue|null`, `isSelectedChange` | `sq-radio-label` context `{value,isSelected}`. Native same-name group behavior plus shared event broadcaster; preserve arrow-key selection and deselection notifications. |
| Form group | `groupLabel` | Arbitrary content projection. Existing label is a div; semantic fieldset/legend changes would require deliberate behavior/accessibility review. |
| Dropdown | `options: LabelValuePair[]`, `value: LabelValuePair|null`, `onSelectItem` | `sq-dropdown-selected-option` `{value}`, `sq-dropdown-option` `{option}`, `sq-dropdown-chevron` `{isDropdownOpen}`. Combobox/listbox roles; Tab focus, arrows, Enter/Space, Escape/Tab close; outside click and focus leave emit touch. Selected option is copied. Single selection only. |
| Tags | `value: string[]` | `sq-tag` `{tag,remove}`. Space/Enter/comma commit text; Backspace in empty input removes the last tag; remove buttons remain named and hidden while disabled. |
| Typeahead | `searchResults`, `multiple`, `delay` (500ms), `displayProp`, `hideSearchIcon`, `value: LabelValuePair[]`, `onUserInputEnd` | `sq-typeahead-option` `{option}`, `sq-typeahead-selected-option` `{item,remove}`. Debounced search, loader clears on a new results array, single/multiple selection, chips/removal, outside close, programmatic writes. No dropdown-equivalent keyboard listbox behavior in its current template. |
| Paginator | `items`, `itemsPerPage`, `currentPage`, `lastPage`, `maxDisplayedPages`, `paginatedCollection` model, `pageChange` | First/previous/page/next/last buttons; truncation; disabled edges; support announced server-side lastPage beyond currently loaded rows. |
| Table | Generic `items`, `sortByAllColumns`, `sortByColumns`, `paginatorConfig`; `onSortClicked`, `pageChange` | `sq-datatable-header` and `sq-datatable-body` templates are inserted into the respective sections. Preserve sorting across all items, page changes, stable column order, and explicit original-order state. |
| Table column/row | Column requires `name`, takes `isSortable`, `activeSortColumn`, emits `onSortClicked`. Row takes `rowItem`, `columns`, deprecated no-op `width` | Keep attribute selectors on th/tr. Column cycles ascending -> descending -> original. Cell text is escaped/interpolated; do not interpret consumer text as HTML. |
| Date picker | `locale`, `minDate`, `maxDate`, `isMultipleSelect`, `format`, `isTimepickerEnabled`, `dateObjectType`, `timepickerConfig`, `value: DatetimePickerValue`; `dateSelectionChange` | Native Date/Temporal/unix/formatted output contracts; month/year navigation; external writes/reset; optional time. Multiple select is a two-click inclusive range with preview, start/end edges, earlier-date rejection, touch-pointer exclusions, and pending-start preservation across month changes. |
| Time picker | `hourStep`, `minuteStep`, `isMeridiem`, `isEditable`, public aliases `hours`, `minutes`, `timeObjectType`, `value: TimePickerValue`; aliases `hoursChange`, `minutesChange` | Spinners, typing validation on blur, AM/PM toggle. isEditable=false disables typing but leaves spinners usable; disabled blocks both. Keep these distinct appearances. |
| Modal | `show` model; `customCssAnimation {duration,entranceAnimation,exitAnimation}` | `[sq-modal-title]`, `[sq-modal-body]`, `[sq-modal-footer]`. Initially true is immediately shown; button/outside/Escape close; default 500ms entrance/exit behavior. Subtitle can be projected without inventing a mandatory new slot. |
| Progress | `size`, `loaded`, `infinite`, `backgroundColor`, `fillColor` | Preserve inline color overrides, percentage width, continuous animation, and default medium size. No segment/step data model. |

## State coverage

| Family | Current states/behavior to retain | Figma discovery status | Browser baseline |
| --- | --- | --- | --- |
| Buttons | Normal, hover/active, native disabled, native type behavior | Primary/secondary, four sizes, status/hover/disabled named; focus not confirmed | Submit button default |
| Input/textarea | Empty, filled, placeholder, focus, disabled, required/pattern contract | Input empty/title/assistive/active/text/error/success named; disabled/focus-visible specifics not confirmed | Empty labelled input/textarea, desktop/mobile |
| Checkbox/radio | Unchecked/selected, disabled, native keyboard focus, projected label | Checkbox/radio dedicated states pending; Tech selected/disabled radio known | Native checkbox unchecked/checked; radio group including custom label |
| Dropdown | Closed/open, placeholder/selection, active keyboard option, disabled, outside close | No-title/title/options/>4 options, S/M/L named | Closed and open menu |
| Tags/typeahead | Empty/selected, add/remove, disabled, loading/results, single/multiple typeahead | Tags/Chips pending; Multiselect metadata only | Existing chip and empty typeahead; custom-template examples visible in context |
| Paginator/table | First/last disabled, current page, truncation, sorted/unsorted, announced unloaded pages | Paginator details pending; table density/paginator/empty variants named | Populated default table, ascending state, paginator; responsive cards on mobile |
| Date/time | Selected/outside-month/disabled, month/year picker, pending/completed range, time editable/noneditable, AM/PM | Standard/custom calendar and timer variants named; exact state styles pending | Selected/disabled calendar, month picker, integrated AM/PM time control |
| Modal/progress | Modal closed/open/animation; progress determinate/indeterminate | Modal S/M/L; progress continuous/segmented/stepper structures | Open modal; three bar sizes and infinite bar |

Baseline screenshots do not claim exhaustive interaction, disabled/error-state, keyboard, range-preview, or accessibility test coverage. Those behaviors are recorded from code and existing test definitions; add targeted visual scenarios during the corresponding implementation phase.

## Visual differences established so far

- The current desktop field is 41px tall with 16px Open Sans text, 9px/10px vertical/horizontal padding, no corner radius, and only bottom/left teal borders. The detailed Tech S field uses a complete neutral border, 4px corners, 12px/20px IBM Plex Sans text, and 4px/8px padding. Current labels sit inside the border; the Figma base places the label above it.
- The current Submit button measures about 91x54px with square corners and uppercase 16px text; Primary Brand M is 32px tall with 4px corners and 14px/24px medium text. These labels differ, so widths are not a like-for-like comparison.
- At 390px viewport width the current field is 77px tall, with 17.6px text and a stacked label. Preserve usable narrow layouts while replacing these oversized mobile rules with verified component sizing later.
- The current calendar wrapper measures 410x266px on desktop and 320x266px on mobile, compared with the Figma calendar's 280x320px metadata. The demo separately overrides the calendar table to Nunito. Confirm exact header/date geometry before changing it.
- Current table headers are translucent teal with uppercase text; the earlier `_Tech` overview shows a dark header. Exact header colors/type still need detailed context; do not choose a dark value by sampling the screenshot.
- Current modal surfaces use a colored title/footer band, a large fixed content region, and an offset teal shadow. The initial Figma overview shows a lighter surface treatment, but exact border/shadow/overlay properties are still pending.
- Current progress heights are 2/4/7px in source; Figma metadata gives 4/8/12px. Retain existing size names and runtime color overrides.

Measured styles, actual loaded font faces, text, bounds, and viewport overflow indicators are in the baseline manifest. Screenshots preserve the original viewport and nested scrolling; no styles were injected. Small variation in widths due to scrollbars is expected. This is an observational baseline, not a pixel-diff acceptance suite.

## Feature gaps and boundaries

1. **Input validation presentation:** Figma has assistive/error/success examples; the existing form contract has no message, visual status, or success inputs. Global `.error` CSS exists but the input template does not render an error message. Define a backward-compatible presentation interface before implementing these states. Do not equate browser validity with an invented Figma state.
2. **Presentation variants:** button appearances/status/sizes, field densities, table densities, and modal sizes lack dedicated public inputs. Determine optional defaults and compatibility in later phases. This inventory does not add API options.
3. **Table empty state:** no built-in zero-state message/icon/template currently exists; the default empty table has no generated columns. Figma empty examples are a separate behavior/presentation addition, not a CSS-only change.
4. **Standalone multiselect:** the dropdown is single-select. Typeahead's `multiple` mode covers searchable multi-selection, but it is not the same checkbox option-menu component. Keep a standalone multiselect separate unless explicitly included later.
5. **Segmented progress and steppers:** Figma contains both; the current API has only continuous bars. Do not emulate them by decorating a percentage bar without a data contract.
6. **Chips, links, anchors:** chips are currently rendered inside tags/typeahead, not a standalone exported component. Link/Ancor pages exist but there is no matching Angular link component. Shared anchor styles may be part of foundations; new components are separate scope.
7. **Calendar range:** already implemented. The Custom Datepickers page likely relates to richer selections, but its detailed intent is not yet verified. Preserve the current range classes/behavior and read the source before styling.
8. **Accessibility:** visible focus exists for native checkbox/radio visuals; base inputs/buttons and contenteditable currently remove outlines. Checkable labels are visual divs, paginator icon buttons lack accessible names, typeahead lacks keyboard listbox handling, and modal lacks focus trapping/restoration. These are existing code findings, not changes made or comprehensive audit results. Preserve working behavior and distinguish focused fixes from new interaction work.
9. **Responsive rules:** shared fields switch below 500px, tags/typeahead/dropdown below 450px, calendar below 450px, table below 860px, and modal at 1300/900px. Figma breakpoint behavior is unverified. Do not remove existing mobile table cards or constrain modal content to fixed sample heights without checking usability.
10. **Shared CSS/package risk:** components all use `ViewEncapsulation.None`. Global `.disabled`, `.input-field`, `.error`, and `.checkable` selectors can affect consumers outside `.sq`; optional reset applies to all elements. SCSS currently imports sibling repository paths, while theme/form styles are copied into packages. Later foundation work must verify both scope and published import resolution.

Custom Tags/Table/Modal detailed reads were quota blocked. Their presence does not automatically add all custom examples to the styling scope. Logo, cover artwork, application navigation redesign, grid implementation, release publication, and Figma editing remain outside this migration.

## Reproducing and finishing this phase

Refresh the source snapshot with `node scripts/inventory-component-styles.mjs`.

Start the demo without npm's destructive prestart step:

```powershell
$env:CI = 'true'
$env:NG_CLI_ANALYTICS = 'false'
node node_modules/@angular/cli/bin/ng.js serve --host 127.0.0.1 --port 4201 --open=false
```

In another terminal, run `node scripts/capture-style-baseline.mjs` with `STYLE_BASELINE_URL=http://127.0.0.1:4201`. The script uses Node's built-in WebSocket and installed headless Chrome, an isolated profile under ignored `tmp/`, and no installed browser automation dependency. `STYLE_BASELINE_BROWSER` can override the browser executable. The application uses `/#/` routes.

Capture fixtures replace only browser fetch responses: 40 synthetic todos, existing bundled user/resource fallbacks. Trackers and GitHub button scripts are blocked in that isolated browser. Dates, progress values, and animations retain current demo behavior; they are not fully deterministic and must be stabilized for later visual regression checks. No source styles, templates, or component data were edited.

Validation performed: source inventory script completed for 17 components; browser script passed syntax checking and captured 38 nonempty PNGs; representative desktop/mobile screenshots were visually inspected; development compilation succeeded; baseline recorded no uncaught runtime exceptions. This phase did not run or claim the full unit-test/lint/production-build suite because it changes documentation and capture tooling only.

To finish the blocked Figma portion after quota is available:

1. Read the detailed contexts and screenshots for missing families, then their sizes and states; reuse known node IDs from this report and the metadata snapshot.
2. Replace each pending entry with measured font, spacing, border, radius, shadow, color, and icon asset information; record unspecified focus/responsive behavior as an explicit implementation choice.
3. Save reference screenshots locally and extend the state checklist. Download any needed icons only through the supplied asset workflow; keep temporary Figma URLs out of runtime code.
4. Compare the unchanged baseline with all final component references. Mark the phase complete only after these checks. Do not start component styling based solely on metadata or inferred screenshot colors.
