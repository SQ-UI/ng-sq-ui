# ModalModule

## sq-modal

[sq-form-components-example](https://stackblitz.com/edit/ng-sq-ui-modal?ctl=1&embed=1&view=preview ':include :type=iframe height=500px width=100%')


sq-modal is a generic modal window with content projection.

In [app.component.html](https://github.com/SQ-UI/ng-sq-ui/blob/master/src/app/app.component.html#L117)

```html
<sq-button (click)="showModal=!showModal">Toggle modal</sq-button>

<sq-modal [(show)]="showModal">
  <div sq-modal-title>
    <strong>Modal title</strong>
  </div>

  <div sq-modal-body>
    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Commodi harum natus quidem recusandae voluptatibus. Animi architecto
    dolor est et in laborum neque, nisi non nulla, sunt totam velit vero voluptatibus.
  </div>

  <div sq-modal-footer>
    <button type="button">
      <span class="inner">Yes</span>
    </button>

    <button type="button">
      <span class="inner">No</span>
    </button>
  </div>
</sq-modal>
```

In [app.component.ts](https://github.com/SQ-UI/ng-sq-ui/blob/master/src/app/app.component.ts#L12)

```typescript
//...
export class AppComponent {
  //...
  showModal = false;
  //...
}
```

### Component properties:

- **`@Input()` customCssAnimation:** `{ duration: number, entranceAnimation: string, exitAnimation: string }` - A configurational object which determines the CSS animation the modal uses. The duration of the animation is in milliseconds. The default values for each property are:
  `{ duration: 1000, entranceAnimation: 'flipInX', exitAnimation: flipOutX }`.

- **`@Input()` show:** `boolean` - Shows/hides the modal window. Defaults to `false`.

- **`@Output()` showChange:** `EventEmitter<boolean>` - Callback invoked whenever the modal is shown/hidden.

!> When you dont provide `[(show)]` property binding, you will have to use the template reference methods `open` and `close`.

### Component methods:

- **close():** `void` - Closes the modal.
- **open():** `void` - Openss the modal.

?> You can access component methods via template reference.

```typescript
import { ModalComponent } from '@sq-ui/ng-sq-ui';

@Component({
  ...
})
export class AppComponent {
  @ViewChild('modal')
  modalInstance: ModalComponent;
  
  show(): void {
    this.modalInstance.open();
  }

  hide(): void {
    this.modalInstance.close();
  }
}

```
