# Installation

!> **3.0** requires **Angular 22+** and **Node 22+**. Components are standalone and integrate with [Signal Forms](https://angular.dev/guide/forms/signals). See [Migrating to 3.0](migration-3.md).

## Install the package

`npm i @sq-ui/ng-sq-ui@latest --save`

-- or --

`yarn add @sq-ui/ng-sq-ui@latest`

Install leaf packages instead if you only need a subset (e.g. `@sq-ui/ng-form-elements`, `@sq-ui/ng-modal`).

For datetime picker, add the Temporal polyfill (peer of `@sq-ui/ng-datetime-picker`):

```bash
npm i @js-temporal/polyfill --save
```

## Import standalone components + Signal Forms

There are **no NgModules**. Import the components (and `FormField`) into your standalone component or route:

```typescript
import { Component, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { InputComponent, CheckboxComponent } from '@sq-ui/ng-form-elements';
// or from the umbrella: import { InputComponent, CheckboxComponent } from '@sq-ui/ng-sq-ui';

@Component({
  imports: [FormField, InputComponent, CheckboxComponent],
  template: `
    <sq-input [formField]="f.name" controlLabel="Name" />
    <sq-checkbox [formField]="f.accept" controlLabel="Accept" />
  `,
})
export class ExampleComponent {
  model = signal({ name: '', accept: false });
  f = form(this.model);
}
```

`@sq-ui/ng-sq-ui` re-exports standalone symbols only — there is no `NgSqUiModule`.

?> Reactive Forms consumers can bridge via Angular’s `compatForm` from `@angular/forms/signals/compat` (see Angular docs). Prefer Signal Forms for new code.

## Add styles to angular.json

```json
"styles": [
  "src/styles.css",
  "./node_modules/@sq-ui/ng-sq-common/sq-ui-theme.scss",
  "./node_modules/@fortawesome/fontawesome-free/css/fontawesome.min.css",
  "./node_modules/@fortawesome/fontawesome-free/css/solid.min.css",
  "./node_modules/@fortawesome/fontawesome-free/css/regular.min.css"
],
```

Font Awesome **6** CSS paths are required for icons used by the kit.

## Apply styling to the components

Add `class="sq"` on a parent element to opt into the theme:

```html
<body class="sq">
  <sq-input ...></sq-input>
</body>
```

```html
<div class="sq">
  <sq-input ...></sq-input>
  <sq-dropdown ...></sq-dropdown>
</div>
```
