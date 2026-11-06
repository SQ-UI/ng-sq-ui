# Demo showcase refresh

Updated 2026-11-03. This change modernizes the Angular demo application. Published library sources under `projects/` are unchanged, and the Figma file remains read-only.

## Design

- White application header, charcoal navigation and a neutral canvas with green accents.
- Responsive sidebar with active-route markers, mobile toggle, named controls, Escape closing and focus return to the opener.
- A new overview with working input/save/reset examples, package entry cards and visible palette swatches.
- A component playground with a clearer introduction, numbered sections and consistent example surfaces.
- Updated package overviews, collapsible sections and demo custom templates, replacing the old teal, blue and pink decorations.
- Native GitHub/design links in place of third-party GitHub badge widgets; viewport zoom is enabled.

Colors come from the previously verified Figma tokens: brand `#00C474`, ink `#202020`, white, subtle surface `#FAFAFA` and border `#DCDCDC`. Demo-only tints are derived with `color-mix`; they are layout treatments rather than additional claimed Figma palette values. The existing IBM Plex Sans setup is retained. Component sizes, variants and library behavior continue to be shown by the actual library components.

The original showcase layout is an application design using that palette; no new full-screen Figma reference was assumed. Figma's standard and programmatic read tools still returned the Starter MCP quota limit during this task.

## Logo

The requested first logo variant was supplied by the user as [src/assets/logo.svg](../../src/assets/logo.svg). The file is used directly in the shared header and copied into the production assets without changes. Its root dimensions and viewBox are `896 × 576`, with brand fill `#00C474`.

The header renders it at `56 × 36px` on desktop and `42 × 27px` on small screens, preserving the source aspect ratio. Browser assertions confirm the SVG loads and retains those proportions. Source and built-file SHA-256 hashes match. The brand link supplies the accessible name; the adjacent image is decorative within that named link.

## Validation

- Production build passed after the final logo/header correction.
- All 37 test files / **195 tests** passed, including a navigation expansion/Escape/focus-return regression test.
- ESLint over `src`, TypeScript no-emit, runner syntax and whitespace checks passed.
- Production Chrome checks cover overview and navigation at **1440, 960, 390 and 320px**; every component/package route is checked at 1440/390px. The main scroller and header are checked for horizontal overflow.
- Existing size, table/pagination, range/time, modal, custom-template, validation-message and theme inheritance checks pass at 1440/390px.
- Overview save/reset interactions and mobile menu open/Escape/link navigation are exercised. Active-route markers and the provided logo's load/proportions are asserted.
- No library files were modified. No uncaught browser runtime exceptions were recorded. Layout and logo screenshots were visually inspected.

The [screenshot manifest](screenshots/manifest.json) contains measurements, interaction results and all capture file names. Captures are separate from the historical migration phases. Remote-data examples use deterministic browser fixtures, so checks do not depend on external demo APIs.

## Review captures

| Page | Desktop | Mobile |
| --- | --- | --- |
| Overview | [1440px](screenshots/demo-home-1440.png) | [390px](screenshots/demo-home-390.png) / [320px](screenshots/demo-home-320.png) |
| Component playground | [1440px](screenshots/demo-preview-1440.png) | [390px](screenshots/demo-preview-390.png) / [320px](screenshots/demo-preview-320.png) |
| Navigation | Visible in desktop captures | [390px](screenshots/demo-navigation-390.png) / [320px](screenshots/demo-navigation-320.png) |
| Form controls | [1440px](screenshots/demo-sq-ui-1440.png) | [390px](screenshots/demo-sq-ui-390.png) |
| Utilities | [1440px](screenshots/demo-sq-common-1440.png) | [390px](screenshots/demo-sq-common-390.png) |
| Tables | [1440px](screenshots/demo-datatable-1440.png) | [390px](screenshots/demo-datatable-390.png) |
| Date/time | [1440px](screenshots/demo-datetime-picker-1440.png) | [390px](screenshots/demo-datetime-picker-390.png) |
| Dialogs | [1440px](screenshots/demo-modal-1440.png) | [390px](screenshots/demo-modal-390.png) |

## Reproduce

Build the libraries and demo, then run `node scripts/serve-built-preview.mjs`. Open `http://127.0.0.1:4201/#/about` or `/#/preview`.

```powershell
$env:STYLE_BASELINE_URL = 'http://127.0.0.1:4201'
$env:STYLE_PREVIEW_PHASE = '5'
$env:STYLE_PREVIEW_OUTPUT = 'docs/demo-refresh/screenshots'
$env:STYLE_SHOWCASE_REFRESH = '1'
node scripts/check-component-preview.mjs
```

The output override keeps the earlier phase evidence intact. Omit the two new variables to retain the runner's previous behavior.
