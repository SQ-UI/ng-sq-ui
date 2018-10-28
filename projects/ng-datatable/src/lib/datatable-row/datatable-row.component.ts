import {Component, Input, OnInit, ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'sq-datatable-row',
  templateUrl: './datatable-row.component.html',
  styleUrls: ['./datatable-row.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DatatableRowComponent implements OnInit {
  @Input() rowItem;

  constructor() { }

  ngOnInit() {
  }

}
