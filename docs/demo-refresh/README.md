# Demo showcase refresh

## Component explorer · 2026-11-25

The demo now has a searchable catalog at `/#/components`, covering 20 UI components and the tooltip directive in five categories. Each entry links to a focused page with selectable live configurations, a reset action, current model values, setup/template code, a copy action and the inputs used by the example. Counts are derived from the shared demo registry.

Search matches names, selectors, packages and configuration descriptions. Search and category filters live in the URL and survive opening an example and returning to the catalog. Configuration links such as `/#/components/dropdown?variant=disabled-option` support refresh and direct sharing. The complete playground and existing documentation/embed routes remain available; comparison links scroll the playground to the relevant section.

The overview and sidebar now lead to the catalog. Library source code and public APIs are unchanged. Examples use local data, including typeahead suggestions.

To check a built demo, start `node scripts/serve-built-preview.mjs`, set `STYLE_BASELINE_BROWSER` to a Chromium executable and run `node scripts/check-catalog-preview.mjs`. Captures and the check manifest are written to the ignored `tmp/catalog-preview` directory. `CATALOG_PREVIEW_OUTPUT` overrides the destination; `STYLE_BASELINE_URL` overrides the server address. Environments without a configured browser sandbox can explicitly set `STYLE_BASELINE_NO_SANDBOX=1`.

The runner exercises every configuration on desktop, every component at 320px, layouts at 1440/960/390/320px, search and return navigation, edited values and reset, dialogs, playground anchors, horizontal overflow and browser errors. Unit tests cover URL state, fallback routes, reset behavior, live mounting of every preset and generated Angular template syntax.

Validated: production library/demo builds, TypeScript and ESLint checks, all 48 test files / 387 tests, and strict Angular template/type compilation of all 98 generated standalone examples. Browser checks passed with no runtime errors or page overflow. Desktop and mobile catalog/example captures were visually inspected.

## Previous showcase refresh

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
