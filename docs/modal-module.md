# ModalModule

## sq-modal

![SQ-Modal](_media/sq-modal.gif)

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

### Component methods:

- **close():** `void` - Closes the modal.
