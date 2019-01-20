# Known issues

## Documentation

> When you have disabled 3-rd party cookies the live examples will not work.
[Reason](https://github.com/stackblitz/core/issues/162)

## Styles

> I don't see the styles in my project.

?> Probably you have missed to add the `sq` class to a parent element.

?> Or you have missed to add our css tot he project

```json
"styles": [
  "src/styles.css",
  "./node_modules/@sq-ui/ng-sq-ui/sq-ui-theme.scss",
  "./node_modules/font-awesome/scss/font-awesome.scss"
],
```
