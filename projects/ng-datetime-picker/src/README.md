# @sq-ui/ng-datetime-picker

> Simple Quality UI kit for Angular

> build by developers for developers!

## Docs

You will find a description of the public API for each component.
The components are grouped by modules. Any properties you can see through code inspection that are left out from this documentation are for internal use and you should not rely on them.

Any types of public interfaces and services are also included.

- [Home Page](https://sq-ui.github.io/ng-sq-ui)
- [Installation](https://sq-ui.github.io/ng-sq-ui/#/installation)
- [Form Elements](https://sq-ui.github.io/ng-sq-ui/#/form-elements-module)
- [Modal](https://sq-ui.github.io/ng-sq-ui/#/modal-module)
- [Datetime-picker](https://sq-ui.github.io/ng-sq-ui/#/datetime-picker)
- [Interfaces](https://sq-ui.github.io/ng-sq-ui/#/interfaces)
- [Live examples](https://ng-sq-ui-examples.surge.sh)

## Installation

```
npm i @sq-ui/ng-datetime-picker --save
```

-- or --

```
yarn add @sq-ui/ng-datetime-picker
```

## Usage

Import the NgDatetimePickerModule in your module:

```
import { NgDatetimePickerModule } from '@sq-ui/ng-datetime-picker';
```

and then include it in the `imports` array of your @NgModule() decorator:

```
@NgModule({
  declarations: [ //... ],
  imports: [
    NgDatetimePickerModule,
    //...
  ],
  //...
```

### Apply styling to the components

To use our styling just add the `class="sq"` on a parent element.

```html
<body class="sq">
  ...
    <sq-datetime-picker ...></sq-datetime-picker>
    <sq-time-picker ...></sq-time-picker>
  ...
</body>
```

## Dependencies

- font-awesome
- immutable.js
- moment.js

## Support

- Use @sq-ui/ng-datetime-picker in your daily work.
- **Star** it if you like.
- [Join slack chat](https://join.slack.com/t/ng-sq-ui/shared_invite/enQtNDE2NDQxMjA4NzU4LTNiOWZjMGU5Mzc1N2NiMjRkMjJlM2U5OWY4ZGUyOWNjNjFmY2EyMzQ0Zjg0Mjk5OTE4MGUyMjQwMmU3NDI2Yzg) to help solve problems.
- Follow us on [twitter](https://twitter.com/sq_ui_kit) to get latest updates.
