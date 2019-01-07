import {Component, Input, OnChanges, OnInit, SimpleChanges, ViewEncapsulation} from '@angular/core';

@Component({
  selector: '[sq-datatable-row]',
  templateUrl: './datatable-row.component.html',
  styleUrls: ['./datatable-row.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DatatableRowComponent implements OnInit, OnChanges {
  @Input() rowItem: {[key: string]: any};
  @Input() width: string;

  columns = [];

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(changesObj: SimpleChanges) {
    if (changesObj.rowItem && changesObj.rowItem.currentValue) {
      if (!this.width) {
        this.columns = Object.keys(changesObj.rowItem.currentValue);
      }
    }
  }

}
