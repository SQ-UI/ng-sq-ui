# Datatable

## sq-datatable

Standalone table built from an array of objects. Import from `@sq-ui/ng-datatable` or `@sq-ui/ng-sq-ui`.

[sq-form-components-example](https://stackblitz.com/edit/ng-sq-datatable?ctl=1&embed=1&view=preview ':include :type=iframe height=500px width=100%')

!> Package: [`@sq-ui/ng-datatable`](https://www.npmjs.com/package/@sq-ui/ng-datatable)

```typescript
import { DatatableComponent } from '@sq-ui/ng-datatable';

@Component({
  imports: [DatatableComponent],
  // …
})
export class Example {}
```

### Properties

- **`items`**: `any[]` — row objects (same shape)
- **`sortByAllColumns`**: `boolean` — defaults `false`
- **`sortByColumns`**: `string[]` — sortable property names
- **`paginatorConfig`**: `PaginatorConfig` — built-in paginator (when `items` is set)
- **`useCustomSort`**: `boolean` — when `true`, only emits `onSortClicked` (skips built-in sort)
- **`onSortClicked`**: output `SortItem`
- **`pageChange`**: output `{ page, firstItemIndex }` (and related page events)

### Default setup

```html
<sq-datatable
  [items]="datatableItems"
  [sortByColumns]="sortByColumns"
  [paginatorConfig]="paginatorConfig"
  (pageChange)="fetchToDoItems($event)">
</sq-datatable>
```

```typescript
paginatorConfig: PaginatorConfig = {
  itemsPerPage: 5,
  currentPage: 1,
  maxDisplayedPages: 2,
  lastPage: 8,
};
```

## Custom header / body projection

Use `sq-datatable-header` and `sq-datatable-body` for full control (no automatic pagination of projected rows).

```html
<sq-datatable>
  <ng-template sq-datatable-header>
    <tr>
      @for (col of userItemColumns; track col) {
        <th>{{ col }}</th>
      }
    </tr>
  </ng-template>

  <ng-template sq-datatable-body>
    @for (item of userItems; track item) {
      <tr>
        @for (prop of userItemColumns; track prop) {
          <td [attr.data-heading]="prop">{{ item[prop] }}</td>
        }
      </tr>
    }
  </ng-template>
</sq-datatable>
```

## sq-datatable-row / sq-datatable-column

Column headers and rows as components with sort wiring:

```html
<sq-datatable>
  <ng-template sq-datatable-header>
    <tr>
      @for (column of resourceItemColumns; track column.name) {
        <th
          sq-datatable-column
          [name]="column.name"
          [isSortable]="column.canBeSortedAgainst"
          (onSortClicked)="sortResourceItemsByColumn($event)">
        </th>
      }
    </tr>
  </ng-template>

  <ng-template sq-datatable-body>
    @for (rowItem of resourceItems; track rowItem) {
      <tr sq-datatable-row [rowItem]="rowItem" class="row"></tr>
    }
  </ng-template>
</sq-datatable>
```

## Interfaces

### DatatableColumn

```typescript
interface DatatableColumn {
  name: string;
  canBeSortedAgainst: boolean;
}
```

### SortItem

```typescript
interface SortItem {
  name: string;
  isSortedByAscending: boolean;
}
```
