# NG-SQ-UI

> Simple Quality UI kit for Angular

> built by developers for developers!

![angular](https://badge.fury.io/js/angular.svg)
![travis](https://travis-ci.com/SQ-UI/ng-sq-ui.svg?branch=master)
[![contributions welcome](https://img.shields.io/badge/issues-welcome-brightgreen.svg?style=flat)](https://github.com/SQ-UI/ng-sq-ui/issues)
[![Maintainability](https://api.codeclimate.com/v1/badges/d53c1670c301071be452/maintainability)](https://codeclimate.com/github/SQ-UI/ng-sq-ui/maintainability)
[![All Contributors](https://img.shields.io/badge/all_contributors-2-orange.svg?style=flat-square)](#contributors)
[![Mentioned in Awesome Angular](https://awesome.re/mentioned-badge.svg)](https://github.com/gdi2290/awesome-angular)
![Package download](https://img.shields.io/npm/dm/@sq-ui/ng-sq-ui.svg?logo=ng-sq-ui)
[![Stake to support us](https://badge.devprotocol.xyz/0x014f98F05c0BeD44B4Cf0532a93312a2135afaB8/descriptive)](https://stakes.social/0x014f98F05c0BeD44B4Cf0532a93312a2135afaB8)

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

ng-sq-ui does not come with a specific font. Including the default theme is also optional. Refer to our [Live examples page](http://bit.ly/ng-sq-ui-docs-live-examples).

### Add styles to angular.json

```json
"styles": [
  "src/styles.css",
  "./node_modules/@sq-ui/ng-sq-ui/sq-ui-theme.scss",
  "./node_modules/@fortawesome/fontawesome-free/css/fontawesome.min.css",
  "./node_modules/@fortawesome/fontawesome-free/css/solid.min.css",
  "./node_modules/@fortawesome/fontawesome-free/css/regular.min.css",
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

### Custom templates

The `FormElementsModule` exposes form controls that support custom templating. Refer to the [FormElementsModule documentation](https://sq-ui.github.io/ng-sq-ui/#/form-elements-module) for more information.

## Support

- Use NG-SQ-UI in your daily work.
- **Star** ⭐ it if you like.
- Join us on <a href="http://bit.ly/ng-sq-ui-slack">ng slack</a> or our main <a href="http://bit.ly/ng-sq-slack">SQ slack channel</a>.
- Follow us on [twitter](https://twitter.com/sq_ui_kit) to get latest updates.
- Or simply send an email to contact[at]sq-ui.xyz.
- Sponsor with [DevToken](https://stakes.social/0x014f98F05c0BeD44B4Cf0532a93312a2135afaB8)
- Tip us with BAT from brave awards or download [brave](https://brave.com/ngs747)

## Contribution

Want to file a bug, contribute some code, or improve documentation? Read up on our [Contributing Guide](CONTRIBUTING.md) before making a pull request.


## LICENSE

- [MIT](http://opensource.org/licenses/MIT)
- Feel free to use and contribute to the development.

## Contributors

Thanks goes to these wonderful <a href="https://github.com/sq-ui/ng-sq-ui/graphs/contributors">people</a>!

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
| [<img src="https://avatars2.githubusercontent.com/u/41083417?v=4" width="50px;"/><br /><sub><b>Plamena Radneva</b></sub>](https://github.com/ardentia)<br />[💻](https://github.com/SQ-UI/ng-sq-ui/commits?author=ardentia "Code") [📖](https://github.com/SQ-UI/ng-sq-ui/commits?author=ardentia "Documentation") [⚠️](https://github.com/SQ-UI/ng-sq-ui/commits?author=ardentia "Tests") | [<img src="https://avatars0.githubusercontent.com/u/797921?v=4" width="50px;"/><br /><sub><b>Samuil Gospodinov</b></sub>](https://github.com/samuil4)<br />[💻](https://github.com/SQ-UI/ng-sq-ui/commits?author=samuil4 "Code") [📖](https://github.com/SQ-UI/ng-sq-ui/commits?author=samuil4 "Documentation") [⚠️](https://github.com/SQ-UI/ng-sq-ui/commits?author=samuil4 "Tests") [📢](#talk-samuil4 "Talks") |
| :---: | :---: |
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/kentcdodds/all-contributors) specification. Contributions of any kind welcome!