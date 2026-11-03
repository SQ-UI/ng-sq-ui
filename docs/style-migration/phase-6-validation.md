# Phase 6: Final local validation

Validated on 2026-11-03. **Local builds, automated tests and browser checks pass. Final Figma sign-off remains incomplete because detailed source access is still quota-blocked.** No Figma file was changed and no package was published.

## Source access and visual comparison

Both a new `get_design_context` request (including its default screenshot) and a separate `get_screenshot` request for Table M `111:1954` returned the Figma Starter-plan MCP limit. The [access-check record](phase-6/figma-access-check.json) preserves that result. Repeating requests does not supply the missing palette, states, icons or detailed variants.

The available cached references were compared with real production-rendered controls after font loading:

| Reference | Checks and result |
| --- | --- |
| Primary M `31:44` | 32px height, brand `#00C474`, white text; shared M typography/geometry verified with the neutral control |
| [Tech neutral M `31:33`](references/button-detail.png) | 32px, 14px/24px, weight 500, radius 4px, `#FAFAFA` background and `#202020` text; cropped render visually inspected alongside the cached source |
| [Small field/title/error `69:850`](references/field-detail.png) | 240px example width, 28px field, 20px label and 16px message (64px total), 12px/20px field text, 4px/8px padding, inset `#DCDCDC` stroke, radius 4px and 10px/16px `#FF3815` error; cropped render visually inspected alongside the cached source |

The [cropped production neutral button](phase-6/screenshots/reference-neutral-m-1440.png) and [small field](phase-6/screenshots/reference-small-field-error-1440.png) exclude unrelated page layout. The font checks confirm IBM Plex Sans 400/500/700 are available. These checks validate the properties already retrieved; they do not establish missing hover/secondary/status/disabled specifications or exact fidelity for every family.

## Corrections made during validation

- Default checkbox/radio captions are native labels associated with their input IDs. Label activation changes the model once, while native input keyboard behavior remains intact.
- A custom checkbox/radio template without the default square/circle now shows the shared 2px keyboard outline around its wrapper. Default controls keep their existing square/circle focus treatment.
- Each modal links `aria-labelledby` to its own unique projected-title container. Production Chrome's accessibility tree exposes the projected dialog name. Consumers should supply meaningful title content.

These corrections preserve public inputs/outputs, native single-event behavior, templates, styling tokens and existing close behavior. Three regression tests cover native label activation and unique dialog title linkage.

## Complete repository checks

| Check | Result |
| --- | --- |
| All seven library production builds, in dependency order | Passed |
| Full Vitest suite after corrections | **37 files / 194 tests passed**, approximately 7.3s with two workers |
| Production application build after corrections | Passed |
| ESLint over `src` and every library under `projects` | Passed |
| TypeScript no-emit via `tsconfig.spec.json` | Passed |
| Built package exports/layout | Passed |
| Isolated consumer Sass | Passed: all eight public exports, shared configuration, legacy aliases, scoping and invalid-key checks |
| Runner/server JavaScript syntax, local artifact links and whitespace | Passed |

The first full run passed the original 191 tests. After the accessibility corrections, the full suite passed all 194 tests; affected form/modal/umbrella libraries and the app were rebuilt and lint/type checks rerun. Other library sources were unchanged after their successful builds. Checks used the installed Node CLI entry points rather than modifying the environment's npm trust configuration.

## Production browser coverage

The browser exercised the compiled production application from `dist/sq-ui/browser`, served only on localhost. Gallery checks reset state between **1440px, 390px and 320px** viewports; modal captures use a 640px-high viewport. Separate checks inspect the table transition at **861px and 860px**.

| Area | Validated behavior |
| --- | --- |
| Geometry | Button 24/32/40/48px, field 28/32/40px, progress 4/8/12px, desktop table 36/40/44px, calendar 320px height and time picker 56px height |
| Keyboard and focus | Real Chrome keyboard events for Tab/Shift+Tab, arrows, Space, Enter and Escape; button/field/dropdown/default and custom checkable 2px focus; disabled controls skipped in tab order |
| Labels and messages | Native input label focus, all gallery label targets resolve, no duplicate gallery IDs, default/custom checkable labels present, linked error alert and recovery to helper text |
| Dropdown | Arrow navigation, Enter selection, Escape/Tab closing, visible active option and horizontally contained menu with 200px maximum height |
| Checkables | Space toggles checkbox; native radio arrows select peers; custom templates retain visible focus and model updates |
| Templates | Dropdown selection/option/chevron, tag removal, typeahead search/select/remove, custom checkbox/radio contexts, caller-managed table rows and empty-message suppression |
| Table/paginator | Next/last-page changes and selected-page marker, complete desktop ascending/descending/original sort cycle, mobile cards and exact 860/861px header transition |
| Date/time | Seeded range, mouse hover preview, two-click completion, time spinner increment and disabled examples |
| Modal | All widths at desktop; narrow viewport clamping, body overflow with visible header/footer, X/Escape/outside close and accessible dialog name |
| Theme | Nested inherited brand, independent default-theme sibling, explicit progress color precedence, no horizontal document overflow |

The prior form route was also rechecked at 1440/390px with deterministic API fixtures. Its [foundation/form manifest](phase-6/foundations/manifest.json) confirms inherited overrides, styles isolated from unrelated elements, icon font, visible focus, verified reference dimensions and existing custom dropdown/tag/typeahead interactions. The full unit suite also covers Signal Forms integration; this browser run is not a claim of exhaustive Signal Forms interaction coverage.

[95 gallery screenshots and measurements](phase-6/screenshots/README.md) plus [38 foundation/form captures](phase-6/foundations/README.md) are saved separately from previous phases. Cropped references and representative narrow-screen menu/dialog/focus images were visually inspected. Both browser runs recorded zero uncaught runtime exceptions. This is Chrome coverage, not a cross-browser or complete assistive-technology certification.

## Final change review

The validation corrections are limited to checkbox/radio labels and fallback focus, modal title naming, and verification/documentation tooling. There are no new package dependencies, component feature APIs, data-flow changes or Figma writes. Focus CSS targets the relevant component hosts. The existing shared form/reset rules remain scoped, with inherited consumer overrides checked in a real browser and isolated Sass consumer.

No remote asset references were found in library HTML/SCSS. Existing packaged Font Awesome icons render with the correct font. Exact Figma icon geometry remains pending because those detailed assets have not been retrieved; no claim of icon-to-Figma equivalence is made.

## Remaining work before complete design sign-off

- [ ] Read every outstanding Figma component/size/state and save its screenshot/context when quota allows. Follow the [reference checklist](preview-reference-checklist.md).
- [ ] Replace transitional values only from detailed evidence: final secondary/status/hover/disabled styles, checkbox/radio geometry, dropdown menus/chips, range/selection values, modal overlay/shadow and final icon assets.
- [ ] Compare every family with its source at matching dimensions after fonts load, including the larger-size typography; metadata heights alone do not establish those styles.

Existing interaction limits remain visible in the report rather than being silently redesigned:

- Calendar cells/month-year menus do not provide a complete keyboard grid-navigation contract; no dedicated today style exists.
- Typeahead still lacks dropdown-equivalent keyboard option navigation/listbox behavior.
- Modal has no automatic initial focus, focus trap/restoration or background scroll lock. Naming/close/overflow checks do not resolve these broader behaviors.
- Mobile table cards hide the header and its sorting controls; no separate mobile sort UI is added.
- Dropdown keyboard selection works, but the trigger does not expose an `aria-activedescendant` relationship for announcing the active option.

These are preserved behavior/accessibility limits, not failed geometry assertions. They require deliberate interaction work if full accessibility coverage is the next objective. Final Figma approval remains pending regardless of the successful local checks.

## Reproduce

Build all libraries, then the production app. Serve the built files without installing another dependency:

```powershell
npm run build:libs
npm run build
node scripts/serve-built-preview.mjs
```

The server binds to `127.0.0.1:4201`; use `STYLE_PREVIEW_PORT` to choose another port. In another terminal:

```powershell
$env:STYLE_BASELINE_URL = 'http://127.0.0.1:4201'
$env:STYLE_PREVIEW_PHASE = '6'
node scripts/check-component-preview.mjs

$env:STYLE_BASELINE_OUTPUT = 'docs/style-migration/phase-6/foundations'
$env:STYLE_VERIFY_FOUNDATIONS = '1'
$env:STYLE_PHASE3 = '1'
node scripts/capture-style-baseline.mjs
```

Both runners use installed Chrome with isolated temporary profiles and no added packages. `STYLE_BASELINE_BROWSER` can point to another installed Chrome executable. Phase 4/5 output modes remain supported by the gallery runner. Stop the local server with Ctrl+C when finished.
