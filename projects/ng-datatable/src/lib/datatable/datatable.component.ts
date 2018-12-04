import {
  Component, OnInit, Input, OnChanges,
  SimpleChanges, ContentChild, TemplateRef,
  EventEmitter, Output, ViewEncapsulation, ChangeDetectorRef, ChangeDetectionStrategy
} from '@angular/core';
import { DatatableHeaderDirective } from '../directives/datatable-header.directive';
import { DatatableBodyDirective } from '../directives/datatable-body.directive';
import { SortItem } from '../shared/interfaces/sort-item';

@Component({
  selector: 'sq-datatable',
  templateUrl: './datatable.component.html',
  styleUrls: ['./datatable.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DatatableComponent implements OnInit, OnChanges {
  @Input() items = [];
  @Input() rowsPerPage: number = 10;
  @Input() isSortByColumnEnabled: boolean = false;
  @Input() itemsPerPage: number = 10;
  @Input() lastPage: number;
  @Output() onSortClicked: EventEmitter<SortItem> = new EventEmitter<SortItem>();
  @Output() pageChange = new EventEmitter();

  @ContentChild(DatatableHeaderDirective, {read: TemplateRef}) datatableHeaderTemplate;
  @ContentChild(DatatableBodyDirective, {read: TemplateRef}) datatableBodyTemplate;

  columnNames: string[] = [];
  paginatedCollection = [];

  constructor() { }

  ngOnInit() {

  }

  onPageChange($event) {
    this.pageChange.emit($event);
  }

  ngOnChanges(changesObj: SimpleChanges) {
    if (changesObj.items && changesObj.items.currentValue.length > 0) {
      this.columnNames = Object.keys(changesObj.items.currentValue[0]);
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
}
