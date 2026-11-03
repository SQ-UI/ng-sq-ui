# Installation

> Applies to **3.x** (Angular 22). Coming from 2.x? See *Migrating 2.x → 3.x* in the repository README
> first — the NgModules and the `formControlName` bindings are gone.

Every component is standalone, so there is no module to import: pick the package(s) you need and add
the components to the `imports` of your own standalone component.

## Install a package

The umbrella package re-exports everything:

```bash
npm i @sq-ui/ng-sq-ui@latest --save
```

Or install a single library when you only need one part of the kit:

```bash
npm i @sq-ui/ng-sq-common@latest --save        # paginator, directives, shared types
npm i @sq-ui/ng-form-elements@latest --save    # inputs, dropdown, typeahead, checkbox, ...
npm i @sq-ui/ng-datatable@latest --save
npm i @sq-ui/ng-datetime-picker@latest --save  # date & time pickers
npm i @sq-ui/ng-modal@latest --save
npm i @sq-ui/ng-progress-bar@latest --save
```

| Package | Peer dependencies |
|---|---|
| all of the above | `@angular/core`, `@angular/common` (22.x) |
| `@sq-ui/ng-sq-ui`, `@sq-ui/ng-form-elements` | `@angular/forms` (22.x) |
| any package using icons | `@fortawesome/fontawesome-free` (optional) |

## Import components in your standalone components

```typescript
import { Component, signal } from '@angular/core';
import { InputComponent, DropdownComponent } from '@sq-ui/ng-sq-ui';
import type { LabelValuePair } from '@sq-ui/ng-sq-ui';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [InputComponent, DropdownComponent],
  template: `
    <sq-input controlLabel="Name" [(value)]="name"></sq-input>
    <sq-dropdown controlLabel="Country" [options]="countries" [(value)]="country"></sq-dropdown>
  `,
})
export class ExampleComponent {
  readonly name = signal('');
  readonly country = signal<LabelValuePair | null>(null);
  readonly countries: LabelValuePair[] = [{ label: 'Bulgaria', value: 'bg' }];
}
```

There is no `FormsModule`/`ReactiveFormsModule` requirement: every form control is bound with its own
two-way `value` model, `[(value)]`. If you use Angular Signal Forms, bind the same components with
`[formField]="myForm.field"` instead — see *Angular Signal Forms* in the README.

## Add styles to angular.json

```json
"styles": [
  "src/styles.css",
  "./node_modules/@sq-ui/ng-sq-common/sq-ui-theme.scss",
  "./node_modules/@sq-ui/ng-form-elements/styles/form-elements.scss",
  "./node_modules/@fortawesome/fontawesome-free/css/fontawesome.min.css",
  "./node_modules/@fortawesome/fontawesome-free/css/solid.min.css",
  "./node_modules/@fortawesome/fontawesome-free/css/regular.min.css"
]
```

Use these public Sass entry points. The theme entry emits the scoped reset, base styles and utilities; the other common entries expose Sass functions, variables or mixins:

| File | Purpose |
|---|---|
| `@sq-ui/ng-sq-common/sq-ui-theme.scss` | Everything below (theme entry point) |
| `@sq-ui/ng-sq-common/styles/tokens` | Shared token functions, `$overrides` and optional custom-property mixin |
| `@sq-ui/ng-sq-common/styles/colors.scss` | Compatible legacy Sass color variables; does not emit CSS custom properties |
| `@sq-ui/ng-sq-common/styles/typography` | Typography mixins; fonts remain inherited unless configured |
| `@sq-ui/ng-form-elements/styles/form-elements.scss` | Styles of the form controls |

Alternatively `@use` the theme from your own stylesheet:

```scss
@use '@sq-ui/ng-sq-common/sq-ui-theme.scss';
@use '@sq-ui/ng-form-elements/styles/form-elements.scss';
```

Choose either the `angular.json` entries or these global Sass imports, so the styles are loaded once. See [Styling and migration](styling.md) for font loading, inherited CSS overrides, size options, custom templates and visible migration changes. These examples describe the current repository implementation; check your installed package version before using newly added inputs.

## Apply styling to the components

To use our styling, add the `class="sq"` on a parent element.

> If you want the full theme, put the `sq` class on the `<body>` of the document or on the app wrapper

```html
<body class="sq">
  <div class="row">
    <sq-input ...></sq-input>
  </div>
</body>
```

```html
<body>
  <app-root class="sq">
    <sq-input ...></sq-input>
  </app-root>
</body>
```

> Want the theme on a single component, or a group of them? Add `sq` to a wrapper instead

```html
<div class="sq">
  <sq-input ...></sq-input>
  <sq-dropdown ...></sq-dropdown>
</div>
```

## Running this repository

The demo's **Preview** navigation item (`/#/preview`) shows sizes, states, custom templates, message recovery and local theme overrides using real components. Build the libraries before serving: the workspace resolves library imports from `dist/`. `npm start` runs the existing `prestart` cleanup, so use the direct serve command below after the build to retain those artifacts.

```bash
npm ci              # install
npm run build:libs  # build every library into dist/
npx ng serve        # demo app on http://localhost:4200; open /#/preview
npm test            # unit tests (Vitest 4)
npm run typecheck   # TypeScript over the whole workspace
npm run lint        # ESLint (flat config)
npm run build       # build the demo application
```

`npm test` is the canonical entry point; there is no `ng test` target by design (the workspace uses
Vitest directly, see `vitest.config.ts`).
