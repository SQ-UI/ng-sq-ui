# CommonModule

> Applies to **3.x** (Angular 22).

This package exports the shared pieces the other libraries build on: the paginator, the standalone
directives, the event bus, the service helpers and the types every control implements.

!> Available as standalone package [`@sq-ui/ng-sq-common`](https://www.npmjs.com/package/@sq-ui/ng-sq-common)

[sq-datetime-picker-example](https://stackblitz.com/edit/ng-sq-ui-common?ctl=1&embed=1&view=preview ':include :type=iframe height=500px width=100%')

## Components

### sq-paginator

A standalone component that produces a mutable view of a slice of the original collection. The source
collection is never mutated; the current slice is published through the `paginatedCollection` model.

The component is generic over the item type, so the slice keeps the type of the collection you pass in:

```html
<sq-paginator
  [items]="items()"
  [itemsPerPage]="5"
  [currentPage]="1"
  [(paginatedCollection)]="page">
</sq-paginator>
```

```typescript
readonly items = signal<User[]>(users);
readonly page = signal<User[]>([]);   // inferred: PaginatorComponent<User>
```

#### Component properties

- **`items`** (`input<TItem[] | undefined>`): the collection to paginate. Defaults to `[]`.
- **`itemsPerPage`** (`input<number | undefined>`): how many items a page holds. Defaults to `10`.
- **`currentPage`** (`input<number | undefined>`): the page selected on first render. Defaults to `1`.
- **`lastPage`** (`input<number | undefined>`): forces the number of the last page. Defaults to
  `undefined` (derived from `items.length / itemsPerPage`).
- **`maxDisplayedPages`** (`input<number | undefined>`): how many page numbers are shown before the
  paginator starts collapsing them with ellipsis. Defaults to `3`.
- **`paginatedCollection`** (`model<TItem[]>`): two-way model holding the current slice.
- **`pageChange`** (`output<PageChangeEvent>`): fired on every page click.

#### PageChangeEvent

```typescript
interface PageChangeEvent {
  page: number;
  firstItemIndex: number;
}
```

`firstItemIndex` is the index of the first visible item inside the original `items` collection — handy
for server-side pagination.

## Directives

### OutsideClickListenerDirective

Tracks clicks outside of an element. The listener stays inert until `listenForOutsideClick` is `true`,
so you decide when it is armed.

```html
<div
  sqOutsideClickListener
  [listenForOutsideClick]="listenForOutsideClick()"
  (clickOutside)="onClickOutsideComponent()">
</div>
```

```typescript
export class ExampleComponent {
  readonly listenForOutsideClick = signal(true);

  onClickOutsideComponent() {
    this.listenForOutsideClick.set(false);
    // your code here
  }
}
```

### ScrolledToBottomListenerDirective

Emits when the host element is scrolled to its bottom — the usual "load more" trigger.

```html
<ul class="list" sqScrolledToBottomListener (scrolledToBottom)="loadNextPage()">…</ul>
```

## Services

### OSDetectorService

- **`getDeviceOS()`**: `DeviceOS` — `Android` | `iOS` | `Desktop`.

```typescript
class OSDetectorService {
  static getDeviceOS(): DeviceOS;
}
```

### CustomEventBroadcasterService

A push-based, named-event bus (backed by an RxJS `Subject`). It is what keeps one `sq-radiobutton`
selected per group, and it is available for your own cross-component events. Both methods are generic
over the payload, so subscribers do not need casts:

```typescript
interface MyEventDetails {
  id: number;
}

class CustomEventBroadcasterService {
  subscribeFor<TDetails = unknown>(
    eventName: string,
    callback: (eventDetails?: CustomEventDetails<TDetails>) => void,
  ): Subscription;

  broadcastEvent<TDetails = unknown>(eventName: string, eventDetails?: CustomEventDetails<TDetails>): void;
}
```

```typescript
inject(CustomEventBroadcasterService).subscribeFor<MyEventDetails>('my:event', (eventDetails) => {
  console.log(eventDetails?.details.id);
});
```

## Interfaces

### LabelValuePair

The `{ label, value }` pair used by the dropdown-like controls. Generic over the payload; the default
`unknown` keeps it assignable from any list without giving up the payload type where you know it.

```typescript
interface LabelValuePair<TValue = unknown> {
  label: string;
  value: TValue;
}
```

### CustomEventDetails

```typescript
interface CustomEventDetails<TDetails = unknown> {
  details: TDetails;
}
```

### Size / ProgressBarSize

```typescript
type Size = 'small' | 'medium' | 'large';

interface ProgressBarSize {
  size: Size;
}
```

### PaginatorConfig

Used by `sq-datatable` to configure its inner paginator.

```typescript
interface PaginatorConfig {
  itemsPerPage?: number;
  currentPage?: number;
  lastPage?: number;
  maxDisplayedPages?: number;
}
```

## The form field contract

Every form control (`sq-input`, `sq-textarea`, `sq-checkbox`, `sq-radiobutton`, `sq-dropdown`,
`sq-tags-input`, `sq-typeahead`, `sq-datetime-picker`, `sq-time-picker`) declares the same inputs and
implements the same two interfaces. That is what makes `[formField]` work without adapter code, and it
is enforced at compile time.

```typescript
interface SqFormFieldSignals {
  readonly name: InputSignal<string>;              // generated: sq-form-control-1, -2, …
  readonly controlId: InputSignal<string>;
  readonly controlLabel: InputSignal<string>;
  readonly controlPlaceholder: InputSignal<string>;
  readonly required: InputSignal<boolean>;
  readonly pattern: InputSignal<readonly RegExp[]>;
  readonly disabled: InputSignal<boolean>;
  readonly touch: OutputEmitterRef<void>;          // the user left the control
}
```

| Export | Purpose |
|---|---|
| `SqFormFieldSignals` | The signal-input surface above |
| `SqFormValueControl<TValue>` | Alias of Signal Forms' `FormValueControl<TValue>` (a `value` model) |
| `SqFormCheckboxControl` | Alias of `FormCheckboxControl` (a `checked` model instead of `value`) |
| `SqFormUiControl<TValue>` | Alias of `FormUiControl<TValue>` (full field state) |
| `FormFieldConfig` | Plain-object shape of the contract (used by `FORM_FIELD_DEFAULTS`) |
| `FORM_FIELD_DEFAULTS` | Default values: `''`, `false`, a frozen `[]` for `pattern`, … |
| `generateFormFieldId()` | Monotonic id generator (`sq-form-control-<n>`) |
| `toPatternAttribute()` | Serialises `readonly RegExp[]` into the native `pattern` attribute |

`pattern` is `readonly RegExp[]` (not a string) so the same value feeds `[formField]` and the native
`pattern` attribute:

```html
<sq-input controlLabel="Digits only" [pattern]="[/^\d+$/]"></sq-input>
```

## Enums

### DeviceOS

Returned by `OSDetectorService.getDeviceOS()`.

```typescript
enum DeviceOS {
  Android = 0,
  iOS,
  Desktop,
}
```

## Deprecated (next major will remove them)

`InputCoreComponent` and `ControlValueAccessorEnabler` are kept so 2.x code still compiles. They are
the old `ControlValueAccessor` base classes; new code should use the signal-based contract above.
