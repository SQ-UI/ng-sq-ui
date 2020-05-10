import { Component, OnInit, Input,
         Output, EventEmitter, ViewEncapsulation,
         OnChanges, SimpleChanges } from '@angular/core';
import { SortItem } from '../shared/interfaces/sort-item';

@Component({
  selector: '[sq-datatable-column]',
  templateUrl: './datatable-column.component.html',
  styleUrls: ['./datatable-column.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DatatableColumnComponent implements OnInit, OnChanges {
  @Input() name: string;
  @Output() onSortClicked: EventEmitter<SortItem> = new EventEmitter();
  @Input() isSortable: boolean = false;
  @Input() width: string;

  isSortedByAscending: boolean;

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(changesObj: SimpleChanges) {

  }

  sort() {
    switch (typeof this.isSortedByAscending) {
      case 'undefined':
        this.isSortedByAscending = true;
        break;
      case 'boolean':
        this.isSortedByAscending = this.isSortedByAscending ? false : undefined;
        break;
    }

    this.onSortClicked.emit({
      name: this.name,
      isSortedByAscending: this.isSortedByAscending
    });
  }
}
