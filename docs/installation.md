# Installation

## First install the package

`npm i @sq-ui/ng-sq-ui@latest --save`

-- or --

`yarn add @sq-ui/ng-sq-ui@latest`

## Add the appropriate module - either FormsModule or ReactiveFormsModule

```typescript
import { ReactiveFormsModule } from '@angular/forms';
import { NgSqUiModule } from '@sq-ui/ng-sq-ui';

@NgModule({
  declarations: [],
  imports: [ReactiveFormsModule, NgSqUiModule],
})
export class AppModule {}
```

-- or --

```typescript
import { FormsModule } from '@angular/forms';
import { NgSqUiModule } from '@sq-ui/ng-sq-ui';

@NgModule({
  declarations: [],
  imports: [FormsModule, NgSqUiModule],
})
export class AppModule {}
```

> If you are lazy loading all your modules, you will need to include it in every module you want to use it.

## Add styles to angular.json

```json
"styles": [
  "src/styles.css",
  "./node_modules/@sq-ui/ng-sq-ui/sq-ui-theme.scss",
  "./node_modules/font-awesome/scss/font-awesome.scss"
],
```

## Apply styling to the components

To use our styling just add the `class="sq"` on a parent element.

> If you don't want our styles globally just add the `sq` class on a parent wrapper

```html
<div class="sq">
  <sq-input></sq-input>
</div>
```

> If you don't want to add the `sq` class each time you can add it the body of the document

```html
<body class="sq">
  <div class="row">
    <sq-input></sq-input>
  </div>
</body>
```
