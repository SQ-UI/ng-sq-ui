# Known issues

> **Note (3.x)** - this page documents the NgModule-based 2.x API. In 3.x every component is
> standalone and is bound with `[(value)]` or with Signal Forms (`[formField]`). See the
> *Compatibility matrix* and *Migrating 2.x -> 3.x* sections of the repository README.

## Documentation

?> If you have blocked 3rd party cookies, the live examples will not work.
[Reason](https://github.com/stackblitz/core/issues/162)

## Styles

> I don't see the default styles in my project.

Two possible reasons:
- You have not added the `sq` class to a parent element.
- You have not included the ng-sq-ui theme scss files in `angular.json`:

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
