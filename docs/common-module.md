# Common

Shared types, helpers, and standalone utilities from `@sq-ui/ng-sq-common` (also re-exported by `@sq-ui/ng-sq-ui`).

There is **no** `NgSqCommonModule` — import symbols directly.

!> Package: [`@sq-ui/ng-sq-common`](https://www.npmjs.com/package/@sq-ui/ng-sq-common)

[sq-datetime-picker-example](https://stackblitz.com/edit/ng-sq-ui-common?ctl=1&embed=1&view=preview ':include :type=iframe height=500px width=100%')

## SqInputCore

Abstract host for shared form-control inputs (`name`, `controlId`, `controlLabel`, `controlPlaceholder`, `required`, `pattern`, `disabled`, `readonly`, `hidden`, `invalid`, `errors`, `disabledReasons`, `touch`).

Form controls compose this with Signal Forms (`FormValueControl` / `FormCheckboxControl`) by adding their own `value` or `checked` model. It is **not** a ControlValueAccessor base.

## RadioGroupRegistry

Signal-based registry used by `sq-radiobutton` so radios sharing a `name` stay in sync.

```typescript
import { RadioGroupRegistry } from '@sq-ui/ng-sq-common';

// providedIn: 'root'
registry.group(name);           // WritableSignal<unknown>
registry.select(name, value);   // set group value
```

## Components

### sq-paginator

Standalone paginator. Produces a view slice of `items` without mutating the source.

```typescript
import { PaginatorComponent } from '@sq-ui/ng-sq-common';
```

- **`items`**: `any[]`
- **`itemsPerPage`**: `number` — defaults `10`
- **`currentPage`**: `number` — defaults `1`
- **`lastPage`**: `number | undefined`
- **`maxDisplayedPages`**: `number` — defaults `3`
- **`paginatedCollection`**: `model<any[]>` — current page slice (two-way)
- **`pageChange`**: output `{ page: number, firstItemIndex: number }`

## Directives

### OutsideClickListenerDirective

```html
<div
  sqOutsideClickListener
  [listenForOutsideClick]="listenForOutsideClick()"
  (clickOutside)="onClickOutsideComponent()">
</div>
```

### ScrolledToBottomListenerDirective

Also exported for scroll-to-bottom detection.

## Services

### OSDetectorService

```typescript
class OSDetectorService {
  static getDeviceOS(): DeviceOS;
}
```

## Interfaces

### LabelValuePair

```typescript
interface LabelValuePair {
  label: string;
  value: any;
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

```typescript
interface PaginatorConfig {
  itemsPerPage?: number;
  currentPage?: number;
  lastPage?: number;
  maxDisplayedPages?: number;
}
```

### CustomEventDetails

```typescript
interface CustomEventDetails {
  details: any;
}
```

## Enums

### DeviceOS

```typescript
enum DeviceOS {
  Android = 0,
  iOS,
  Desktop,
}
```
