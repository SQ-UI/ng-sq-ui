# Styling and migration

This guide describes the current repository style migration for Angular 22 / ng-sq-ui 3.x. New presentation inputs are repository changes until a package release includes them. The [reference checklist](style-migration/preview-reference-checklist.md) records which styles are verified from Figma and which remain adaptations or pending comparisons.

## Load styles once

Load the shared theme and form rules from the application's **global** Sass entry point, rather than a component stylesheet:

```scss
@use '@sq-ui/ng-sq-common/sq-ui-theme';
@use '@sq-ui/ng-form-elements/styles/form-elements';

body { margin: 0; } // Optional application-level layout choice.
```

Alternatively, include their `.scss` paths in `angular.json` as shown in [Installation](installation.md). Use one approach to avoid duplicate CSS. Import the optional Font Awesome styles if using the built-in icon controls; that setup is also listed in Installation.

```html
<main class="sq application-theme">
  <sq-input controlLabel="Name"></sq-input>
  <sq-button>Continue</sq-button>
</main>
```

Keep `.sq` on a parent. Shared reset and form rules are scoped to that theme; the library no longer resets the application's `html` or `body`. Each standalone component/directive used in a template must also be in that Angular component's `imports` array. Sass imports do not register Angular components.

## Fonts

Components inherit the consumer's font by default. For the reference typography, load **IBM Plex Sans 400/500/700** through your application's font pipeline and opt in at your application root:

```scss
.application-theme {
  --sq-font-family: 'IBM Plex Sans', Arial, sans-serif;
}
```

The demo loads those weights through a Google Fonts stylesheet with `display=swap` in `src/index.html`. Consumers may self-host the font or use their existing font; the library does not fetch or bundle it. Set the family after arranging font loading, and wait for fonts before making visual comparisons. IBM Plex Mono has a family token but is not imposed on an unverified component. Other Figma heading fonts remain unverified.

## Override compiled components at runtime

CSS custom properties inherit through nested `.sq` containers. Put them on a wrapper to customize only a part of your application:

```scss
.account-theme {
  --sq-color-brand: #3759c7;
  --sq-color-border: #8b9bd9;
  --sq-color-text: #202020;
  --sq-radius-control: 4px;
  --sq-color-focus: #202020;
}
```

```html
<section class="sq account-theme">
  <section class="sq"><sq-button>Inherited brand</sq-button></section>
</section>
<section class="sq"><sq-button>Default brand</sq-button></section>
```

All shared token keys map to `--sq-<key>`; see the [token map](../projects/ng-sq-common/src/lib/styles/_token-values.scss). Colors, selections and shadows are independent values. Changing the brand does not recompute the modal shadow or calendar range colors. Set those tokens separately if required. `backgroundColor` and `fillColor` on progress bars remain inline overrides with precedence over theme defaults.

## Configure Sass values

Configure the tokens before other theme imports. For already compiled library CSS, emit the configured properties on an application root:

```scss
@use '@sq-ui/ng-sq-common/styles/tokens' as sq with (
  $overrides: ('color-brand': #3759c7, 'radius-control': 4px)
);
@use '@sq-ui/ng-sq-common/sq-ui-theme';
@use '@sq-ui/ng-form-elements/styles/form-elements';

.application-theme { @include sq.custom-properties; }
.custom-surface {
  border: sq.value('border-width') solid sq.value('color-border');
  border-radius: sq.value('radius-control');
}
```

`sq.value()` emits a runtime variable with a Sass fallback; `sq.fallback()` returns the concrete Sass value. Unknown keys fail compilation. `$overrides` changes the current Sass compilation, not CSS embedded in prebuilt library JavaScript, so use the emitted properties or runtime declarations for those components. The optional mixin emits every default: apply it only at a deliberate theme root, because it creates a new inheritance boundary for all tokens.

The public legacy `styles/colors` entry still exposes Sass variables, including `$progress-backogrund-color` and its corrected alias `$progress-background-color`. It emits no CSS-variable declarations. Changing a legacy alias alone does not restyle precompiled components. The [Phase 2 report](style-migration/phase-2-foundations.md) explains package portability and Sass configuration in more detail.

## Presentation options and dimensions

| Component | Current option | Default / dimensions |
| --- | --- | --- |
| Button | `appearance="primary"` or `"neutral"` | Primary, M height 32px; native `type` remains separate |
| Input/textarea/dropdown/tags/typeahead | Optional `helpText` and `errorText` | Empty strings; shared small field frame 28px for a single text line |
| Datatable | `size="small\|medium\|large"`, optional `emptyText` | Medium; desktop row/header minimum heights 36/40/44px; empty message opt-in |
| Modal | `size="small\|medium\|large"` | Medium; widths 360/400/440px, viewport-clamped |
| Progress | Existing `size="small\|medium\|large"`, accessible `label` | Medium; heights 4/8/12px; label defaults to `Progress` |

Each `size` value is one string, for example `size="small"`; the table lists alternatives. Table and modal use the exported `Size` union. Wrapped table content, multiline fields and selected chips may grow vertically. Mobile table cards have content-driven height.

Buttons and fields have **no new public `size` input**. The preview demonstrates metadata-derived heights through scoped CSS hooks, while retaining verified M-button and small-field typography:

```scss
.button-s  { --sq-button-padding-block: 0px; }  // 24px height
.button-m  { --sq-button-padding-block: 4px; }  // 32px (default)
.button-l  { --sq-button-padding-block: 8px; }  // 40px
.button-xl { --sq-button-padding-block: 12px; } // 48px
.field-s { --sq-field-line-height: 20px; } // 28px single-line frame
.field-m { --sq-field-line-height: 24px; } // 32px
.field-l { --sq-field-line-height: 32px; } // 40px
```

```html
<div class="button-l"><sq-button>Large geometry</sq-button></div>
<div class="field-m"><sq-input controlLabel="Name"></sq-input></div>
```

These larger-size examples establish geometry only. Their final typography and variant states await detailed Figma references. The neutral button is the verified Tech M building block; it is not a claim that Figma's final secondary appearance has been inspected.

## Helpers and errors

```html
<sq-input controlLabel="Name" [(value)]="name"
          helpText="Choose a name for your profile"
          [errorText]="nameError()"></sq-input>
```

The caller owns `name` and `nameError` signals. Nonempty `errorText` replaces the helper, adds `aria-invalid="true"` and a linked alert message. Clearing it restores the helper; clearing both removes the description link. Errors do not automatically derive from Signal Forms or native validation, and no success appearance is inferred. With Signal Forms, bind `[formField]` instead of a second independent `[(value)]` binding; keep message derivation in the caller. The Preview's **Caller-controlled messages** example lets you show and clear an error interactively.

## Custom templates

Import template directives in the standalone consumer alongside the component. Context names are unchanged:

| Directive | Import | Context |
| --- | --- | --- |
| `sq-dropdown-selected-option` | `SqDropdownSelectedOptionTemplateDirective` | `value` |
| `sq-dropdown-option` | `SqDropdownOptionTemplateDirective` | `option` |
| `sq-dropdown-chevron` | `SqDropdownChevronTemplateDirective` | `isDropdownOpen` |
| `sq-tag` | `SqTagTemplateDirective` | `tag`, `remove(tag)` |
| `sq-typeahead-option` | `SqTypeaheadOptionTemplateDirective` | `option` |
| `sq-typeahead-selected-option` | `SqTypeaheadSelectedOptionTemplateDirective` | `item`, `remove(item)` |
| `sq-checkbox-label` | `SqCheckboxLabelTemplateDirective` | `isSelected` |
| `sq-radio-label` | `SqRadiobuttonLabelTemplateDirective` | `value`, `isSelected` |

All imports above are exported from `@sq-ui/ng-form-elements` and the umbrella `@sq-ui/ng-sq-ui` package. A minimal custom-tag consumer is:

```typescript
import { Component, signal } from '@angular/core';
import { TagsInputComponent, SqTagTemplateDirective } from '@sq-ui/ng-form-elements';

@Component({
  selector: 'app-topics',
  standalone: true,
  imports: [TagsInputComponent, SqTagTemplateDirective],
  template: `
    <section class="sq">
      <sq-tags-input controlLabel="Topics" [(value)]="topics">
        <ng-template sq-tag let-tag="tag" let-remove="remove">
          <span>{{tag}}</span>
          <button type="button" [attr.aria-label]="'Remove ' + tag" (click)="remove(tag)">×</button>
        </ng-template>
      </sq-tags-input>
    </section>
  `,
})
export class TopicsComponent {
  readonly topics = signal(['Angular', 'Design']);
}
```

Custom markup owns its labels and buttons: give remove actions accessible names, use `type="button"`, and preserve disabled behavior if the consumer exposes a disabled variant. Custom checkbox/radio templates can associate a native label using `for` and the supplied `controlId`. The gallery includes these contexts with working selection/remove callbacks. Its custom decorations are consumer examples, not additional Figma designs.

Default checkbox/radio labels are now native labels linked to their inputs. If a custom template omits the standard square/circle, keyboard focus falls back to an outline around the checkable wrapper. Dialogs link their accessible name to the projected title container; supply meaningful `[sq-modal-title]` content. These accessibility changes do not add automatic focus trapping/restoration.

Table templates are inserted once, without per-row context, after automatic header/body rows. A fully custom body should iterate its caller-owned data and leave `items` empty to avoid duplicate automatic rows. The caller then owns sorting/pagination; `data-heading` on custom cells supplies mobile labels. See the corrected [datatable example](datatable-module.md). Modal content still uses `[sq-modal-title]`, `[sq-modal-body]` and `[sq-modal-footer]` projection.

## Migration review

- Load the global theme/forms once, keep `.sq` on a parent, and own page-level margins/fonts in the consuming application.
- Buttons now default to primary M, with natural-case projected text and 32px height. Review overrides tied to the older large uppercase buttons or `.inner` padding.
- Field labels now sit above `.input-field`. Replace `.input-field .label` selectors with `.sq-form-field > .sq-field-label`. The frame uses an inset 1px stroke; target `--sq-color-border` rather than the old partial border.
- Review table density and wrapping. The existing mobile cards hide the header and its sorting controls; this phase does not add a mobile sort UI.
- Review modal width overrides: the default is now 400px rather than a fraction of viewport width. Long bodies scroll within 16px viewport margins; title/footer remain visible. Existing focus trapping/restoration and background scrolling limits remain.
- Keep native input behavior, Signal Forms bindings and projected template contracts. Helper/error text is optional; table empty messages are opt-in and do not override custom bodies.
- Override semantic tokens deliberately. Some disabled, placeholder, range, menu and shadow values remain transitional pending detailed Figma access; do not treat them as final design-system values.

## Review the examples

Build libraries with `npm run build:libs`, then run `npx ng serve` and open **Preview** (`/#/preview`). Avoid `npm start` after that build: its existing `prestart` cleanup removes `dist/`. The gallery is also embedded at the end of `/#/sq-ui`, where the earlier custom-template examples remain available.

The [reference checklist](style-migration/preview-reference-checklist.md) maps each example family and table subcomponent to exact known Figma nodes, with evidence levels and gaps. The [Phase 5 report](style-migration/phase-5-examples-and-docs.md) records the examples and validation. Final screenshot-to-Figma comparison belongs to Phase 6 after the remaining source references become available.

The [Phase 6 report](style-migration/phase-6-validation.md) records the final production checks, 320px layout and keyboard coverage, accessibility corrections and remaining source/interaction limits. To inspect a built production app without installing a server, run `node scripts/serve-built-preview.mjs` after building libraries and the app; it serves only on localhost at port 4201 (override with `STYLE_PREVIEW_PORT`).
