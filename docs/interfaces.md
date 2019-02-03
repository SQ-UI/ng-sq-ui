# Interfaces

## @sq-ui/ng-sq-ui

> If you use this package all interfaces should be available to you

## @sq-ui/ng-sq-common

> Available interfaces in this package

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

## @sq-ui/ng-datetime-picker

> Available interfaces in this package

### TimepickerConfig

?> Used for configuring the datetime component.

```typescript
interface TimepickerConfig {
  hourStep?: number;
  minuteStep?: number;
  hours?: number;
  minutes?: number;
  isMeridiem?: boolean;
  isEditable?: boolean;
}
```

## @sq-ui/ng-datatable

### DatatableColumn

?> Used for building column data consumed by sq-datatable-column.

```typescript
interface DatatableColumn {
  name: string;
  canBeSortedAgainst: boolean;
}
```

### SortItem

?> Object emitted by sq-datatable-column when the sorting functionality has been triggered.

```typescript
interface SortItem {
  name: string;
  isSortedByAscending: boolean;
}
```
