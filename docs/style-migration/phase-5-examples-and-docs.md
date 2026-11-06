# Phase 5: Examples and consumer documentation

Completed on 2026-11-03 for the current repository implementation. Figma remains read-only; no package publication is included. Missing detailed Figma references and final visual comparisons remain pending rather than being marked complete by this documentation phase.

## Examples

The actual component gallery at `/#/preview`, also embedded in `/#/sq-ui`, retains the size and state examples from Phase 4 and adds:

- Direct Figma links and evidence notes next to button, field, progress, table/paginator, calendar/time and modal families.
- Caller-controlled helper/error recovery: showing an error replaces the helper and exposes linked invalid/alert semantics; clearing it restores the helper.
- All eight form-template directive contexts: dropdown selection/option/chevron, tag removal, typeahead result/selection removal, checkbox selection and radio value/selection.
- A table with caller-managed header/body rows and mobile cell headings. Empty automatic data prevents duplicate rows, and a custom body suppresses the opt-in empty message.
- Local brand/border overrides inherited through a nested `.sq`, an independent default-theme example and explicit progress color precedence.

All examples use deterministic local data and existing components/directives. Consumer template decorations and the alternative theme are usage examples, not new Figma specifications. No library behavior or public API was changed in Phase 5. Existing custom-template examples remain in their original demo sections.

## Consumer documentation

The new [Styling and migration guide](../styling.md), linked from the documentation sidebar, introduction, installation page and repository README, covers:

- Global theme/form imports and `.sq` scope, font inheritance/loading and optional icons.
- Runtime properties, nested inheritance, independent semantic colors/shadows, Sass configuration and the root custom-property mixin.
- Current presentation inputs, default sizes, preview CSS hooks and their typography limitations.
- Helper/error ownership, Signal Forms usage and the unchanged template contracts with a complete standalone custom-tag example.
- Visible migration effects: default button appearance, label placement/inset field borders, table density/mobile sorting limits and modal width/scroll changes.

Installation now lists the actual public Sass exports instead of suggesting unexported reset/base/utility/date-color entry points. It clarifies that legacy colors expose Sass variables rather than emitting CSS properties. Repository startup instructions build libraries before serving and account for the existing `npm start` cleanup of `dist/`.

The [datatable documentation](../datatable-module.md) now matches the code: sorting precedes pagination without mutating the caller's array; templates are inserted once after automatic rows and receive no per-row context; the deprecated row `width` input has no effect. The example uses a caller-owned loop and documents the mobile `data-heading` attribute.

The [preview reference checklist](preview-reference-checklist.md) covers all 17 inventoried components, with exact known Figma node links, example locations, detailed-versus-metadata evidence and pending visual checks. It distinguishes shared adaptations and unsupported features from direct references.

## Validation

- Production application build passed, including strict Angular compilation of every new component/directive example.
- ESLint over `src` and all `projects`, TypeScript no-emit and browser-runner syntax checks passed.
- Package export checks and all eight isolated-consumer Sass export checks passed. The new guide's Sass blocks were also compiled against isolated built packages, with no repository source imports.
- Real Chrome checks passed at **1440px and 390px**. New checks exercised helper/error recovery, dropdown option/selection/chevron contexts, tag remove callbacks, typeahead search/select/remove, checkbox/radio contexts, custom table rows/empty suppression, nested theme inheritance, default-theme isolation and inline progress colors.
- Existing geometry, pagination, desktop sort cycle, mobile cards, range hover/completion, time spinner and all three modal sizes/close actions were rechecked by the same browser run. Seven direct gallery source links were found. No uncaught runtime exceptions or horizontal document overflow were recorded.
- [44 screenshots](phase-5/screenshots/README.md) and a [success manifest](phase-5/screenshots/manifest.json) were saved separately from earlier phases. Representative desktop template/table and mobile validation/theme captures were visually inspected.
- Local documentation links, screenshot dimensions and whitespace checks passed.

The 191 library tests passed during Phase 4. They were not rerun for these documentation/demo-only changes; the production build, type checks and real-browser interactions validate the changed example surface. Full library tests remain part of the Phase 6 final checks.

To reproduce the browser checks after building the libraries and serving the application on port 4201:

```powershell
$env:STYLE_BASELINE_URL = 'http://127.0.0.1:4201'
$env:STYLE_PREVIEW_PHASE = '5'
node scripts/check-component-preview.mjs
```

Without `STYLE_PREVIEW_PHASE=5`, the runner retains its Phase 4 output mode. It uses installed Chrome and a separate temporary profile, resetting the page between viewport runs.

## Next phase

Phase 6 is final visual and functional validation: complete the unread source references, compare matching-size renders after font loading, inspect keyboard/focus and responsive behavior, and run the complete repository checks. The Figma MCP quota previously blocked those missing source references; Phase 5 does not claim that access has been restored or that final Figma fidelity has been established.
