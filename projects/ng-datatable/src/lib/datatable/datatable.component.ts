import {
  Component, input, output, effect, signal, untracked,
  contentChild, TemplateRef,
  ChangeDetectionStrategy, ViewEncapsulation
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { DatatableHeaderDirective } from '../directives/datatable-header.directive';
import { DatatableBodyDirective } from '../directives/datatable-body.directive';
import { SortItem } from '../shared/interfaces/sort-item';
import { PaginatorConfig } from '@sq-ui/ng-sq-common';
import { PaginatorComponent } from '@sq-ui/ng-sq-common';
import { DatatableColumn } from '../shared/interfaces/datatable-column';
import { DatatableRowComponent } from '../datatable-row/datatable-row.component';
import { DatatableColumnComponent } from '../datatable-column/datatable-column.component';

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
export class DatatableComponent {
  items = input<any[]>([]);
  sortByAllColumns = input<boolean>(false);
  paginatorConfig = input<PaginatorConfig>({});
  sortByColumns = input<string[]>([]);

  onSortClicked = output<SortItem>();
  pageChange = output<any>();

  datatableHeaderTemplate = contentChild(DatatableHeaderDirective, { read: TemplateRef });
  datatableBodyTemplate = contentChild(DatatableBodyDirective, { read: TemplateRef });

  columnNames = signal<DatatableColumn[]>([]);
  paginatedCollection = signal<any[]>([]);

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

  onPageChange($event: any) {
    this.pageChange.emit($event);
  }

  onPaginatedCollectionChange(collection: any[]) {
    this.paginatedCollection.set(collection);
  }

  sortByField(column: SortItem) {
    this.onSortClicked.emit(column);
    this.sortItems(column.name, column.isSortedByAscending);
  }

  private sortItems(columnName: string, ascending: boolean) {
    if (typeof ascending === 'undefined') {
      ascending = true;
    }

    this.paginatedCollection.update(collection => [...collection].sort((rowItem1, rowItem2) => {
      if (rowItem1[columnName] > rowItem2[columnName]) {
        return ascending ? 1 : -1;
      }

      if (rowItem1[columnName] < rowItem2[columnName]) {
        return ascending ? -1 : 1;
      }

      // names must be equal
      return 0;
    }));
  }

  private generateColumns(item: any, sortByAll: boolean, sortByCols: string[]) {
    if (!item) {
      return;
    }

    this.columnNames.set(Object.keys(item)
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
