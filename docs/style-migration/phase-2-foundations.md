# Phase 2: shared style foundations

Implemented on 2026-11-03. Figma was not edited. Phase 1's missing Figma specifications remain pending; this phase implements the shared infrastructure and confirmed values, with explicitly transitional defaults for the remaining palette and shadows.

## What changed

- [tokens.scss](../../projects/ng-sq-common/src/lib/styles/tokens.scss) exposes shared Sass functions, configuration, and an optional CSS-property mixin. [_token-values.scss](../../projects/ng-sq-common/src/lib/styles/_token-values.scss) holds the single token map.
- Confirmed tokens cover brand `#00C474`, text `#202020`, white, subtle surface `#FAFAFA`, border `#DCDCDC`, critical `#FF3815`, 4px control corners, 1px borders, the observed 4/8/16px spacing values, and the inspected field/button/assistive typography.
- Existing disabled, placeholder, secondary, selection, calendar/range colors, and shadows are centralized with comments identifying them as transitional source values. They are not presented as verified Figma values. Component size/layout/state redesigns remain in Phases 3 and 4.
- [typography.scss](../../projects/ng-sq-common/src/lib/styles/typography.scss) supplies body, small field, assistive, and medium button mixins. Font inheritance is the library default. The demo explicitly loads IBM Plex Sans 400/500/700 and removes its Open Sans/Nunito overrides. Mono is available as a family token; no unverified component-specific Mono or H1 font is imposed.
- Form, dropdown, tags, typeahead, checkbox/radio, modal, progress, table, paginator, calendar, and time-picker colors now read shared tokens. Existing component logic, APIs, templates and responsive breakpoints remain, apart from adding `.sq` to the demo shell.
- The optional reset and shared form stylesheet are scoped to `.sq`. The reset uses zero specificity so Font Awesome and consumer classes retain their font settings. Native checkbox/radio hit-target rules are scoped to their own component hosts and continue working without the optional global theme.
- Shared keyboard focus uses a configurable 2px outline. Its dark default is an accessibility implementation choice, not a claimed Figma focus specification. Existing blanket outline suppression was removed.

## Runtime customization

Load the theme and form styles once in the application's global Sass entry point:

```scss
@use '@sq-ui/ng-sq-common/sq-ui-theme';
@use '@sq-ui/ng-form-elements/styles/form-elements';
```

Keep the existing `class="sq"` convention on a component's parent. Set CSS custom properties on a containing element to customize compiled library components:

```scss
.my-application {
  --sq-color-brand: #3759c7;
  --sq-color-text: #202020;
  --sq-font-family: 'IBM Plex Sans', Arial, sans-serif;
  --sq-shadow-field: 0 0 0 2px rgb(55 89 199 / 20%);
}
```

```html
<main class="my-application sq">
  <sq-input controlLabel="Name"></sq-input>
  <section class="sq">
    <sq-button>Continue</sq-button>
  </section>
</main>
```

Overrides inherit through nested `.sq` containers. The default theme does not redeclare every custom property on each wrapper; each component supplies its default as a `var()` fallback. This also keeps component defaults usable without requiring a CSS-variable declaration sheet. Existing inline progress color overrides still take precedence.

All keys in `_token-values.scss` have the CSS spelling `--sq-<key>`. Colors and shadows are independent semantic tokens: changing the brand does not invent a secondary palette or recompute the modal shadow. Set those properties explicitly when customizing them.

The library does not download or bundle fonts. Load the desired font through the consuming application's preferred font setup. The demo uses a Google Fonts stylesheet with `display=swap`; its Arial/sans-serif fallback remains usable if that resource is unavailable. Consumers can omit the font override and retain their existing font.

## Sass configuration and compatibility

Configure tokens before loading the theme. Materialize configured values at one application root when they must also customize precompiled component CSS:

```scss
@use '@sq-ui/ng-sq-common/styles/tokens' as sq with (
  $overrides: ('color-brand': #3759c7)
);
@use '@sq-ui/ng-sq-common/sq-ui-theme';
@use '@sq-ui/ng-form-elements/styles/form-elements';

.my-application {
  @include sq.custom-properties;
}

.custom-field {
  border: sq.value('border-width') solid sq.value('color-border');
  border-radius: sq.value('radius-control');
}
```

`sq.value()` returns a runtime variable plus the configured fallback. `sq.fallback()` returns the Sass value itself for compile-time calculations. Unknown keys fail Sass compilation. `$overrides` changes Sass compiled in that compilation; it cannot rewrite CSS already compiled into a library bundle. Use runtime properties or the root mixin for those components.

The old `styles/colors.scss` entry point and its variable names remain available as Sass colors, including the historical `$progress-backogrund-color`; `$progress-background-color` is also provided. Existing `$primary-theme-color` configuration still feeds its `$base-form-element-color` and progress aliases. Runtime component customization now uses the shared CSS properties; changing a legacy Sass alias alone does not rewrite precompiled component styles.

The reset no longer styles the consumer's `html`, `body`, or elements outside `.sq`. Applications which relied on the old global reset should own their page-level margin/font defaults. The demo sets `body { margin: 0; }` in its application stylesheet and wraps its shell in `.sq`.

## Package portability

The common package copies all shared Sass modules. The form package publishes a small [package-layout bridge](../../projects/ng-form-elements/package-styles/tokens.scss) that forwards to its installed common peer package; source development uses a separate source-layout bridge. Neither the published form stylesheet nor its bridge references `projects/` or `src/lib/`.

Both packages declare Sass export conditions. The explicit public entries are common theme (with/without `.scss`), tokens, legacy colors (with/without `.scss`), typography, and form elements (with/without `.scss`). A Dart Sass caller using `NodePackageImporter` can prefix those paths with `pkg:`. Angular's normal package stylesheet imports continue using the paths above.

The public tokens file forwards relatively to one internal values module. This avoids duplicated Sass configuration on Windows when `pkg:` resolution lowercases a canonical URL while relative file resolution preserves its original case. The isolated-consumer check verifies configuration reaches the form stylesheet and legacy aliases.

## Verification and remaining work

- All seven production library builds passed.
- Production application build passed.
- 36 Vitest files / 179 tests passed. The run took about 187 seconds in this environment; the existing under-one-minute target was not met. No test behavior was changed to shorten it.
- ESLint over `src` and all `projects`, plus the TypeScript no-emit check, passed.
- `node scripts/check-package-exports.mjs` passed.
- `node scripts/check-style-packages.mjs` (also `npm run check:styles`) verifies all eight Sass exports in an isolated consumer: no repository source imports, shared configuration, legacy aliases, scoped reset/forms, and invalid-token errors. It uses the Sass dependency already shipped with ng-packagr and installs nothing.
- Browser checks at 1440px and 390px confirmed inherited brand/text overrides, isolation of outside `.input-field`/`.disabled`/`.checkable` elements, default paragraph margins outside the theme, 2px focus-visible, and the Font Awesome font. IBM Plex Sans faces 400/500/700 were loaded. The capture recorded zero uncaught runtime exceptions.
- [38 Phase 2 screenshots](phase-2/screenshots/manifest.json) and measured styles were captured separately from the unchanged Phase 1 baseline. Representative desktop/mobile form, menu, calendar, and modal images were inspected. These establish the shared-foundation changes, not final Figma component fidelity.

To reproduce the browser checks, run the existing demo server, then set `STYLE_BASELINE_URL`, `STYLE_BASELINE_OUTPUT=docs/style-migration/phase-2/screenshots`, and `STYLE_VERIFY_FOUNDATIONS=1` before running `node scripts/capture-style-baseline.mjs`. The capture enables focus emulation, lets existing color transitions settle for assertions, and pauses animations for screenshots. Capture fixtures and nondeterministic date/progress behavior are unchanged from Phase 1.

The complete Figma palette, remaining text styles, shadows, and state-specific designs are still blocked by the previously reported Starter quota. Replacing transitional tokens and applying the component-specific geometry/variants requires those detailed references in Phases 3 and 4. No final Figma-match claim is made for this foundation stage.
