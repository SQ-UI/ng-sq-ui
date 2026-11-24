# Cards

`CardComponent` is a standalone component exported by `@sq-ui/ng-sq-common` and
`@sq-ui/ng-sq-ui`. Its styles work with or without a `.sq` wrapper and use the
shared theme tokens. No Angular Material dependency is required.

<div class="docs-preview" data-demo-preview="card">
  <div class="docs-preview-toolbar"><span>Live preview</span><a href="https://sq-ui.dev/#/embed/card" target="_blank" rel="noopener">Open example ↗</a></div>
  <iframe src="https://sq-ui.dev/#/embed/card" title="Card interactive preview" loading="lazy" height="780"></iframe>
</div>

## Usage

```typescript
import { Component } from '@angular/core';
import { CardComponent } from '@sq-ui/ng-sq-common';

@Component({
  selector: 'app-project',
  imports: [CardComponent],
  template: `
    <sq-card title="Design system" subtitle="Workspace" appearance="outlined" actionsAlign="end">
      <p>Reusable components for your application.</p>
      <button sq-card-actions type="button" (click)="save()">Save</button>
      <a sq-card-actions href="/projects">View projects</a>
      <small sq-card-footer>Updated today</small>
    </sq-card>
  `,
})
export class ProjectComponent {
  save(): void { /* Save the project. */ }
}
```

The card is presentational. Buttons, links, images and forms remain under the
consumer's control. Native controls work without a global theme; when using
`sq-button`, import it and apply the form styles and `.sq` wrapper as usual.

## Inputs

| Property | Type | Default | Behavior |
| --- | --- | --- | --- |
| `appearance` | `CardAppearance` | `'outlined'` | `'outlined'`, `'elevated'` or `'filled'` |
| `title` | `string` | `''` | Optional default header heading (`h3`) |
| `subtitle` | `string` | `''` | Optional default header subtitle |
| `actionsAlign` | `CardActionsAlign` | `'start'` | `'start'` or `'end'`, relative to text direction |

Both union types are exported alongside `CardComponent`. Inputs use Angular
signals and update with consumer bindings. The component uses `OnPush` change detection.

Outlined cards have a surface background and border. Elevated cards use the
shared field shadow and no border. Filled cards use the subtle surface and no
border. Explicit card CSS variables take precedence over each appearance.

## Content slots

| Content | Placement |
| --- | --- |
| `[sq-card-header]` | Replaces the entire default title/subtitle header |
| `[sq-card-media]` | Between header and content; no padding by default |
| Unmarked content | Main content area |
| `[sq-card-actions]` | Wrapping row of actions; multiple direct children are supported |
| `[sq-card-footer]` | After the actions |

These are projection attributes; no extra directive imports are needed. Empty
sections take up no space, including when projected actions are removed with
`@if`. Put `sq-card-actions` on each button/link for the card's action gap to
apply between them. A projected wrapper owns the layout of its own children.
For a conditional group of actions, put the condition inside
`<ng-container sq-card-actions>`; this keeps Angular's projection selector on
the group and adds no extra DOM wrapper:

```html
<ng-container sq-card-actions>
  @if (canEdit()) {
    <button type="button">Edit</button>
    <button type="button">Delete</button>
  }
</ng-container>
```

```html
<sq-card role="group" aria-labelledby="project-heading">
  <h2 sq-card-header id="project-heading">My project</h2>
  <img sq-card-media class="project-image" src="project.jpg" alt="Project overview">
  <p>Project details.</p>
  <button sq-card-actions type="button">Open project</button>
</sq-card>
```

```scss
.project-image { display: block; width: 100%; height: auto; }
```

Style your projected markup in the consuming component; the card does not reset
its margins or image dimensions. Use a custom header when the page needs a
different heading level. Set a role and accessible name on the card when its
content needs group or region semantics. The card adds no role or tab stop by
default; its controls retain their native keyboard behavior.

## CSS variables

Set variables on `sq-card` or any ancestor. Public variables are read where used,
so overrides on an ancestor continue through nested cards and `.sq` containers.
Shared `--sq-color-*`, `--sq-font-family-sans`, spacing, border, weight and shadow
tokens supply defaults; no global theme import is needed for the card itself.

```scss
.project-cards {
  --sq-card-background: #202b45;
  --sq-card-color: #ffffff;
  --sq-card-border-color: #8b9bd9;
  --sq-card-subtitle-color: #ccd6f0;
  --sq-card-padding: 24px;
  --sq-card-border-radius: 12px;
  --sq-card-actions-gap: 12px;
}
.compact-card {
  --sq-card-padding: 8px 12px;
  --sq-card-header-padding: 12px 12px 0;
  --sq-card-footer-border-width: 1px;
}
```

All padding variables accept standard CSS shorthand. `--sq-card-padding` is the
default padding for each header/content/actions/footer section; it does not add
an extra outer inset. Override individual section padding as needed. Media has
its own padding, initially `0`. Structural flex/grid layout and zero resets are
fixed; all visual colors, spacing, borders, effects and typography are configurable.

### Container

| Variable | Default |
| --- | --- |
| `--sq-card-background` | `--sq-color-surface` (`#ffffff`); filled: `--sq-color-surface-subtle` (`#fafafa`) |
| `--sq-card-color` | `--sq-color-text` (`#202020`) |
| `--sq-card-border-color` | `--sq-color-border` (`#dcdcdc`) |
| `--sq-card-border-width` | `--sq-border-width` (`1px`); elevated/filled: `0` |
| `--sq-card-border-style` | `solid` |
| `--sq-card-border-radius` | `8px` |
| `--sq-card-box-shadow` | `none`; elevated: `--sq-shadow-field` |
| `--sq-card-width` | `auto` |
| `--sq-card-max-width` | `none` |
| `--sq-card-padding` | `--sq-space-4` (`16px`) for each padded section |
| `--sq-card-gap` | `0` between visible sections |
| `--sq-card-overflow` | `visible` to allow projected popovers and focus outlines |

### Typography

| Variable | Default |
| --- | --- |
| `--sq-card-font-family` | `--sq-font-family-sans` (`'Space Grotesk', Arial, sans-serif`) |
| `--sq-card-font-size` | `14px` |
| `--sq-card-font-weight` | `--sq-font-weight-regular` (`400`) |
| `--sq-card-line-height` | `24px` |
| `--sq-card-letter-spacing` | `--sq-letter-spacing` (`0`) |
| `--sq-card-title-color` | Inherited header color |
| `--sq-card-title-font-size` | `20px` |
| `--sq-card-title-font-weight` | `--sq-font-weight-semibold` (`600`) |
| `--sq-card-title-line-height` | `32px` |
| `--sq-card-title-letter-spacing` | Inherited |
| `--sq-card-title-gap` | `--sq-space-1` (`4px`), before a following subtitle |
| `--sq-card-subtitle-color` | Inherited header color |
| `--sq-card-subtitle-font-size` | `12px` |
| `--sq-card-subtitle-font-weight` | `--sq-font-weight-regular` (`400`) |
| `--sq-card-subtitle-line-height` | `20px` |
| `--sq-card-subtitle-letter-spacing` | Inherited |

### Sections

| Variable | Default |
| --- | --- |
| `--sq-card-header-padding` | `--sq-card-padding` |
| `--sq-card-header-background` | `transparent` |
| `--sq-card-header-color` | Inherited card color |
| `--sq-card-media-padding` | `0` |
| `--sq-card-media-background` | `transparent` |
| `--sq-card-media-color` | Inherited card color |
| `--sq-card-media-border-radius` | `0` |
| `--sq-card-media-overflow` | `hidden` |
| `--sq-card-content-padding` | `--sq-card-padding` |
| `--sq-card-content-background` | `transparent` |
| `--sq-card-content-color` | Inherited card color |
| `--sq-card-actions-padding` | `--sq-card-padding` |
| `--sq-card-actions-background` | `transparent` |
| `--sq-card-actions-color` | Inherited card color |
| `--sq-card-actions-gap` | `--sq-space-2` (`8px`) |
| `--sq-card-actions-justify` | `flex-start`; `actionsAlign="end"`: `flex-end` |
| `--sq-card-footer-padding` | `--sq-card-padding` |
| `--sq-card-footer-background` | `transparent` |
| `--sq-card-footer-color` | Inherited card color |
| `--sq-card-footer-border-color` | `--sq-color-border` (`#dcdcdc`) |
| `--sq-card-footer-border-width` | `0` |
| `--sq-card-footer-border-style` | `solid` |

No font is downloaded. Projected controls keep their own styling variables.
The first and last nonempty sections inherit the card's corresponding outer
corner radii, including when sections are conditionally removed. Section
backgrounds follow these corners while projected popovers can overflow.
`--sq-card-media-border-radius` controls the media's interior corners; its outer
corners follow the card. Set
`--sq-card-overflow: hidden` to clip the whole card when it contains no popovers.

To run the corner and popover browser regression check, serve the built demo
with `node scripts/serve-built-preview.mjs`, then run
`STYLE_BASELINE_BROWSER=/path/to/chrome node scripts/check-card-preview.mjs`.
`STYLE_BASELINE_URL` overrides the default `http://127.0.0.1:4201`.

See the **Cards** section of `/#/preview` or the focused `/#/embed/card` example.
