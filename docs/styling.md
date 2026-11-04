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

The current typography reference uses **Space Grotesk** for H2/Text 1/buttons and **Space Mono** for H3/Text 2. Load their regular/bold faces and Grotesk's semibold face through your font pipeline. Base control text still inherits the consumer font; the heading/text role mixins and button style select their reference families. Set the application's base family explicitly:

```scss
.application-theme {
  --sq-font-family: 'Space Grotesk', Arial, sans-serif;
}
```

The demo self-hosts Space Grotesk 300–700 and Space Mono 400/700 under `src/assets/fonts`, with their license files and `font-display: swap`. Reusable packages do not download or bundle these demo fonts. H1 selects Institut Regular with a Space Grotesk fallback; a licensed Institut webfont is required for its exact face. The downloaded evaluation file remains under ignored `tmp/fonts/`. See [Typography](typography.md) for every visible scale, role mixins/classes, font sources and the H1 limitation. This newer screenshot supersedes the earlier IBM Plex family choices.

## Override compiled components at runtime

The complete [default color palette](theme-colors.md) follows the supplied Figma color screenshots: main/brand colors, four status colors and six grays. The component playground's **Colors** section shows every swatch. Selected/secondary fills now use Brand Light, while disabled foregrounds use the status gray and disabled surfaces use Gray 2.

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
| Button | `appearance="primary\|secondary\|neutral"`, `tone="brand\|ok\|warning\|critical"`, `size="s\|m\|l\|xl"` | Primary brand M; heights 24/32/40/56px; native `type` remains separate |
| Input/textarea | Optional `helpText` and `errorText` | Empty strings; shared small field frame 28px for a single text line |
| Typeahead | `multiple`, `size="s\|m\|l"`, optional `helpText` and `errorText` | Single search retains 28px; multiselect S/M/L minimum heights 32/40/48px |
| Tags input | `size="s\|m\|l"`, optional `helpText` and `errorText` | S; minimum heights 32/40/48px, green pill chips 24/32/40px |
| Dropdown | `size="s\|m\|l"`, optional `helpText` and `errorText` | S; trigger heights 32/40/48px and text sizes 14/16/24px |
| Datatable | `size="small\|medium\|large"`, optional `emptyText` | Medium; desktop row/header minimum heights 36/40/44px; empty message opt-in |
| Modal | `size="small\|medium\|large"` | Medium; widths 360/400/440px, viewport-clamped |
| Progress | `size="small\|medium\|large"`, `variant="linear\|segmented\|steps"`, accessible `label` | Medium; tracks 4/8/12px; gray background with brand fill |

Each `size` value is one string, for example `size="small"`; the table lists alternatives. Table and modal use the exported `Size` union. Wrapped table content, multiline fields and selected chips may grow vertically. Mobile table cards have content-driven height.

Buttons support a public `size` input. S/M/L retain the compact 14/24 typography; XL uses the supplied Space Grotesk semibold 24/40 style with 8px vertical padding. All appearances keep the same dimensions. Primary is filled with white text; secondary is white with a 1px inset outline and text in the selected tone. Enabled buttons turn black on hover (secondary keeps its white surface). Disabled primary uses `color-disabled` with white text; disabled secondary uses the same gray for its outline/text on `color-surface-subtle`. Legacy `neutral` retains its subtle fill while adopting the shared hover and disabled states.

```html
<sq-button size="xl" tone="brand">Continue</sq-button>
<sq-button size="xl" appearance="secondary" tone="critical">Reject</sq-button>
<sq-button appearance="secondary" [disabled]="true">Unavailable</sq-button>
```

The exported `ButtonAppearance`, `ButtonTone` and `ButtonSize` types describe these inputs. `--sq-button-color` can override the resting fill/outline color; `--sq-button-padding-block` and `--sq-button-padding-inline` remain available for custom geometry. The preview contains the four tones, hover/disabled examples and all four sizes.

The demo uses S buttons (24px high) for actions and color/state examples; the Sizes comparison retains S/M/L/XL.

Button validation: the form library and production demo build successfully; all four button behavior tests, lint, TypeScript and package/style checks pass. Chrome checks at 1440/390/320px verify all 12 S samples, real hover on enabled/disabled buttons, runtime brand overrides, keyboard focus and disabled tab skipping, matching heights across appearances, and no horizontal overflow. Captures: [desktop variants](buttons/screenshots/variants-1440.png), [mobile variants](buttons/screenshots/variants-top-390.png), [mobile disabled/hover](buttons/screenshots/variants-bottom-320.png). The [browser manifest](buttons/screenshots/manifest.json) records the measured values.

Input, textarea and single-select typeahead retain scoped CSS hooks for metadata-derived heights:

```scss
.field-s { --sq-field-line-height: 20px; } // 28px single-line frame
.field-m { --sq-field-line-height: 24px; } // 32px
.field-l { --sq-field-line-height: 32px; } // 40px
```

```html
<sq-button size="l">Large geometry</sq-button>
<div class="field-m"><sq-input controlLabel="Name"></sq-input></div>
```

The larger field examples establish geometry only; their final typography awaits detailed references. Button variants and XL typography follow the supplied screenshots; smaller button sizes retain their existing metrics.

## Dropdowns

The screenshot is interpreted as S/M/L trigger heights of **32/40/48px**, with **14/16/24px** Space Grotesk regular text. Labels stay 14/24 across sizes. `DropdownSize` is the exported `'s' | 'm' | 'l'` union; the default is S. This supersedes the previous 28px dropdown frame and the dropdown's use of `--sq-field-line-height`. `--sq-dropdown-line-height` remains available for custom trigger geometry; other field types keep their existing hooks.

The white menu floats 4px below the trigger, aligns to its full width, has rounded corners, row separators and a subtle shadow. Opening it does not resize the trigger or move the centered gray chevron; the chevron points upward while open. Default row heights are 40/48/60px. The viewport fits four rows before scrolling. Long default labels truncate on narrow screens; custom templates can grow their rows.

Selected options use brand-green text on white. Pointer hover and keyboard highlight use Brand Light, while disabled options use gray and cannot be selected. Selection (`aria-selected`) stays separate from keyboard focus (`aria-activedescendant`); arrow keys skip disabled items and scroll the active row into view. Enter/Space select, Escape/Tab close, and outside clicks close the menu. Existing template slots and selection event/copy semantics remain supported.

```typescript
import type { DropdownOption } from '@sq-ui/ng-form-elements';

readonly teams: DropdownOption[] = [
  { label: 'Design', value: 'design' },
  { label: 'Unavailable', value: 'unavailable', disabled: true },
];
```

```html
<sq-dropdown size="m" controlLabel="Team" controlPlaceholder="Please select"
             [options]="teams" [(value)]="selectedTeam"></sq-dropdown>
```

Existing `LabelValuePair[]` arrays remain assignable to `options`; the optional `disabled` flag belongs to the new `DropdownOption<TValue>` type. It does not imply disabled-item handling in typeahead or other controls. Popup menus use absolute positioning, so containers with clipping overflow must allow room for them. The **Dropdowns** preview compares untitled/titled triggers, short menus and long menus in all three sizes.

Verified with 14 dropdown tests, production common/form/demo builds, lint, TypeScript and isolated Sass checks. Chrome checks at 1440/390/320px measure closed/open heights, font sizes, chevron centering, menu alignment and rows; exercise disabled options, keyboard selection/scrolling, Escape/Tab, custom templates and runtime brand overrides; and check horizontal overflow. Captures: [S menu](dropdowns/screenshots/options-s-1440.png), [M menu](dropdowns/screenshots/options-m-1440.png), [L menu](dropdowns/screenshots/options-l-1440.png), [small mobile](dropdowns/screenshots/options-l-320.png), [scrolling](dropdowns/screenshots/scroll-s-390.png). The [browser manifest](dropdowns/screenshots/manifest.json) records the measurements.

## Tags input

The supplied screenshot is interpreted as S/M/L minimum field heights of **32/40/48px**, with **14/16/24px** Space Grotesk regular text. Labels stay 14/24. Empty and typed fields share the same geometry. Selected tags are brand-green pills with white text and a white remove cross; chip heights are **24/32/40px**. Each field has a neutral inside border, 4px corners and a Gray 3 placeholder. Chip spacing is 4px and chip contents have an 8px gap before the remove button.

`size="s"` is the default; `TagsInputSize` is the exported union. This supersedes the old 28px tags field and its use of `--sq-field-line-height`. Use `--sq-tags-line-height` for custom field geometry. Multiple chips wrap as needed. Long default chip labels truncate while keeping the remove button visible and retaining the full tag in its accessible name. Native input focus highlights the field, and the remove button remains keyboard accessible. Disabled controls retain the existing disabled surface, show gray chips and hide removal buttons; those colors are an adaptation because the screenshot has no disabled variant.

```html
<sq-tags-input size="m" controlLabel="Topics" controlPlaceholder="Placeholder"
               [(value)]="topics"></sq-tags-input>
```

The value remains a `string[]`; Enter, Space and comma commit a tag, Backspace in an empty field removes the last tag, and `sq-tag` templates keep their `tag`/`remove` context. Untitled fields use the placeholder as their accessible name. Typeahead keeps its own chip styling. The **Tags** preview shows untitled/titled placeholders, editable typed text and a selected chip in all three sizes.

Validated with six existing tags tests, common/form package builds, the production demo build, lint, TypeScript and isolated Sass checks. Chrome checks at 1440/390/320px verify field/chip geometry and colors, draft text, all three tag separators, Backspace, pointer and keyboard removal, field/button focus, long-label truncation, custom templates, runtime brand overrides and unchanged typeahead field sizing. Captures: [S](tags/screenshots/tags-s-1440.png), [M](tags/screenshots/tags-m-1440.png), [L](tags/screenshots/tags-l-1440.png), [small mobile](tags/screenshots/tags-l-320.png), [long label](tags/screenshots/long-tag-l-320.png). The [browser manifest](tags/screenshots/manifest.json) records measured values.

## Multiselect

`sq-typeahead [multiple]="true"` implements the multiselect reference. S/M/L minimum trigger heights are **32/40/48px**, text sizes **14/16/24px**, and green pill heights **24/32/40px**. Labels stay 14/24. The default is S. `TypeaheadSize` is the exported size union; the single-select search presentation retains its existing sizing. In multiple mode, a centered gray chevron replaces the magnifier and points upward while the menu is open.

The white popup aligns 4px below the trigger, with 40/48/60px rows, separators, a shadow and scrolling after four rows. Each default row has a decorative 20px checkbox. Selected rows show a green square with a white tick; their text stays black. Disabled rows use gray text and a gray square on Gray 2. Hover and keyboard highlight use Brand Light. Clicking a selected row deselects it; chip removal updates the checkbox state too. Selection is compared with `Object.is` on each pair's `value`, so stable scalar values are useful when refreshing results.

Arrow keys skip disabled items, Enter toggles the active choice, and Escape/Tab close the popup. The search input owns combobox focus and an active-descendant relationship to the listbox; checkbox visuals do not add nested keyboard targets. Custom option/selected-item templates retain their existing contexts. Disabled controls block selection and removal.

```html
<sq-typeahead [multiple]="true" size="m" controlLabel="Teams"
              [searchResults]="teamOptions" [(value)]="selectedTeams"></sq-typeahead>
```

`TypeaheadOption<TValue>` extends `LabelValuePair<TValue>` with optional `disabled`. Raw results and `displayProp` remain supported; a raw object's `disabled` flag is also respected when `displayProp` is used. The component still delegates filtering/fetching to `(onUserInputEnd)`; return a new result array for each query, including empty results. Opening an empty option list requests the current query through the same debounced search pipeline. The **Multiselect** preview compares untitled, typed, selected-chip and option states at all three sizes.

Validated with 21 typeahead/field-accessibility tests, common/form package builds, the production demo build, lint, TypeScript and isolated Sass checks. Chrome checks at 1440/390/320px verify trigger/chip sizes, centered chevrons, menu geometry, checkbox selected/disabled states, pointer/keyboard toggling and removal, search, custom templates and page overflow. Captures: [S](multiselect/screenshots/multiselect-s-1440.png), [M](multiselect/screenshots/multiselect-m-1440.png), [L](multiselect/screenshots/multiselect-l-1440.png), [small mobile](multiselect/screenshots/multiselect-l-320.png). The [browser manifest](multiselect/screenshots/manifest.json) records measured values.

## Links

The shared `.sq` theme styles ordinary anchors with an `href`. Link font metrics inherit from the surrounding text. The screenshot's state colors use the existing palette:

| State | Text and underline |
| --- | --- |
| Default / visited | Brand `#00C474`, underlined |
| Hover | Black `#202020`, underlined |
| Active / current | Black `#202020`, no underline |
| Disabled | Gray `#AAAAAA`, underlined |

The underline follows `currentColor`, with a `0.06em` thickness and `0.4em` offset so it scales with the text. Keyboard focus uses the theme's existing visible outline. Link rules use low specificity so navigation, cards and button-like anchors can retain their own presentation.

```html
<section class="sq">
  <a href="/details">Details</a>
  <a href="/current" aria-current="page">Current page</a>
  <a class="sq-link" role="link" aria-disabled="true">Unavailable</a>
</section>
```

Use `aria-current` for the current destination (`"false"` leaves the normal style). A disabled link must omit `href` and `routerLink`, and should not have a `tabindex`: `aria-disabled` describes its state but does not prevent navigation by itself. `.sq-link` gives a no-`href` anchor the link presentation. Runtime `--sq-color-brand`, `--sq-color-black`, and `--sq-color-disabled` override the state colors; `--sq-link-color` optionally changes only the resting color.

The preview's **Links** section includes all four states, a regular inline example, and thumbs-up anchors, using the demo's default text styles throughout. Add `sq-anchor` to an anchor, with `sq-anchor-icon` and `sq-anchor-label` children, to align an icon and underline only the label. The icon follows the link color and scales to `1.5em`; the gap is `0.5em`. Mark decorative icons `aria-hidden="true"` and SVGs `focusable="false"`.

```html
<a class="sq-anchor" href="/details">
  <svg class="sq-anchor-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true" focusable="false">
    <!-- Icon paths use currentColor. -->
  </svg>
  <span class="sq-anchor-label">Details</span>
</a>
```

Verified in Chrome at 1440/390/320px: default/hover/current/disabled colors and underlines, actual pointer hover and press, keyboard focus, disabled tab skipping, inherited font metrics and runtime brand overrides, theme scoping, and demo layout. Captures: [desktop](links/screenshots/links-1440.png), [mobile](links/screenshots/links-390.png), [small mobile](links/screenshots/links-320.png). The [browser manifest](links/screenshots/manifest.json) records the measured values. The common/form package builds, production demo build, isolated Sass checks, lint and TypeScript check also pass.

Icon anchors additionally verify matching icon/label colors, vertical alignment, decorative SVG semantics, label-only underlining, pointer interaction over the icon, keyboard focus and disabled tab skipping. Captures: [desktop anchors](links/screenshots/anchors-1440.png), [mobile anchors](links/screenshots/anchors-390.png), [small mobile anchors](links/screenshots/anchors-320.png).

## Checkboxes

Checkboxes follow the supplied screenshot: a 20px square, 1px brand border, 4px corners, white resting surface and a 10px gap before the 14/24 Space Grotesk regular label. Hover changes the enabled label to brand green. Selected controls fill the square with brand green and show a white SVG checkmark. Disabled controls use the gray label/border on a Gray 2 surface. The additional disabled-selected example retains its checkmark in gray so its stored value remains visible.

The native input remains the sole interaction target; clicking the square or label toggles once, Space works by keyboard, and disabled controls are skipped by Tab. Focus is outlined on the square, with a wrapper outline for custom templates without a square. The checkmark is decorative. Radio styles remain separate.

`--sq-color-brand`, `--sq-color-text`, `--sq-color-white`, `--sq-color-disabled`, `--sq-color-disabled-checkbox-border` and `--sq-color-disabled-surface` customize the state colors. `--sq-checkbox-label-color` optionally changes an enabled resting label (used for the preview's static hover sample). The preview includes default, hover, selected, disabled and disabled-selected states.

Validated with 11 existing checkbox/radio tests, common/form package builds, the production demo build, lint, TypeScript and isolated Sass checks. Chrome checks at 1440/390/320px verify geometry, state colors, SVG checkmark visibility, real square/label clicks, keyboard toggling and focus, disabled behavior, custom-template focus, runtime brand inheritance and radio circle geometry. Captures: [desktop](checkboxes/screenshots/checkboxes-1440.png), [mobile](checkboxes/screenshots/checkboxes-390.png), [small mobile](checkboxes/screenshots/checkboxes-320.png), [keyboard focus](checkboxes/screenshots/checkbox-focus-320.png). The [browser manifest](checkboxes/screenshots/manifest.json) records measured values.

## Radio buttons

The radio reference uses a 20px circle with a 1px brand outline and white resting surface, a 10px label gap and 14/24 Space Grotesk regular text. Hover turns the enabled label brand green. Selected radios have a green fill with an 8px white center. Disabled radios use a gray border/label on a Gray 2 surface. A disabled value that is already selected retains a gray center as an adaptation of the disabled palette.

The native radio handles pointer selection, Space and arrow keys within a named group. The input remains above the visual circle, labels stay linked to their input, disabled options are skipped, and keyboard focus is shown on the circle or on a custom-template wrapper. The visual circle is decorative. The preview shows all four screenshot states in one group, plus the separate Delivery group.

State colors use `--sq-color-brand`, `--sq-color-white`, `--sq-color-text`, `--sq-color-disabled`, `--sq-color-disabled-radio-border` and `--sq-color-disabled-surface`. `--sq-radio-label-color` optionally changes an enabled resting label, as in the preview's static hover example.

Validated with 11 existing radio/checkbox tests, common/form package builds, the production demo build, lint, TypeScript and isolated Sass checks. Chrome checks at 1440/390/320px verify circle and centered white-dot geometry, all state colors, circle/label clicks, Space/arrow navigation, one selected option per named group, group isolation, disabled skipping, custom-template focus, runtime brand overrides and checkbox regression checks. Captures: [desktop](radios/screenshots/radios-1440.png), [mobile](radios/screenshots/radios-390.png), [small mobile](radios/screenshots/radios-320.png), [keyboard focus](radios/screenshots/radio-focus-320.png). The [browser manifest](radios/screenshots/manifest.json) records measured values.

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
- Override semantic tokens deliberately. Their default colors now come from the supplied palette. Component-role assignments and shadow geometry/opacity remain implementation choices until their detailed state/effect references are available; see [Default color palette](theme-colors.md).

## Review the examples

Build libraries with `npm run build:libs`, then run `npx ng serve` and open **Preview** (`/#/preview`). Avoid `npm start` after that build: its existing `prestart` cleanup removes `dist/`. The gallery is also embedded at the end of `/#/sq-ui`, where the earlier custom-template examples remain available.

The [reference checklist](style-migration/preview-reference-checklist.md) maps each example family and table subcomponent to exact known Figma nodes, with evidence levels and gaps. The [Phase 5 report](style-migration/phase-5-examples-and-docs.md) records the examples and validation. Final screenshot-to-Figma comparison belongs to Phase 6 after the remaining source references become available.

The [Phase 6 report](style-migration/phase-6-validation.md) records the final production checks, 320px layout and keyboard coverage, accessibility corrections and remaining source/interaction limits. To inspect a built production app without installing a server, run `node scripts/serve-built-preview.mjs` after building libraries and the app; it serves only on localhost at port 4201 (override with `STYLE_PREVIEW_PORT`).
