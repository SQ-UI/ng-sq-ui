# DatatableModule

## sq-datatable

[sq-form-components-example](https://stackblitz.com/edit/ng-sq-ui-modal?ctl=1&embed=1&view=preview ':include :type=iframe height=500px width=100%')


sq-datatable is a highly customizable component which builds a table based on array of objects.

!> Available also as standalone package [`@sq-ui/ng-datatable`](https://www.npmjs.com/package/@sq-ui/ng-datatable)

### Component properties:

- **`@Input()` items:** `any[]` - A collection of objects. All objects must conform to the same entity interface;
- **`@Input()` sortByAllColumns:** `boolean` - Enables sorting by all columns. Defaults to `false`;
- **`@Input()` paginatorConfig:** `PaginatorConfig` - Configuration for the built-in paginator. The paginator works only if `items` is defined;
- **`@Input()` sortByColumns:** `string[]` - Enable sorting for specific columns. Column names must exist as object properties within the `items` collection;
- **`@Output()` onSortClicked:** `EventEmitter<SortItem>` - An event emitter activated when sorting has been triggered on a column;
- **`@Output()` pageChange:** `EventEmitter<{ page: number, firstItemIndex: number }>` - An event emitter triggered on page click.


### Default setup:
- A collection of todo items is directly passed to the [items] prop.
- A [paginatorConfig] object is passed.
- [sortByColumns] is set to allow sorting only by the "id" and "title" columns.
- A handler is bound to (pageChange) to load new items on page click.
              
In [datatable-docs.component.html](https://github.com/SQ-UI/ng-sq-ui/blob/master/src/app/datatable/datatable-docs/datatable-docs.component.html#L35)

```html
<sq-datatable [items]="datatableItems"
              [sortByColumns]="sortByColumns"
              [paginatorConfig]="paginatorConfig"
              (pageChange)="fetchToDoItems($event)">
</sq-datatable>
```

In [datatable-docs.component.ts](https://github.com/SQ-UI/ng-sq-ui/blob/master/src/app/datatable/datatable-docs/datatable-docs.component.ts#L71)

```typescript
//...
paginatorConfig: PaginatorConfig = {
  itemsPerPage: 5,
  currentPage: 1,
  maxDisplayedPages: 2,
  lastPage: 8
};

//...
ngOnInit() {
  this.fetchToDoItems();
  //...
}

fetchToDoItems() {
  // this can be an HTTP request using observable
  fetch('https://jsonplaceholder.typicode.com/todos')
    .then(response => response.json())
    .then(json => {
      const next = json.slice(0, 20);
      this.datatableItems = [...this.datatableItems, ...next];
    });
}
//...
```

## sq-datatable-body, sq-datatable-header
- <b>sq-datatable</b> is used as a container.
- This example does not use any of the default properties of the datatable.
- No automatic paganation available, since the presentation depends entirely on the author.
- The <b>sq-datatable-header</b> and <b>sq-datatable-body</b> directives are used for content projection, respectively for the datatable columns and rows.

In [datatable-docs.component.html](https://github.com/SQ-UI/ng-sq-ui/blob/master/src/app/datatable/datatable-docs/datatable-docs.component.html#L68)
```html
<sq-datatable>
  <ng-template sq-datatable-header>
    <tr>
      <th *ngFor="let col of userItemColumns">
        {{col}}
      </th>
    </tr>
  </ng-template>

  <ng-template sq-datatable-body>
    <tr *ngFor="let item of userItems">
      <td *ngFor="let prop of userItemColumns"
          [attr.data-heading]="prop">
        {{item[prop]}}
      </td>
    </tr>
  </ng-template>
</sq-datatable>
```

In [datatable-docs.component.ts](https://github.com/SQ-UI/ng-sq-ui/blob/master/src/app/datatable/datatable-docs/datatable-docs.component.ts#L80)

```typescript
//...
userItems = [];
userItemColumns = [];

//...
ngOnInit() {
  //...
  this.fetchUserItems();
  //...
}

fetchUserItems() {
  // this can be an HTTP request using observable
  fetch('https://reqres.in/api/users')
    .then(response => response.json())
    .then(json => {
      const users = json.data.slice(0, 20);
      this.userItemColumns = Object.keys(users[0]);
      this.userItems = users;
    });
  }
//...
```


## sq-datatable-row, sq-datatable-column
- <b>sq-datatable</b> is used as a container.
- This example does not use any of the default properties of the datatable.
- No automatic paganation available, since the presentation depends entirely on the author.
- The <b>sq-datatable-header</b> and <b>sq-datatable-body</b> directives are used for content projection, respectively for the datatable columns and rows.
- Each column (th) is represented by a <b>sq-datatable-column</b> component which exposes custom properties to bind name, event handlers and information if the row data can be sorted by that column.
- Each row (tr) is represented by a <b>sq-datatable-row</b> component which exposes custom properties to bind row data.

In [datatable-docs.component.html](https://github.com/SQ-UI/ng-sq-ui/blob/master/src/app/datatable/datatable-docs/datatable-docs.component.html#L123)
```html
<sq-datatable>
  <ng-template sq-datatable-header>
    <tr>
      <th sq-datatable-column
          *ngFor="let column of resourceItemColumns"
          [name]="column.name"
          [isSortable]="column.canBeSortedAgainst"
          (onSortClicked)="sortResourceItemsByColumn($event)">
      </th>
    </tr>
  </ng-template>

  <ng-template sq-datatable-body>
    <tr sq-datatable-row
        *ngFor="let rowItem of resourceItems"
        [rowItem]="rowItem"
        class="row">
    </tr>
  </ng-template>
</sq-datatable>
```

In [datatable-docs.component.ts](https://github.com/SQ-UI/ng-sq-ui/blob/master/src/app/datatable/datatable-docs/datatable-docs.component.ts#L80)

```typescript
//...
resourceItems = [];
resourceItemColumns: DatatableColumn[] = [];

//...
ngOnInit() {
  //...
  this.fetchResourcesItems();
}

 fetchResourcesItems() {
  fetch('https://reqres.in/api/unknown')
    .then(response => response.json())
    .then(json => {
      const resources = json.data.slice(0, 20);
      this.resourceItemColumns = Object.keys(resources[0])
        .map((columnName) => {
          return {
            name: columnName,
            canBeSortedAgainst: columnName === 'id'
          };
        });

      this.resourceItems = resources;
    });
}
//...
```
