# Modal

## sq-modal

Standalone modal with content projection. Import `ModalComponent` from `@sq-ui/ng-modal` or `@sq-ui/ng-sq-ui`.

[sq-form-components-example](https://stackblitz.com/edit/ng-sq-ui-modal?ctl=1&embed=1&view=preview ':include :type=iframe height=500px width=100%')

!> Package: [`@sq-ui/ng-modal`](https://www.npmjs.com/package/@sq-ui/ng-modal)

```typescript
import { Component, signal } from '@angular/core';
import { ModalComponent, ButtonComponent } from '@sq-ui/ng-sq-ui';

@Component({
  imports: [ModalComponent, ButtonComponent],
  template: `
    <sq-button (click)="showModal.set(!showModal())">Toggle modal</sq-button>

    <sq-modal [(show)]="showModal">
      <div sq-modal-title>
        <strong>Modal title</strong>
      </div>
      <div sq-modal-body>…</div>
      <div sq-modal-footer>…</div>
    </sq-modal>
  `,
})
export class Example {
  showModal = signal(false);
}
```

### Properties

- **`show`**: `model<boolean>` — two-way visibility. Defaults to `false`. Use `[(show)]`.
- **`customCssAnimation`**: `{ duration: number, entranceAnimation: string, exitAnimation: string }` — CSS animation config (duration in ms). Built-in fallbacks use `fadeInDown` / `fadeOutUp` when entrance/exit strings are empty.

!> Prefer `[(show)]`. You can also call `open()` / `close()` via a template reference.

### Methods

- **`close()`** / **`open()`** — set `show` to `false` / `true`.

```typescript
import { viewChild } from '@angular/core';
import { ModalComponent } from '@sq-ui/ng-modal';

readonly modal = viewChild.required<ModalComponent>('modal');

show(): void {
  this.modal().open();
}
```
