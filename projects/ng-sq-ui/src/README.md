# NG-SQ-UI

> Simple Quality UI kit for Angular

> build by developers for developers!

## Docs

You will find a description of the public API for each component.
The components are grouped by modules. Any properties you can see through code inspection that are left out from this documentation are for internal use and you should not rely on them.

Any types of public interfaces and services are also included.

- [Home Page](https://sq-ui.github.io/ng-sq-ui)
- [Installation](https://sq-ui.github.io/ng-sq-ui/#/installation)
- [Form Elements](https://sq-ui.github.io/ng-sq-ui/#/form-elements-module)
- [Datetime Picker](https://sq-ui.github.io/ng-sq-ui/#/datetime-picker-module)
- [Modal](https://sq-ui.github.io/ng-sq-ui/#/modal-module)
- [Interfaces](https://sq-ui.github.io/ng-sq-ui/#/interfaces)
- [Live examples](https://ng-sq-ui-examples.surge.sh)

## Installation

```
npm i @sq-ui/ng-sq-ui --save
```

-- or --

```
yarn add @sq-ui/ng-sq-ui
```

## Usage

Import the NgSqUiModule in your module:

```
import { NgSqUiModule } from '@sq-ui/ng-sq-ui';
```

and then include it in the `imports` array of your @NgModule() decorator:

```
@NgModule({
  declarations: [ //... ],
  imports: [
    NgSqUiModule,
    //...
  ],
  //...
```

ng-sq-ui does not come with a specific font. Including the default theme is also optional. Refer to our [Live examples page](https://ng-sq-ui-examples.surge.sh).

### Add styles to angular.json

```json
"styles": [
  "src/styles.css",
  "./node_modules/@sq-ui/ng-sq-ui/sq-ui-theme.scss",
  "./node_modules/font-awesome/scss/font-awesome.scss"
],
```

### Apply styling to the components

To use our styling just add the `class="sq"` on a parent element.

```html
<body class="sq">
  <div class="row">
    <sq-input ...></sq-input>
  </div>
</body>
```

## Dependencies

- font-awesome
- immutable.js
- @sq-ui/ng-datetime-picker

## Support

- Use NG-SQ-UI in your daily work.
- **Star** it if you like.
- [Join slack chat](https://join.slack.com/t/ng-sq-ui/shared_invite/enQtNDE2NDQxMjA4NzU4LTNiOWZjMGU5Mzc1N2NiMjRkMjJlM2U5OWY4ZGUyOWNjNjFmY2EyMzQ0Zjg0Mjk5OTE4MGUyMjQwMmU3NDI2Yzg) to help solve problems.
- Follow us on [twitter](https://twitter.com/sq_ui_kit) to get latest updates.
