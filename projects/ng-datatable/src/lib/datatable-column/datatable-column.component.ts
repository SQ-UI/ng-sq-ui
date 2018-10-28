import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { SortItem } from '../shared/interfaces/sort-item';

@Component({
  selector: 'sq-datatable-column',
  templateUrl: './datatable-column.component.html',
  styleUrls: ['./datatable-column.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DatatableColumnComponent implements OnInit {
  @Input() name: string;
  @Output() onSortClicked: EventEmitter<SortItem> = new EventEmitter();
  @Input() isSortable: boolean = false;

  isSortedByAscending: boolean;

  constructor() { }

  ngOnInit() {
  }

  sort() {
    this.isSortedByAscending = !this.isSortedByAscending;

    this.onSortClicked.emit({
      name: this.name,
      isSortedByAscending: this.isSortedByAscending
    });
  }
}
