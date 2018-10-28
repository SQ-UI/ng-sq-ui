import { Component, OnInit, Input, OnChanges,
         SimpleChanges, ContentChild, TemplateRef,
         EventEmitter, Output, ViewEncapsulation} from '@angular/core';
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
  @Input() isSortByColumnEnabled: boolean = false;
  @Output() onSortClicked: EventEmitter<SortItem> = new EventEmitter<SortItem>();

  @ContentChild(DatatableHeaderDirective, {read: TemplateRef}) datatableHeaderTemplate;
  @ContentChild(DatatableBodyDirective, {read: TemplateRef}) datatableBodyTemplate;

  columnNames: string[] = [];

  constructor() { }

  ngOnInit() {
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
    this.items.sort((rowItem1, rowItem2) => {
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
