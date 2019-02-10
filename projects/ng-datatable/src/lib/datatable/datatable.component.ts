import {
  Component, OnInit, Input, OnChanges,
  SimpleChanges, ContentChild, TemplateRef,
  EventEmitter, Output, ViewEncapsulation, ViewChild
} from '@angular/core';
import { DatatableHeaderDirective } from '../directives/datatable-header.directive';
import { DatatableBodyDirective } from '../directives/datatable-body.directive';
import { SortItem } from '../shared/interfaces/sort-item';
import { PaginatorConfig } from '@sq-ui/ng-sq-common';
import { DatatableColumn } from '../shared/interfaces/datatable-column';

@Component({
  selector: 'sq-datatable',
  templateUrl: './datatable.component.html',
  styleUrls: ['./datatable.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DatatableComponent implements OnInit, OnChanges {
  @Input() items = [];
  @Input() sortByAllColumns: boolean = false;
  @Input() paginatorConfig: PaginatorConfig = {};
  @Input() sortByColumns: string[] = [];
  @Output() onSortClicked: EventEmitter<SortItem> = new EventEmitter<SortItem>();
  @Output() pageChange = new EventEmitter();

  @ContentChild(DatatableHeaderDirective, {read: TemplateRef}) datatableHeaderTemplate;
  @ContentChild(DatatableBodyDirective, {read: TemplateRef}) datatableBodyTemplate;
  @ViewChild('paginator') paginatorComponent;

  columnNames: DatatableColumn[] = [];
  paginatedCollection = [];

  constructor() { }

  ngOnInit() {

  }

  onPageChange($event) {
    this.pageChange.emit($event);
  }

  ngOnChanges(changesObj: SimpleChanges) {
    if (changesObj.items && changesObj.items.currentValue.length > 0) {
      this.generateColumns(changesObj.items.currentValue[0]);
    }

    if (changesObj.sortByColumns && changesObj.sortByColumns.currentValue.length > 0) {
      this.generateColumns(this.items[0]);
    }

    if (changesObj.sortByAllColumns && changesObj.sortByAllColumns.currentValue === true) {
      this.generateColumns(this.items[0]);
    }
  }

  sortByField(column: SortItem) {
    if (this.onSortClicked.observers.length > 0) {
      this.onSortClicked.emit(column);
    } else {
      this.sortItems(column.name, column.isSortedByAscending);
    }
  }

  private sortItems(columnName: string, ascending: boolean) {
    this.paginatedCollection.sort((rowItem1, rowItem2) => {
      if (rowItem1[columnName] > rowItem2[columnName]) {
        return ascending ? 1 : -1;
      }

      if (rowItem1[columnName] < rowItem2[columnName]) {
        return ascending ? -1 : 1;
      }

      // names must be equal
      return 0;
    });
  }

  private generateColumns(item) {
    if (!item) {
      return;
    }

    this.columnNames = Object.keys(item)
      .map((columnName) => {
        const canBeSortedAgainst = this.sortByAllColumns ||
          (this.sortByColumns && this.sortByColumns.indexOf(columnName) > -1);

        return {
          name: columnName,
          canBeSortedAgainst: canBeSortedAgainst
        };
      });
  }
}
