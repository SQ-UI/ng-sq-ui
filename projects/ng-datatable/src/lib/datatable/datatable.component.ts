import {
  Component, input, output, effect, signal, untracked,
  contentChild, TemplateRef,
  ChangeDetectionStrategy, ViewEncapsulation
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { DatatableHeaderDirective } from '../directives/datatable-header.directive';
import { DatatableBodyDirective } from '../directives/datatable-body.directive';
import { SortItem } from '../shared/interfaces/sort-item';
import { PaginatorConfig, PageChangeEvent } from '@sq-ui/ng-sq-common';
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
    DatatableHeaderDirective,
    DatatableBodyDirective
  ]
})
export class DatatableComponent<TItem = unknown> {
  items = input<TItem[]>([]);
  sortByAllColumns = input<boolean>(false);
  paginatorConfig = input<PaginatorConfig>({});
  sortByColumns = input<string[]>([]);

  onSortClicked = output<SortItem>();
  pageChange = output<PageChangeEvent>();

  datatableHeaderTemplate = contentChild(DatatableHeaderDirective, { read: TemplateRef });
  datatableBodyTemplate = contentChild(DatatableBodyDirective, { read: TemplateRef });

  columnNames = signal<DatatableColumn[]>([]);
  paginatedCollection = signal<TItem[]>([]);

  constructor() {
    effect(() => {
      const currentItems = this.items();
      const sortByAll = this.sortByAllColumns();
      const sortByCols = this.sortByColumns();

      untracked(() => {
        if (currentItems && currentItems.length > 0) {
          this.generateColumns(currentItems[0], sortByAll, sortByCols);
        }
      });
    });
  }

  onPageChange($event: PageChangeEvent) {
    this.pageChange.emit($event);
  }

  onPaginatedCollectionChange(collection: TItem[]) {
    this.paginatedCollection.set(collection);
  }

  sortByField(column: SortItem) {
    this.onSortClicked.emit(column);
    this.sortItems(column.name, column.isSortedByAscending);
  }

  private sortItems(columnName: string, ascending: boolean | undefined) {
    const direction = ascending === false ? -1 : 1;

    this.paginatedCollection.update(collection => [...collection].sort((rowItem1, rowItem2) => {
      const comparison = this.compareColumnValues(
        this.readColumn(rowItem1, columnName),
        this.readColumn(rowItem2, columnName)
      );

      return comparison * direction;
    }));
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

  private generateColumns(item: TItem, sortByAll: boolean, sortByCols: string[]) {
    if (!item) {
      return;
    }

    this.columnNames.set(Object.keys(asRowRecord(item))
      .map((columnName) => {
        const canBeSortedAgainst = sortByAll ||
          (sortByCols && sortByCols.indexOf(columnName) > -1);

        return {
          name: columnName,
          canBeSortedAgainst: canBeSortedAgainst
        };
      }));
  }
}
