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
[![@sq-ui/ng-sq-ui Dev Token](https://badge.devtoken.rocks/@sq-ui/ng-sq-ui)](https://devtoken.rocks/package/@sq-ui/ng-sq-ui)

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

> You can clone / download this repo or install it as a node dependency.

```
npm i @sq-ui/ng-sq-ui@latest --save
```

-- or --

```
yarn add @sq-ui/ng-sq-ui@latest
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

Need a grid? [We've got you covered](https://sq-ui.github.io/sq-grid/)!

### Add styles to angular.json

```json
"styles": [
  "src/styles.css",
  "./node_modules/@sq-ui/ng-sq-common/sq-ui-theme.scss",
  "./node_modules/@sq-ui/ng-sq-ui/styles/form-elements.scss",
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

## Dependencies

ng-sq-ui depends on:

font-awesome and immutable.js (both will be installed with ng-sq-ui)

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
- **Star** it if you like.
- Join us on <a href="https://spectrum.chat/sq-ui">spectrum.chat</a>.
- Join us on <a href="http://bit.ly/ng-sq-ui-slack">ng slack</a> or our main <a href="http://bit.ly/ng-sq-slack">SQ slack channel</a>.
- Follow us on [twitter](https://twitter.com/sq_ui_kit) to get latest updates.
- Or simply send an email to contact[at]sq-ui.xyz.
- Sponsor with [DevToken](https://devtoken.rocks/package/@sq-ui/ng-sq-ui)
- Tip us with BAT from brave awards or download [brave](https://brave.com/ngs747)

## Contribution

Want to file a bug, contribute some code, or improve documentation? Read up on our [Contributing Guide](CONTRIBUTING.md) before making a pull request.

Thank you to all <a href="https://github.com/sq-ui/ng-sq-ui/graphs/contributors">contributers</a>!

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
| [<img src="https://avatars2.githubusercontent.com/u/41083417?v=4" width="50px;"/><br /><sub><b>Plamena Radneva</b></sub>](https://github.com/ardentia)<br />[💻](https://github.com/SQ-UI/ng-sq-ui/commits?author=ardentia "Code") [📖](https://github.com/SQ-UI/ng-sq-ui/commits?author=ardentia "Documentation") [⚠️](https://github.com/SQ-UI/ng-sq-ui/commits?author=ardentia "Tests") | [<img src="https://avatars0.githubusercontent.com/u/797921?v=4" width="50px;"/><br /><sub><b>Samuil Gospodinov</b></sub>](https://github.com/samuil4)<br />[💻](https://github.com/SQ-UI/ng-sq-ui/commits?author=samuil4 "Code") [📖](https://github.com/SQ-UI/ng-sq-ui/commits?author=samuil4 "Documentation") [⚠️](https://github.com/SQ-UI/ng-sq-ui/commits?author=samuil4 "Tests") [📢](#talk-samuil4 "Talks") |
| :---: | :---: |
<!-- ALL-CONTRIBUTORS-LIST:END -->

## LICENSE

- [MIT](http://opensource.org/licenses/MIT)
- Feel free to use and contribute to the development.

## Contributors

Thanks goes to these wonderful people ([emoji key](https://github.com/kentcdodds/all-contributors#emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/kentcdodds/all-contributors) specification. Contributions of any kind welcome!
