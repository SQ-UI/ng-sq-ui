# DatatableModule

> Applies to **3.x** (Angular 22).

A small data table: it derives its columns from the first item, paginates through `sq-paginator`,
sorts in place, and lets you replace the header/body with your own templates.

!> Available as standalone package [`@sq-ui/ng-datatable`](https://www.npmjs.com/package/@sq-ui/ng-datatable) — it depends on `@sq-ui/ng-sq-common`.

[sq-datatable-example](https://stackblitz.com/edit/ng-sq-ui-datatable?ctl=1&embed=1&view=preview ':include :type=iframe height=500px width=100%')

## sq-datatable

The component is generic over the row type, so `items`, `paginatedCollection` and `pageChange` keep the
type of the collection you pass in:

```html
<sq-datatable
  [items]="items()"
  [paginatorConfig]="paginatorConfig"
  [sortByColumns]="['id', 'title']"
  (pageChange)="loadNextPage($event)">
</sq-datatable>
```

```typescript
import type { PageChangeEvent, PaginatorConfig } from '@sq-ui/ng-sq-common';

interface ToDoItem {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

readonly items = signal<ToDoItem[]>([]);
readonly paginatorConfig: PaginatorConfig = { itemsPerPage: 5, currentPage: 1, maxDisplayedPages: 2 };

loadNextPage($event: PageChangeEvent) {
  // $event.firstItemIndex is the index of the first visible row in `items`
}
```

### Component properties

- **`items`** (`input<TItem[]>`): the rows. Defaults to `[]`. Columns are derived from `items[0]`.
- **`sortByColumns`** (`input<string[]>`): the column names the user may sort by. Defaults to `[]`
  (nothing is sortable unless `sortByAllColumns` is `true`).
- **`sortByAllColumns`** (`input<boolean>`): makes every column sortable. Defaults to `false`.
- **`paginatorConfig`** (`input<PaginatorConfig>`): forwarded to the inner `sq-paginator`.
- **`columnNames`** (`signal<DatatableColumn[]>`): the computed column list (read-only).
- **`paginatedCollection`** (`signal<TItem[]>`): the rows of the current page (read-only).
- **`onSortClicked`** (`output<SortItem>`): fires when a sortable column header is clicked.
- **`pageChange`** (`output<PageChangeEvent>`): re-emits the paginator's `pageChange`.

Sorting is done in place on the current page. Numbers are compared numerically (`10` sorts after `9`),
everything else through `String.prototype.localeCompare`, so a column does not need a value type hint.

### Custom header and body

Wrap your own markup with the two structural directives:

```html
<sq-datatable [items]="items()">
  <ng-template sq-datatable-header>
    <tr>
      <th colspan="4">Custom header row</th>
    </tr>
  </ng-template>

  <ng-template sq-datatable-body let-row="row">
    <tr>
      <td>{{ row.id }}</td>
      <td>{{ row.title }}</td>
    </tr>
  </ng-template>
</sq-datatable>
```

## sq-datatable-row

Selector `tr[sq-datatable-row]` — the row used internally by `sq-datatable`. Renders one cell per key of
`rowItem` (values are stringified, `null`/`undefined` render as empty).

```html
<tr sq-datatable-row [rowItem]="item"></tr>
```

- **`rowItem`** (`input<unknown>`): the row object. Any object works — the keys come from the object.
- **`width`** (`input<string>`): when set, the automatic key rendering is skipped (`columnKeys` is `[]`)
  and you render the cells yourself with `td[sq-datatable-column]` semantics.

## sq-datatable-column

Selector `th[sq-datatable-column]` — a sortable column header.

```html
<th sq-datatable-column name="id" [isSortable]="true" (onSortClicked)="sortByField($event)"></th>
```

- **`name`** (`input<string>`): the column (property) name.
- **`isSortable`** (`input<boolean>`): shows the sort affordance and emits on click. Defaults to `false`.
- **`onSortClicked`** (`output<SortItem>`): the new sort state; the component cycles
  `ascending → descending → unsorted` (`isSortedByAscending` is `true`, `false`, then `undefined`).

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
  isSortByAscending?: boolean;   // true = asc, false = desc, undefined = unsorted
}
```

> The `name` of a `SortItem` is the row property, not the header label: the table has no separate label
> configuration, so render custom headers with `[sq-datatable-header]` when you need nicer titles.
