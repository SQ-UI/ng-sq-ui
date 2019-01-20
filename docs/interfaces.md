# Interfaces

## @sq-ui/ng-sq-ui

> If you use this package all interfaces should be available to you

## @sq-ui/ng-sq-common

> Available interfaces in this package

### LabelValuePair

```typescript
interface LabelValuePair {
  label: string;
  value: any;
}
```

### Size
```typescript
type Size = 'small' | 'medium' | 'large';
```

### ProgressBarSize
```typescript
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

## @sq-ui/ng-datetime-picker

> Available interfaces in this package

### TimepickerConfig

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