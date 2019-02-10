# DatatableModule

This module exports common interfaces, base classes, components and services utilized by other modules.

!> Available as standalone package [`@sq-ui/ng-sq-common`](https://www.npmjs.com/package/@sq-ui/ng-sq-common)

[sq-datetime-picker-example](https://stackblitz.com/edit/ng-sq-ui-common?ctl=1&embed=1&view=preview ':include :type=iframe height=500px width=100%')

## Components
### sq-paginator
#### Component properties:

This is a standalone component which creates a mutable view collection of objects. Its items are a specific portion of the original item collection based on the current page and how many items per page the component should show. The source item collection remains unaltered.

- **`@Input()` items:** `any[]` - A collection of objects. This collection remains unchanged by the paginator. To use the item collection produced by the component, refer to the `paginatedCollection` property.
- **`@Input()` itemsPerPage:** `number` - Defines how many items will be shown per page. Defaults to 10;
- **`@Input()` currentPage:** `number` - Defines which page to jump to when first loaded. Defaults to 1;
- **`@Input()` lastPage:** `number` - Defines the number of the last available page. Defaults to undefined;
- **`@Input()` maxDisplayedPages:** `number` - Defines how many page numbers the paginator will show when it attempts to "shorten" the view by using ellipsis.
- **`@Input()` paginatedCollection:** `any[]` - This is the item collection currently used in the view of the component. It contains only a specific portion of the `items` collection. For example, if `currentPage = 1` and `itemsPerPage = 10` then `paginatedCollection` will only contain the first 10 items from the `items` collection. The `items` collection remains unchanged.
- **`@Output()` paginatedCollectionChange:** `EventEmitter<any[]>` - An event emitter for the `paginatedCollection` changes.
- **`@Output()` pageChange:** `EventEmitter<{ page: number, firstItemIndex: number }>` - An event emitter fired on every page click.


## Directives
### OutsideClickListenerDirective

?> A directive which tracks clicks outside of an element.

```html
<div #sqExample
    sqOutsideClickListener
    [listenForOutsideClick]="listenForOutsideClick"
    (clickOutside)="onClickOutsideComponent()">
</div>
```

```typescript
import { AfterViewInit } from '@angular/core';

export class ExampleComponent implements AfterViewInit {

    listenForOutsideClick: boolean = false;
    
    ngAfterViewInit() {
        listenForOutsideClick = true;
    }

    onClickOutsideComponent() {
        this.listenForOutsideClick = false;
        // your code here
    }
}
```


## Services 
### OSDetectorService

- **getDeviceOS():** [`DeviceOS`](enums.md??id=deviceos).

```typescript
class OSDetectorService {
  static getDeviceOS(): DeviceOS
}
```

### CustomEventBroadcasterService

- **subscribeFor(`eventName`, `callback`):** `Subscription`.
- **broadcastEvent(`eventName`, [`eventDetails`](interfaces.md?id=customeventdetails)):** `void`.

```typescript
 class CustomEventBroadcasterService {
  subscribeFor(eventName: string,
               callback: (eventDetails?: CustomEventDetails) => void): Subscription {}
  broadcastEvent(eventName: string, eventDetails?: CustomEventDetails): void {}
}
```

## Interfaces
### CustomEventDetails

?> Used by CustomEventBroadcasterService

```typescript
interface CustomEventDetails {
  details: any;
}
```

### LabelValuePair

?> Used for the options in the dropdown-like components.

```typescript
interface LabelValuePair {
  label: string;
  value: any;
}
```

### Size

?> Used by the ProgressBarSize interface.

```typescript
type Size = 'small' | 'medium' | 'large';
```

### ProgressBarSize

?> Used for specifying the visual size of the ProgressBar component.

```typescript
interface ProgressBarSize {
  size: Size;
}
```

### PaginatorConfig

?> Used for configuring the paginator component.

```typescript
interface PaginatorConfig {
  itemsPerPage?: number;
  currentPage?: number;
  lastPage?: number;
  maxDisplayedPages?: number;
}
```

## Enums
### DeviceOS

?> Used as a return value in [OSDetectorService](common-module.md?id=osdetectorservice)

```typescript
enum DeviceOS {
  Android = 0,
  iOS,
  Desktop
}
```
