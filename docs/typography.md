# Typography

The typography screenshot supplied on 2026-11-04 defines six style families. The latest reference supersedes the earlier IBM Plex font choices; compact control dimensions are retained where this image does not show their text styles.

| Role | Family | Weight |
| --- | --- | --- |
| H1 | Institut (captioned “Insitut” in the image) | Regular, using the face's native 400 weight |
| H2 | Space Grotesk | Bold 700 |
| H3 | Space Mono | Bold 700 |
| Text 1 | Space Grotesk | Regular 400 |
| Text 2 | Space Mono | Regular 400 |
| Button text | Space Grotesk | Semibold 600 |

## Heading scales

Each entry is font size / line height in pixels. These are the annotated values rather than the dimensions of the reduced screenshot.

| Size | H1 | H2 / H3 |
| --- | --- | --- |
| XXL | 80 / 96 | 48 / 64 |
| XL | 64 / 80 | 40 / 56 |
| L | 48 / 64 | 32 / 48 |
| M | 40 / 56 | 24 / 40 |
| S | 32 / 48 | 20 / 32 |
| XS | 24 / 40 | 16 / 28 |
| XXS | 20 / 32 | 12 / 20 |

The shared `.sq` theme applies M to semantic `h1`, `h2` and `h3` by default. Explicit size classes or mixins select the other variants. H4 retains its compact legacy metrics because no H4 reference is visible.

## Visible text and button scales

Text 1, Text 2 and button text share the three visible pairs:

| Size | Font size / line height |
| --- | --- |
| XXL | 32 / 48 |
| XL | 24 / 40 |
| L | 20 / 32 |

The image is cropped below L. Smaller variants are not invented. Existing compact field text remains 12/20, assistive text 10/16 and M-button text 14/24. Buttons use the requested Grotesk semibold 600 weight. The text role utilities do not change control geometry; the subsequent button screenshot is implemented through the component's `size="xl"` input (24/40 text, 56px total height). See [button presentation options](styling.md#presentation-options-and-dimensions).

## Consumer usage

Load the global theme once, as described in [Styling and migration](styling.md). Its classes are scoped under `.sq`:

```html
<section class="sq">
  <h1 class="sq-h1-l">A display heading</h1>
  <h2 class="sq-h2-m">A section heading</h2>
  <h3 class="sq-h3-s">A monospace heading</h3>
  <p class="sq-text1-l">Regular proportional text.</p>
  <p class="sq-text2-xl">Regular monospace text.</p>
  <span class="sq-button-text-l">Button text style</span>
</section>
```

The public Sass entry supplies the same roles:

```scss
@use '@sq-ui/ng-sq-common/styles/typography' as type;

.page-title { @include type.heading(1, 'l'); }
.section-title { @include type.heading(2, 'm'); }
.technical-title { @include type.heading(3, 's'); }
.body-copy { @include type.text(1, 'l'); }
.technical-copy { @include type.text(2, 'xl'); }
.action-label { @include type.button-text('l'); }
```

`type.scale-classes` can emit the classes under a consumer selector instead of the global theme. Existing `body`, `field-small`, `assistive` and `button-medium` mixins remain available. Invalid heading/text roles and unsupported sizes fail Sass compilation.

Font family tokens are `font-family-display`, `font-family-sans` and `font-family-mono`; base font inheritance still uses `font-family`. Size tokens follow `font-size-heading-2-m` / `line-height-heading-2-m`, `font-size-text-1-l` / `line-height-text-1-l` and `font-size-button-l` / `line-height-button-l`. CSS overrides add the `--sq-` prefix. Configured Sass values, explicit size overrides and the optional root custom-property mixin continue to work.

## Fonts and H1 availability

The demo includes unmodified [Space Grotesk](https://github.com/google/fonts/tree/main/ofl/spacegrotesk) and [Space Mono](https://github.com/google/fonts/tree/main/ofl/spacemono) files from the official Google Fonts repository. Their SIL Open Font License files are stored alongside them in [src/assets/fonts](../src/assets/fonts/README.md). Local hosting replaces the previous external Google Fonts stylesheet; the demo no longer needs that service to render these families.

The H1 candidate is [Brownfox Institut Regular](https://brownfox.org/fonts/institut). Its font metadata names the family `Institut` and face `Regular`. At the user's request, the advertised official trial was downloaded to `tmp/fonts/institut-trial.otf`. The foundry restricts trials to evaluation, as described in its [FAQ](https://brownfox-type.ru/faq); the trial is not included in public demo assets or library packages.

H1 dimensions and family selection are implemented, with a declared Space Grotesk fallback. Exact public H1 rendering requires a licensed Institut webfont loaded under `font-family: 'Institut'`. A separate private browser evaluation can use the downloaded trial without adding it to production assets. No font purchase or third-party email is performed.

## Preview

Open `/#/preview` and find **Typography**. It renders all 30 visible style variants through the shared theme classes, with their size/line-height labels. The H1 panel states the font-file requirement. Long samples can scroll within their own area on narrow screens without scaling down the reference metrics.

Demo headings on the overview, package pages and component sections use the shared roles with responsive sizes from the supplied scale. Compact navigation labels, metadata and controls keep their existing dimensions where no new reference is visible.

## Validation

- All seven production library builds, the production demo build and package exports passed. The final demo build stays within the existing stylesheet budgets.
- All eight isolated Sass exports passed, including public heading/text/button mixins. Direct Sass checks confirmed 30 styles, size overrides and rejection of unsupported cropped sizes.
- ESLint and TypeScript no-emit passed. The full suite passed **37 files / 195 tests**. An earlier unusually delayed run timed out in the existing dropdown test; its isolated 10-test file and the subsequent full run passed without changing timeouts or component logic.
- Production Chrome checks at 1440px and 390px verified every sample's size, line height, family and weight. Chrome's platform-font data confirmed that locally hosted Grotesk and Mono faces render the headings and that public H1 uses its declared fallback. Compact button and field heights remain 32px and 28px, with no horizontal showcase overflow or uncaught runtime exceptions.
- The official Institut trial was rendered separately in a private local evaluation. Neither its file nor that evaluation screenshot is included in public assets.

| Preview | Desktop | Mobile |
| --- | --- | --- |
| H1 family and fallback | [1440px](typography/screenshots/sq-h1-1440.png) | [390px](typography/screenshots/sq-h1-390.png) |
| H2 Grotesk Bold | [1440px](typography/screenshots/sq-h2-1440.png) | [390px](typography/screenshots/sq-h2-390.png) |
| H3 Mono Bold | [1440px](typography/screenshots/sq-h3-1440.png) | [390px](typography/screenshots/sq-h3-390.png) |
| Text 1 | [1440px](typography/screenshots/sq-text1-1440.png) | [390px](typography/screenshots/sq-text1-390.png) |
| Text 2 | [1440px](typography/screenshots/sq-text2-1440.png) | [390px](typography/screenshots/sq-text2-390.png) |
| Button text | [1440px](typography/screenshots/sq-button-text-1440.png) | [390px](typography/screenshots/sq-button-text-390.png) |
| Compact controls | [1440px](typography/screenshots/controls-1440.png) | [390px](typography/screenshots/controls-390.png) |
| Overview | [1440px](typography/screenshots/home-1440.png) | [390px](typography/screenshots/home-390.png) |

The [browser manifest](typography/screenshots/manifest.json) records all 30 style measurements at each viewport. Public captures are implementation evidence; they do not claim the missing licensed H1 face is present.
