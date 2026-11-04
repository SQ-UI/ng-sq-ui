# DatatableModule

> Applies to **3.x** (Angular 22).

A small data table: it derives its columns from the first item, paginates through `sq-paginator`,
sorts the collection before pagination, and lets you append your own header/body templates.

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

- **`size`** (`input<Size>`): `'small' | 'medium' | 'large'`, default `'medium'`. Desktop header and data rows have minimum heights of 36px, 40px and 44px; wrapped content may grow. The existing mobile card layout remains content-driven.
- **`emptyText`** (`input<string>`): optional empty message, default `''`. Renders a status message when `items` is empty and no custom body template is supplied. Existing custom bodies retain control of their empty presentation.
- **`items`** (`input<TItem[]>`): the rows. Defaults to `[]`. Columns are derived from `items[0]`.
- **`sortByColumns`** (`input<string[]>`): the column names the user may sort by. Defaults to `[]`
  (nothing is sortable unless `sortByAllColumns` is `true`).
- **`sortByAllColumns`** (`input<boolean>`): makes every column sortable. Defaults to `false`.
- **`paginatorConfig`** (`input<PaginatorConfig>`): forwarded to the inner `sq-paginator`.
  Optional `paginatorConfig.size` overrides the paginator size; otherwise it follows the table size.
- **`columnNames`** (`signal<DatatableColumn[]>`): the computed column list (read-only).
- **`paginatedCollection`** (`signal<TItem[]>`): the rows of the current page (read-only).
- **`onSortClicked`** (`output<SortItem>`): fires when a sortable column header is clicked.
- **`pageChange`** (`output<PageChangeEvent>`): re-emits the paginator's `pageChange`.

Sorting applies to the full supplied collection before pagination and leaves the caller's array unchanged. Numbers are compared numerically (`10` sorts after `9`),
everything else through `String.prototype.localeCompare`, so a column does not need a value type hint.

### Custom header and body

Import `DatatableHeaderDirective` and `DatatableBodyDirective` alongside `DatatableComponent` in your standalone component. The templates are rendered once after the automatic header/body rows, with no per-row context. To manage the whole table yourself, leave `items` empty and iterate over your own data in the body template:

```html
<sq-datatable>
  <ng-template sq-datatable-header>
    <tr>
      <th>ID</th><th>Title</th>
    </tr>
  </ng-template>

  <ng-template sq-datatable-body>
    @for (row of items(); track row.id) {
      <tr>
        <td data-heading="ID">{{ row.id }}</td>
        <td data-heading="Title">{{ row.title }}</td>
      </tr>
    }
  </ng-template>
</sq-datatable>
```

The caller owns sorting and pagination for these custom rows. `data-heading` supplies each cell's label in the mobile card layout. The optional `emptyText` message is suppressed whenever a custom body is present. See the working custom-body example in `/#/preview`.

## sq-datatable-row

Selector `tr[sq-datatable-row]` — the row used internally by `sq-datatable`. Renders one cell per key of
`rowItem` (values are stringified, `null`/`undefined` render as empty).

```html
<tr sq-datatable-row [rowItem]="item"></tr>
```

- **`rowItem`** (`input<unknown>`): the row object. Any object works — the keys come from the object.
- **`columns`** (`input<readonly string[] | undefined>`): explicit column order. When omitted, the row's own keys are used; the containing datatable supplies its header keys so rows stay aligned.
- **`width`** (`input<string>`): deprecated compatibility input with no effect. It no longer hides generated cells.

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
