import {
  Component, input, output, signal, computed,
  contentChild, TemplateRef,
  ChangeDetectionStrategy, ViewEncapsulation
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { DatatableHeaderDirective } from '../directives/datatable-header.directive';
import { DatatableBodyDirective } from '../directives/datatable-body.directive';
import { SortItem } from '../shared/interfaces/sort-item';
import { PaginatorConfig, PageChangeEvent, type Size } from '@sq-ui/ng-sq-common';
import { PaginatorComponent } from '@sq-ui/ng-sq-common';
import { DatatableColumn } from '../shared/interfaces/datatable-column';
import { DatatableRowComponent } from '../datatable-row/datatable-row.component';
import { DatatableColumnComponent } from '../datatable-column/datatable-column.component';

/**
 * Rows are indexed dynamically (the column names come from the data itself), so a row is read
 * through a record view. The public `items` input keeps the caller's row type.
 */
function asRowRecord<TItem>(item: TItem): Record<string, unknown> {
  return item as unknown as Record<string, unknown>;
}

@Component({
  selector: 'sq-datatable',
  standalone: true,
  templateUrl: './datatable.component.html',
  styleUrls: ['./datatable.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgTemplateOutlet,
    PaginatorComponent,
    DatatableRowComponent,
    DatatableColumnComponent,
  ]
})
export class DatatableComponent<TItem = unknown> {
  items = input<TItem[]>([]);
  size = input<Size>('medium');
  /** Optional empty presentation; custom body templates retain complete control. */
  emptyText = input<string>('');
  sortByAllColumns = input<boolean>(false);
  paginatorConfig = input<PaginatorConfig>({});
  sortByColumns = input<string[]>([]);

  onSortClicked = output<SortItem>();
  pageChange = output<PageChangeEvent>();

  datatableHeaderTemplate = contentChild(DatatableHeaderDirective, { read: TemplateRef });
  datatableBodyTemplate = contentChild(DatatableBodyDirective, { read: TemplateRef });

  /** The active sort. `null` (or an `undefined` direction) means "original order". */
  readonly sortState = signal<SortItem | null>(null);

  readonly columnNames = computed<DatatableColumn[]>(() => {
    const firstItem = this.items()?.[0];

    if (!firstItem) {
      return [];
    }

    const sortByAll = this.sortByAllColumns();
    const sortByCols = this.sortByColumns() ?? [];

    return Object.keys(asRowRecord(firstItem)).map((columnName) => ({
      name: columnName,
      canBeSortedAgainst: sortByAll || sortByCols.includes(columnName),
    }));
  });

  /** Column order shared by the header and every row, so rows with other keys stay aligned. */
  readonly columnKeys = computed(() => this.columnNames().map(column => column.name));

  /** The whole collection in display order: sorting applies across pages, not to the visible page. */
  readonly sortedItems = computed<TItem[]>(() => {
    const items = this.items() ?? [];
    const sort = this.sortState();

    if (!sort || sort.isSortedByAscending === undefined) {
      return items;
    }

    const direction = sort.isSortedByAscending ? 1 : -1;

    return [...items].sort((rowItem1, rowItem2) => direction * this.compareColumnValues(
      this.readColumn(rowItem1, sort.name),
      this.readColumn(rowItem2, sort.name)
    ));
  });

  /** Name of the column the table is sorted by, so the other columns reset their sort icon. */
  readonly activeSortColumn = computed(() => {
    const sort = this.sortState();
    return sort && sort.isSortedByAscending !== undefined ? sort.name : null;
  });

  paginatedCollection = signal<TItem[]>([]);

  onPageChange($event: PageChangeEvent) {
    this.pageChange.emit($event);
  }

  onPaginatedCollectionChange(collection: TItem[]) {
    this.paginatedCollection.set(collection);
  }

  sortByField(column: SortItem) {
    this.sortState.set(column);
    this.onSortClicked.emit(column);
  }

  /** Reads a cell as a comparable scalar: numbers stay numeric so `10` sorts after `9`. */
  private readColumn(item: TItem, columnName: string): string | number {
    const value = asRowRecord(item)[columnName];

    if (typeof value === 'number') {
      return value;
    }

    return value === null || value === undefined ? '' : String(value);
  }

  private compareColumnValues(left: string | number, right: string | number): number {
    if (typeof left === 'number' && typeof right === 'number') {
      return left - right;
    }

    return String(left).localeCompare(String(right));
  }
}
