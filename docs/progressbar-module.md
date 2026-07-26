# Progress Bar

## sq-progress-bar

Standalone progress / loader. Import `ProgressBarComponent` from `@sq-ui/ng-progress-bar` or `@sq-ui/ng-sq-ui`.

[sq-progress-bar-example](https://stackblitz.com/edit/ng-sq-ui-progress-bar?ctl=1&embed=1&view=preview ':include :type=iframe')

!> Available via [@sq-ui/ng-sq-ui](https://www.npmjs.com/package/@sq-ui/ng-sq-ui) and [@sq-ui/ng-progress-bar](https://www.npmjs.com/package/@sq-ui/ng-progress-bar)

```typescript
import { Component, signal } from '@angular/core';
import { ProgressBarComponent } from '@sq-ui/ng-progress-bar';

@Component({
  imports: [ProgressBarComponent],
  template: `
    <sq-progress-bar size="small" [loaded]="progressBarLoaded()"></sq-progress-bar>
  `,
})
export class Example {
  progressBarLoaded = signal(0);
}
```

### Properties

- **`size`**: `'small' | 'medium' | 'large'` — defaults to `'medium'`
- **`loaded`**: `number` — progress in %
- **`infinite`**: `boolean` — cyclic animation; ignores `loaded` when `true`. Defaults `false`
- **`backgroundColor` / `fillColor`**: optional `string` color overrides
