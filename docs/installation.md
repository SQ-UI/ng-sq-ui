# Installation

## First install the package

`npm i @sq-ui/ng-sq-ui@latest --save`

-- or --

`yarn add @sq-ui/ng-sq-ui@latest`

## Import components in your standalone components

```typescript
import { ReactiveFormsModule } from '@angular/forms';
import { InputComponent, DropdownComponent } from '@sq-ui/ng-sq-ui';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, InputComponent, DropdownComponent],
  //...
})
export class MyComponent {}
```

## Add styles to angular.json

```json
"styles": [
  "src/styles.css",
  "./node_modules/@sq-ui/ng-sq-ui/sq-ui-theme.scss",
  "./node_modules/@fortawesome/fontawesome-free/css/fontawesome.min.css",
  "./node_modules/@fortawesome/fontawesome-free/css/solid.min.css",
  "./node_modules/@fortawesome/fontawesome-free/css/regular.min.css",
],
```

## Apply styling to the components

To use our styling just add the `class="sq"` on a parent element.

> If you want to use our sq theme, add the `sq` class on the body of the document or the app wrapper

```html
<body class="sq">
  <div class="row">
    <sq-input ...></sq-input>
  </div>
</body>
```

```html
<body>
  <app class="sq">
    <sq-input ...></sq-input>
  </app>
</body>
```

> If you would like to use our theme on a specific component (or a set of components) just add the `sq` class on a parent wrapper

```html
<div class="sq">
  <sq-input ...></sq-input>
  <sq-droprdown ...></sq-droprdown>
</div>
```
