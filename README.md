# NG-SQ-UI

> Simple Quality UI kit for Angular

> build by developers for developers!

![angular](https://badge.fury.io/js/angular.svg)
![travis](https://travis-ci.com/SQ-UI/ng-sq-ui.svg?branch=master)
[![contributions welcome](https://img.shields.io/badge/issues-welcome-brightgreen.svg?style=flat)](https://github.com/SQ-UI/ng-sq-ui/issues)
[![codecov](https://codecov.io/gh/SQ-UI/ng-sq-ui/branch/master/graph/badge.svg)](https://codecov.io/gh/SQ-UI/ng-sq-ui)

## Docs

You will find a description of the public API for each component.
The components are grouped by modules. Any properties you can see through code inspection that are left out from this documentation are for internal use and you should not rely on them.

Any types of public interfaces and services are also included.

- [Home Page](https://sq-ui.github.io/ng-sq-ui)
- [Installation](https://sq-ui.github.io/ng-sq-ui/#/installation)
- [Form Elements](https://sq-ui.github.io/ng-sq-ui/#/form-elements-module)
- [Modal](https://sq-ui.github.io/ng-sq-ui/#/modal-module)
- [Interfaces](https://sq-ui.github.io/ng-sq-ui/#/interfaces)
- [Live examples](https://ng-sq-ui-examples.surge.sh)

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

ng-sq-ui does not come with a specific font. Including the default theme is also optional. Refer to our [Live examples page](https://ng-sq-ui-examples.surge.sh).

Need a grid? [We've got you covered](https://sq-ui.github.io/sq-grid/)!

## Dependencies

ng-sq-ui depends on:

font-awesome and immutable.js (both will be installed with ng-sq-ui)

## Try it out locally

```
git clone git@github.com:SQ-UI/ng-sq-ui.git
npm i
ng build ng-sq-ui
```

-- or --

```
git clone git@github.com:SQ-UI/ng-sq-ui.git
yarn install
ng build ng-sq-ui
```

## Support

- Use NG-SQ-UI in your daily work.
- **Star** it if you like.
- [Join slack chat](https://join.slack.com/t/ng-sq-ui/shared_invite/enQtNDE2NDQxMjA4NzU4LTNiOWZjMGU5Mzc1N2NiMjRkMjJlM2U5OWY4ZGUyOWNjNjFmY2EyMzQ0Zjg0Mjk5OTE4MGUyMjQwMmU3NDI2Yzg) to help solve problems.
- Follow us on [twitter](https://twitter.com/squi97817882) to get latest updates.

## Contribution

Want to file a bug, contribute some code, or improve documentation? Read up on our [Contributing Guide](CONTRIBUTING.md) before making a pull request.

Thank you to all <a href="https://github.com/sq-ui/ng-sq-ui/graphs/contributors">contributers</a>!

| [<img src="https://avatars2.githubusercontent.com/u/41083417?s=60&v=4" width="50px;"/><br /><sub><b>Plamena Radneva</b></sub>](https://github.com/ardentia)<br />[💻](https://github.com/SQ-UI/ng-sq-ui/commits?author=ardentia 'Code') [📖](https://github.com/SQ-UI/ng-sq-ui/commits?author=ardentia 'Documentation') [⚠️](https://github.com/SQ-UI/ng-sq-ui/commits?author=ardentia 'Tests') | [<img src="https://avatars0.githubusercontent.com/u/797921?s=60&v=4" width="50px;"/><br /><sub><b>Samuil Gospodinov</b></sub>](https://github.com/samuil4)<br />[💻](https://github.com/SQ-UI/ng-sq-ui/commits?author=samuil4 'Code') [📖](https://github.com/SQ-UI/ng-sq-ui/commits?author=samuil4 'Documentation') [⚠️](https://github.com/SQ-UI/ng-sq-ui/commits?author=samuil4 'Tests') |
| :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |


## LICENSE

- [MIT](http://opensource.org/licenses/MIT)
- Feel free to use and contribute to the development.
