# @sq-ui/ng-modal

> Simple Quality UI kit for Angular

> built by developers for developers!

## Docs

You will find a description of the public API for each component.
The components are grouped by modules. Any properties you can see through code inspection that are left out from this documentation are for internal use and you should not rely on them.

Any types of public interfaces and services are also included.

- [Installation](https://sq-ui.github.io/ng-sq-ui/#/installation)
- [FormElementsModule](https://sq-ui.github.io/ng-sq-ui/#/form-elements-module)
- [ModalModule](https://sq-ui.github.io/ng-sq-ui/#/modal-module)
- [ProgressBarModule](https://sq-ui.github.io/ng-sq-ui/#/progressbar-module)
- [DatetimePickerModule](https://sq-ui.github.io/ng-sq-ui/#/datetime-picker-module)
- [DatatableModule](https://sq-ui.github.io/ng-sq-ui/#/datatable-module)
- [CommonModule](https://sq-ui.github.io/ng-sq-ui/#/common-module)
- [Live examples](http://bit.ly/ng-sq-ui-docs-live-examples)

## Installation

```
npm i @sq-ui/ng-modal --save
```

-- or --

```
yarn add @sq-ui/ng-modal
```

## Usage

Import the NgSqUiModule in your module:

```
import { NgModalModule } from '@sq-ui/ng-modal';
```

and then include it in the `imports` array of your @NgModule() decorator:

```
@NgModule({
  declarations: [ //... ],
  imports: [
    NgModalModule,
    //...
  ],
  //...
```

ng-sq-ui does not come with a specific font. Including the default theme is also optional. Refer to our [Live examples page](http://bit.ly/ng-sq-ui-docs-live-examples).

### Add styles to angular.json

```json
"styles": [
  "src/styles.css",
  "./node_modules/font-awesome/scss/font-awesome.scss"
],
```

### Apply styling to the components

To use our styling just add the `class="sq"` on a parent element.

```html
<body class="sq">
  <sq-modal>...</sq-modal>
</body>
```

## Support

- Use NG-SQ-UI in your daily work.
- **Star** it if you like.
- [Join slack chat](https://join.slack.com/t/ng-sq-ui/shared_invite/enQtNDE2NDQxMjA4NzU4LTNiOWZjMGU5Mzc1N2NiMjRkMjJlM2U5OWY4ZGUyOWNjNjFmY2EyMzQ0Zjg0Mjk5OTE4MGUyMjQwMmU3NDI2Yzg) to help solve problems.
- Follow us on [twitter](https://twitter.com/sq_ui_kit) to get latest updates.
