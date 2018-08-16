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
