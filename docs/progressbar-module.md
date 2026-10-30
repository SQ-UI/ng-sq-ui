# ProgressBarModule

> Applies to **3.x** (Angular 22).

## sq-progress-bar

[sq-progress-bar-example](https://stackblitz.com/edit/ng-sq-ui-progress-bar?ctl=1&embed=1&view=preview ':include :type=iframe')

`sq-progress-bar` is a small, styleable loader.

!> Available in [@sq-ui/ng-sq-ui](https://www.npmjs.com/package/@sq-ui/ng-sq-ui) and [@sq-ui/ng-progress-bar](https://www.npmjs.com/package/@sq-ui/ng-progress-bar)

```html
<sq-progress-bar size="small" [loaded]="progressBarLoaded()"></sq-progress-bar>
<sq-progress-bar size="large" [infinite]="true"></sq-progress-bar>
```

```typescript
export class ExampleComponent {
  readonly progressBarLoaded = signal(20);

  constructor() {
    interval(1000)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.progressBarLoaded.update(v => (v + 20 > 100 ? 0 : v + 20)));
  }
}
```

### Component properties

- **`size`** (`input<Size>`): `'small' | 'medium' | 'large'`. Defaults to `'medium'`.
- **`loaded`** (`input<number>`): the loaded value in %; drives the width of the filled line.
- **`infinite`** (`input<boolean>`): switches to the cyclic animation and ignores `loaded`. Defaults to
  `false`.
- **`backgroundColor`** (`input<string>`): any CSS color for the track. Defaults to the theme color.
- **`fillColor`** (`input<string>`): any CSS color for the filled line. Defaults to the theme color.

```html
<sq-progress-bar
  size="medium"
  [loaded]="75"
  backgroundColor="#f2f2f2"
  fillColor="#4f6d8c">
</sq-progress-bar>
```

Both colors are applied as inline styles, so they override the theme without touching the stylesheet.
