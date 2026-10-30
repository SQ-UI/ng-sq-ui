# ModalModule

> Applies to **3.x** (Angular 22).

## sq-modal

[sq-form-components-example](https://stackblitz.com/edit/ng-sq-ui-modal?ctl=1&embed=1&view=preview ':include :type=iframe height=500px width=100%')

`sq-modal` is a generic modal window driven by content projection: three slots (`sq-modal-title`,
`sq-modal-body`, `sq-modal-footer`) and a two-way `show` model.

!> Available also as stand alone package [`@sq-ui/ng-modal`](https://www.npmjs.com/package/@sq-ui/ng-modal)

```html
<sq-button (click)="showModal.set(!showModal())">Toggle modal</sq-button>

<sq-modal [(show)]="showModal">
  <div sq-modal-title>
    <strong>Modal title</strong>
  </div>

  <div sq-modal-body>
    Lorem ipsum dolor sit amet, consectetur adipisicing elit.
  </div>

  <div sq-modal-footer>
    <sq-button (click)="showModal.set(false)">Close</sq-button>
  </div>
</sq-modal>
```

```typescript
import { signal } from '@angular/core';
import { ModalComponent } from '@sq-ui/ng-modal';

export class ExampleComponent {
  readonly showModal = signal(false);
}
```

Clicking the overlay outside the window closes the modal (`onClickOutsideComponent()`), as does the
`×` button in the header.

### Component properties

- **`show`** (`model<boolean>`): shows/hides the window. Defaults to `false`. Bind it with `[(show)]`.

- **`customCssAnimation`** (`input<{ duration: number; entranceAnimation: string; exitAnimation: string }>`):
  the CSS animation used to show and hide the window; `duration` is in milliseconds. Empty values fall
  back to `500`, `fadeInDown` and `fadeOutUp`:

  ```typescript
  readonly modalAnimation = {
    duration: 1000,
    entranceAnimation: 'flipInX',
    exitAnimation: 'flipOutX',
  };
  ```

  ```html
  <sq-modal [(show)]="showModal" [customCssAnimation]="modalAnimation">…</sq-modal>
  ```

### Component methods

- **`open()`**: `void` — shows the modal (same as `show.set(true)`).
- **`close()`**: `void` — hides the modal (same as `show.set(false)`).
- **`onClickOutsideComponent()`**: `void` — closes the modal when the overlay is clicked.

If you prefer imperative control, grab the instance with a template reference or `viewChild`:

```typescript
readonly modal = viewChild.required<ModalComponent>('modal');

show(): void {
  this.modal().open();
}

hide(): void {
  this.modal().close();
}
```

```html
<sq-modal #modal [(show)]="showModal">…</sq-modal>
```
