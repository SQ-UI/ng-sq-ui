# NG-SQ-UI

> Simple Quality UI kit for Angular

> build by developers for developers!

## Docs

You will find a description of the public API for each component.
The components are grouped by modules. Any properties you can see through code inspection that are left out from this documentation are for internal use and you should not rely on them.

Any types of public interfaces and services are also included.

- [Home Page](https://sq-ui.github.io/ng-sq-ui)
- [Form Elements](https://sq-ui.github.io/ng-sq-ui/#/form-elements-module)
- [Modal](https://sq-ui.github.io/ng-sq-ui/#/modal-module)
- [Interfaces](https://sq-ui.github.io/ng-sq-ui/#/interfaces)
- [Live examples](https://ng-sq-ui-examples.surge.sh)

## Installation

```
npm i ng-sq-ui --save
```

-- or --

```
yarn add ng-sq-ui
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

## Dependencies

ng-sq-ui depends on font-awesome and immutable.js

## Support

- Use NG-SQ-UI in your daily work.
- **Star** it if you like.
- [Join slack chat](https://join.slack.com/t/ng-sq-ui/shared_invite/enQtNDE2NDQxMjA4NzU4LTNiOWZjMGU5Mzc1N2NiMjRkMjJlM2U5OWY4ZGUyOWNjNjFmY2EyMzQ0Zjg0Mjk5OTE4MGUyMjQwMmU3NDI2Yzg) to help solve problems.

