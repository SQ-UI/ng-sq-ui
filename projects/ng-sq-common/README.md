# @sq-ui/ng-sq-common [![](https://data.jsdelivr.com/v1/package/npm/@sq-ui/ng-sq-common/badge?style=rounded)](https://www.jsdelivr.com/package/npm/@sq-ui/ng-sq-common)

> Simple Quality UI kit for Angular

> built by developers for developers!

![angular](https://badge.fury.io/js/angular.svg)
![travis](https://travis-ci.com/SQ-UI/ng-sq-ui.svg?branch=master)
[![contributions welcome](https://img.shields.io/badge/issues-welcome-brightgreen.svg?style=flat)](https://github.com/SQ-UI/ng-sq-ui/issues)
[![All Contributors](https://img.shields.io/badge/all_contributors-2-orange.svg?style=flat-square)](#contributors)
[![Mentioned in Awesome Angular](https://awesome.re/mentioned-badge.svg)](https://github.com/gdi2290/awesome-angular)
![Package download](https://img.shields.io/npm/dm/@sq-ui/ng-sq-ui.svg?logo=ng-sq-ui)

## Docs

You will find a description of the public API for each component.
The components are grouped by modules. Any properties you can see through code inspection that are left out from this documentation are for internal use and you should not rely on them.

Any types of public interfaces and services are also included.

- [Home Page](https://sq-ui.github.io/ng-sq-ui/#/)
- [Installation](https://sq-ui.github.io/ng-sq-ui/#/installation)
- [FormElementsModule](https://sq-ui.github.io/ng-sq-ui/#/form-elements-module)
- [ModalModule](https://sq-ui.github.io/ng-sq-ui/#/modal-module)
- [ProgressBarModule](https://sq-ui.github.io/ng-sq-ui/#/progressbar-module)
- [DatetimePickerModule](https://sq-ui.github.io/ng-sq-ui/#/datetime-picker-module)
- [DatatableModule](https://sq-ui.github.io/ng-sq-ui/#/datatable-module)
- [CommonModule](https://sq-ui.github.io/ng-sq-ui/#/common-module)
- [About us](https://sq-ui.github.io/ng-sq-ui/#/about-us)
- [Live examples](https://sq-ui.dev/#/preview)
- [Troubleshooting](https://sq-ui.github.io/ng-sq-ui/#/troubleshooting)

## BREAKING CHANGES:
The 2.0.1 relases of all packages are compatible with Angular 14+. If you need a backwards-compatible version, please refer to 1.x.y packages, as stated below.

## Installation

```
npm i @sq-ui/ng-sq-common --save
```

-- or --

```
yarn add @sq-ui/ng-sq-common
```

## Usage

Import standalone components in your component:

```
import { PaginatorComponent } from '@sq-ui/ng-sq-common';
```

and then include them in the `imports` array of your standalone component:

```
@Component({
  standalone: true,
  imports: [
    PaginatorComponent,
    //...
  ],
  //...
```

ng-sq-ui does not come with a specific font. Including the default theme is also optional. Refer to our [Live examples page](https://sq-ui.dev/#/preview).

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
- **Star** ⭐ it if you like.
- Follow us on [twitter](https://twitter.com/sq_ui_kit) to get latest updates.
- Or simply send an email to contact[at]sq-ui.dev.

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
