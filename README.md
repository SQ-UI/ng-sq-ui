# NG-SQ-UI

> Simple Quality UI kit for Angular

> built by developers for developers!

![angular](https://badge.fury.io/js/angular.svg)
![CI](https://github.com/SQ-UI/ng-sq-ui/actions/workflows/main.yml/badge.svg)
[![contributions welcome](https://img.shields.io/badge/issues-welcome-brightgreen.svg?style=flat)](https://github.com/SQ-UI/ng-sq-ui/issues)
[![Maintainability](https://api.codeclimate.com/v1/badges/d53c1670c301071be452/maintainability)](https://codeclimate.com/github/SQ-UI/ng-sq-ui/maintainability)
[![All Contributors](https://img.shields.io/badge/all_contributors-2-orange.svg?style=flat-square)](#contributors)
[![Mentioned in Awesome Angular](https://awesome.re/mentioned-badge.svg)](https://github.com/gdi2290/awesome-angular)
![Package download](https://img.shields.io/npm/dm/@sq-ui/ng-sq-ui.svg?logo=ng-sq-ui)
[![Stake to support us](https://badge.devprotocol.xyz/0x014f98F05c0BeD44B4Cf0532a93312a2135afaB8/descriptive)](https://stakes.social/0x014f98F05c0BeD44B4Cf0532a93312a2135afaB8)
[![Netlify Status](https://api.netlify.com/api/v1/badges/f9cb1185-dc56-4886-99b9-57627d0e892d/deploy-status)](https://app.netlify.com/sites/sq-ui-preview-develop/deploys)
 [![](https://data.jsdelivr.com/v1/package/npm/@sq-ui/ng-sq-ui/badge?style=rounded)](https://www.jsdelivr.com/package/npm/@sq-ui/ng-sq-ui)

## Docs

You will find a description of the public API for each component.
Components are standalone and grouped by package. Any properties left out of this documentation are for internal use — do not rely on them.

- [Home Page](http://bit.ly/ng-sq-ui-docs-home)
- [Installation](http://bit.ly/ng-sq-ui-docs-installation)
- [Migrating to 3.0](docs/migration-3.md)
- [Form Elements](http://bit.ly/ng-sq-ui-docs-form-elements)
- [Modal](http://bit.ly/ng-sq-ui-docs-modal)
- [Progress Bar](http://bit.ly/ng-sq-ui-docs-progressbar)
- [Datetime Picker](http://bit.ly/ng-sq-ui-docs-datetime-picker)
- [Datatable](http://bit.ly/ng-sq-ui-docs-datatable)
- [Common](http://bit.ly/ng-sq-ui-docs-common)
- [About us](http://bit.ly/ng-sq-ui-docs-about-us)
- [Bounty Program](http://bit.ly/bounty-program)
- [Live examples](http://bit.ly/ng-sq-ui-docs-live-examples)
- [Troubleshooting](http://bit.ly/ng-sq-ui-docs-troubleshooting)

## BREAKING CHANGES

**3.0.0** requires **Angular 22+** and **Node 22+**. All components are **standalone**. Form controls implement Signal Forms (`FormValueControl` / `FormCheckboxControl`) and bind with `[formField]`. Dates use **Temporal** (`PlainDate` / `PlainTime`) instead of moment. **immutable** is removed. **NgModules** (`NgSqUiModule`, etc.) are removed. Icons require **Font Awesome 6**.

See [docs/migration-3.md](docs/migration-3.md) for the full list.

**2.x** packages targeted the Angular 14–16 era (Ivy / NgModules / CVA).

**1.x** packages are for older Angular / View Engine:

**@sq-ui/ng-sq-ui:** 1.3.3  
**@sq-ui/ng-datetime-picker:** 1.1.2  
**@sq-ui/ng-sq-common:** 1.1.5  
**@sq-ui/ng-modal:** 1.1.2  
**@sq-ui/ng-datatable:** 1.1.3

For Angular &lt; 9, use 1.1.x of the packages above (see older release notes).

## Installation

> You can clone / download this repo or install it as a node dependency.

```
npm i @sq-ui/ng-sq-ui@latest --save
```

-- or --

```
yarn add @sq-ui/ng-sq-ui@latest
```

## Usage

`@sq-ui/ng-sq-ui` re-exports standalone symbols from the leaf packages. There is **no** `NgSqUiModule` — import the components you need (or import them from the leaf packages directly).

```ts
import { Component, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { InputComponent, CheckboxComponent } from '@sq-ui/ng-form-elements';

@Component({
  imports: [FormField, InputComponent, CheckboxComponent],
  template: `
    <sq-input [formField]="f.name" />
    <sq-checkbox [formField]="f.accept" />
  `,
})
export class Example {
  model = signal({ name: '', accept: false });
  f = form(this.model);
}
```

ng-sq-ui does not ship a specific font. Including the default theme is optional. Refer to our [Live examples page](http://bit.ly/ng-sq-ui-docs-live-examples).

Need a grid? [We've got you covered](https://sq-ui.github.io/sq-grid/)!

### Add styles to angular.json

```json
"styles": [
  "src/styles.css",
  "./node_modules/@sq-ui/ng-sq-common/sq-ui-theme.scss",
  "./node_modules/@fortawesome/fontawesome-free/css/fontawesome.min.css",
  "./node_modules/@fortawesome/fontawesome-free/css/solid.min.css",
  "./node_modules/@fortawesome/fontawesome-free/css/regular.min.css"
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

- **@fortawesome/fontawesome-free** 6.x (installed with the kit)
- **@js-temporal/polyfill** — peer of `@sq-ui/ng-datetime-picker` (needed for browsers without native Temporal, e.g. Safari)

## Try it out locally

```
git clone git@github.com:SQ-UI/ng-sq-ui.git
npm i
npm start
```

-- or --

```
git clone git@github.com:SQ-UI/ng-sq-ui.git
yarn install
npm start
```

The libraries are watched automatically when you run `npm start`:
* The TypeScript compiler for this project is configured to look for the libraries under `dist/` and if `dist/` does not exist, it refers to the libraries' source code. That is why you should run `npm start` instead of just `ng serve --open` - `npm start` removes `dist/` (if it exists) and then runs `ng serve --open`. This prepares the compiler to listen for changes under the `projects/` directory.

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
