# @sq-ui/ng-sq-common

> Simple Quality UI kit for Angular

> built by developers for developers!

![angular](https://badge.fury.io/js/angular.svg)
![travis](https://travis-ci.com/SQ-UI/ng-sq-ui.svg?branch=master)
[![contributions welcome](https://img.shields.io/badge/issues-welcome-brightgreen.svg?style=flat)](https://github.com/SQ-UI/ng-sq-ui/issues)
[![Maintainability](https://api.codeclimate.com/v1/badges/d53c1670c301071be452/maintainability)](https://codeclimate.com/github/SQ-UI/ng-sq-ui/maintainability)
[![All Contributors](https://img.shields.io/badge/all_contributors-2-orange.svg?style=flat-square)](#contributors)
[![Mentioned in Awesome Angular](https://awesome.re/mentioned-badge.svg)](https://github.com/gdi2290/awesome-angular)
![Package download](https://img.shields.io/npm/dm/@sq-ui/ng-sq-ui.svg?logo=ng-sq-ui)
[![Stake to support us](https://badge.devprotocol.xyz/0xf86A0B73875F6e231401B3eCd31a2Cb22d8eAF93/descriptive)](https://stakes.social/0xf86A0B73875F6e231401B3eCd31a2Cb22d8eAF93)

## Docs

You will find a description of the public API for each component.
The components are grouped by modules. Any properties you can see through code inspection that are left out from this documentation are for internal use and you should not rely on them.

Any types of public interfaces and services are also included.

- [Home Page](http://bit.ly/ng-sq-ui-docs-home)
- [Installation](http://bit.ly/ng-sq-ui-docs-installation)
- [FormElementsModule](http://bit.ly/ng-sq-ui-docs-form-elements)
- [ModalModule](http://bit.ly/ng-sq-ui-docs-modal)
- [ProgressBarModule](http://bit.ly/ng-sq-ui-docs-progressbar)
- [DatetimePickerModule](http://bit.ly/ng-sq-ui-docs-datetime-picker)
- [DatatableModule](http://bit.ly/ng-sq-ui-docs-datatable)
- [CommonModule](http://bit.ly/ng-sq-ui-docs-common)
- [About us](http://bit.ly/ng-sq-ui-docs-about-us)
- [Live examples](http://bit.ly/ng-sq-ui-docs-live-examples)
- [Troubleshooting](http://bit.ly/ng-sq-ui-docs-troubleshooting)

## Installation

```
npm i @sq-ui/ng-sq-common --save
```

-- or --

```
yarn add @sq-ui/ng-sq-common
```

## Usage

Import the NgSqUiModule in your module:

```
import { NgSqCommonModule } from '@sq-ui/ng-sq-common';
```

and then include it in the `imports` array of your @NgModule() decorator:

```
@NgModule({
  declarations: [ //... ],
  imports: [
    NgSqCommonModule,
    //...
  ],
  //...
```

ng-sq-ui does not come with a specific font. Including the default theme is also optional. Refer to our [Live examples page](http://bit.ly/ng-sq-ui-docs-live-examples).

### Add styles to angular.json

```json
"styles": [
  "src/styles.css",
  "./node_modules/@fortawesome/fontawesome-free/css/fontawesome.min.css",
  "./node_modules/@fortawesome/fontawesome-free/css/solid.min.css",
  "./node_modules/@fortawesome/fontawesome-free/css/regular.min.css",
],
```

### Apply styling to the components

To use our styling just add the `class="sq"` on a parent element.

```html
<body class="sq">
  <sq-paginator ...></sq-paginator>
</body>
```

## Support

- Use NG-SQ-UI in your daily work.
- **Star** it if you like.
- [Join slack chat](https://join.slack.com/t/ng-sq-ui/shared_invite/enQtNDE2NDQxMjA4NzU4LTNiOWZjMGU5Mzc1N2NiMjRkMjJlM2U5OWY4ZGUyOWNjNjFmY2EyMzQ0Zjg0Mjk5OTE4MGUyMjQwMmU3NDI2Yzg) to help solve problems.
- Follow us on [twitter](https://twitter.com/sq_ui_kit) to get latest updates.
