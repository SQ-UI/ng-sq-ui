# Default color palette

The default theme uses the HEX values from the user's Figma color screenshots supplied on 2026-11-04. The screenshots provide 14 palette colors; they do not specify every component state's role or shadow effect.

| Family | Name | Token | HEX |
| --- | --- | --- | --- |
| Main | Black | `color-black` | `#202020` |
| Main | White | `color-white` | `#FFFFFF` |
| Brand | Brand | `color-brand` | `#00C474` |
| Brand | Brand Light | `color-brand-light` | `#E5F9F1` |
| Status | Critical | `color-critical` | `#FF3815` |
| Status | OK | `color-ok` | `#00D214` |
| Status | Warning | `color-warning` | `#FFB800` |
| Status | Unknown / Disabled | `color-unknown` | `#AAAAAA` |
| Gray | Gray 1 | `color-gray-1` | `#FAFAFA` |
| Gray | Gray 2 | `color-gray-2` | `#EBEBEB` |
| Gray | Gray 3 | `color-gray-3` | `#DCDCDC` |
| Gray | Gray 4 | `color-gray-4` | `#CDCDCD` |
| Gray | Gray 5 | `color-gray-5` | `#BEBEBE` |
| Gray | Gray 6 | `color-gray-6` | `#AFAFAF` |

HEX is authoritative where labels disagree: Gray 6 is `#AFAFAF` (RGB 175/175/175), despite the screenshot's RGB blue value of 176. The white main swatch is treated as White according to `#FFFFFF`, despite its repeated “SQ Black” caption. Brand Light uses the exact solid `#E5F9F1` swatch rather than a transparent paint over an arbitrary background.

## Use the tokens

```scss
@use '@sq-ui/ng-sq-common/styles/tokens' as sq;

.status-ok { color: sq.value('color-ok'); }
.status-warning { color: sq.value('color-warning'); }
.selected-surface { background: sq.value('color-brand-light'); }
```

`sq.value()` emits a runtime property with its default fallback, for example `var(--sq-color-ok, #00d214)`. `sq.fallback()` returns a concrete Sass color. The existing `sq.custom-properties` mixin can expose all defaults on a chosen theme root. The theme continues to avoid redeclaring defaults on every nested `.sq`, so inherited consumer overrides remain effective.

```scss
@use '@sq-ui/ng-sq-common/styles/tokens' as sq with (
  $overrides: ('color-gray-3': #c0c0c0)
);
@use '@sq-ui/ng-sq-common/sq-ui-theme';
@use '@sq-ui/ng-form-elements/styles/form-elements';

.application-theme { @include sq.custom-properties; }
```

Sass palette overrides are applied before default semantic mappings; explicit semantic overrides take precedence. Runtime CSS properties remain independent: set `--sq-color-border` to change component borders and `--sq-color-gray-3` to change the raw Gray 3 swatch. One runtime property does not recompute the other. See [Styling and migration](styling.md) for inherited overrides and configuring precompiled components.

## Component role mappings

Existing semantic token names are preserved. Their defaults now use this palette:

| Semantic role | Default |
| --- | --- |
| Text and labels | Black |
| Surface / subtle surface | White / Gray 1 |
| Border / disabled border | Gray 3 / Gray 4 |
| Placeholder and outside-month text | Gray 6 |
| `color-disabled` and disabled calendar text | Unknown / Disabled |
| `color-disabled-surface` | Gray 2 |
| Secondary, selection, tags, option highlights and range preview | Brand Light |
| Error border/text | Critical |
| Loader accent and selected/range-edge controls | Brand |

Disabled fills and foregrounds use separate roles: the Gray 2 surface prevents status-gray text from disappearing into the same fill. Existing buttons and fields use that separate surface token; checkbox/radio disabled indicators and labels use the status gray. The legacy `$disabled-color` alias now refers to status gray; consumers using it for fills can use `sq.value('color-disabled-surface')` instead.

Overlay and shadow hue now uses Black. Their previous geometry and opacity are retained because these screenshots do not supply effect specifications. This removes the old translucent teal defaults without claiming new Figma shadow values. No new status-button inputs or checkbox/radio geometry are inferred from the palette.

The full palette is visible at `/#/preview` under **Colors**, rendered through the shared Sass tokens. Library consumers receive the defaults through the existing theme/Sass entry points; no new package or font dependency is needed.

## Verification

All seven production library builds and the demo production build passed, along with package exports, eight isolated Sass exports, ESLint and TypeScript no-emit. A direct Sass check confirmed the 14 HEX values, palette-to-semantic defaults and explicit override precedence. The published form stylesheet matches its source.

Production Chrome checks at 1440px and 390px confirmed all 14 rendered swatches, Gray 2 disabled fills, status-gray disabled text/checkbox labels, Brand Light tags and active dropdown options, and runtime palette overrides. No horizontal showcase overflow or uncaught runtime exceptions were recorded. Existing interaction logic and control geometry were not changed.

| Example | Desktop | Mobile |
| --- | --- | --- |
| Palette | [1440px](theme-colors/screenshots/palette-1440.png) | [390px](theme-colors/screenshots/palette-390.png) |
| Disabled fields | [1440px](theme-colors/screenshots/disabled-controls-1440.png) | [390px](theme-colors/screenshots/disabled-controls-390.png) |
| Dropdown selection | [1440px](theme-colors/screenshots/dropdown-selection-1440.png) | [390px](theme-colors/screenshots/dropdown-selection-390.png) |

The [browser manifest](theme-colors/screenshots/manifest.json) records the exact rendered colors and assertions.
