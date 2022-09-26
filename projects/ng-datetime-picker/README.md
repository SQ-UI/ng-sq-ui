# @sq-ui/ng-datetime-picker [![](https://data.jsdelivr.com/v1/package/npm/@sq-ui/ng-datetime-picker/badge?style=rounded)](https://www.jsdelivr.com/package/npm/@sq-ui/ng-datetime-picker)

> Simple Quality UI kit for Angular

> built by developers for developers!

![angular](https://badge.fury.io/js/angular.svg)
![travis](https://travis-ci.com/SQ-UI/ng-sq-ui.svg?branch=master)
[![contributions welcome](https://img.shields.io/badge/issues-welcome-brightgreen.svg?style=flat)](https://github.com/SQ-UI/ng-sq-ui/issues)
[![Maintainability](https://api.codeclimate.com/v1/badges/d53c1670c301071be452/maintainability)](https://codeclimate.com/github/SQ-UI/ng-sq-ui/maintainability)
[![All Contributors](https://img.shields.io/badge/all_contributors-2-orange.svg?style=flat-square)](#contributors)
[![Mentioned in Awesome Angular](https://awesome.re/mentioned-badge.svg)](https://github.com/gdi2290/awesome-angular)
![Package download](https://img.shields.io/npm/dm/@sq-ui/ng-sq-ui.svg?logo=ng-sq-ui)
[![Stake to support us](https://badge.devprotocol.xyz/0xFDF5E73AF86683F61Ef23dB90D6225e8d661Cc54/descriptive)](https://stakes.social/0xFDF5E73AF86683F61Ef23dB90D6225e8d661Cc54)

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

## BREAKING CHANGES:
The 2.0.0 relases of all packages are compatible with Angular 14+. If you need a backwards-compatible version, please refer to 1.x.y packages, as stated below.

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
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/ardentia"><img src="https://avatars2.githubusercontent.com/u/41083417?v=4?s=50" width="50px;" alt=""/><br /><sub><b>Plamena Radneva</b></sub></a><br /><a href="https://github.com/SQ-UI/ng-sq-ui/commits?author=ardentia" title="Code">💻</a> <a href="https://github.com/SQ-UI/ng-sq-ui/commits?author=ardentia" title="Documentation">📖</a> <a href="https://github.com/SQ-UI/ng-sq-ui/commits?author=ardentia" title="Tests">⚠️</a> <a href="#tutorial-ardentia" title="Tutorials">✅</a> <a href="#blog-ardentia" title="Blogposts">📝</a></td>
    <td align="center"><a href="https://github.com/samuil4"><img src="https://avatars0.githubusercontent.com/u/797921?v=4?s=50" width="50px;" alt=""/><br /><sub><b>Samuil Gospodinov</b></sub></a><br /><a href="https://github.com/SQ-UI/ng-sq-ui/commits?author=samuil4" title="Code">💻</a> <a href="https://github.com/SQ-UI/ng-sq-ui/commits?author=samuil4" title="Documentation">📖</a> <a href="https://github.com/SQ-UI/ng-sq-ui/commits?author=samuil4" title="Tests">⚠️</a> <a href="#talk-samuil4" title="Talks">📢</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/kentcdodds/all-contributors) specification. Contributions of any kind welcome!