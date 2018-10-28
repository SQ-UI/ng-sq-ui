import {Component, OnInit, Input, OnChanges, SimpleChanges, ContentChild, TemplateRef} from '@angular/core';
import { DatatableHeaderDirective } from '../directives/datatable-header.directive';
import { DatatableBodyDirective } from '../directives/datatable-body.directive';

@Component({
  selector: 'sq-datatable',
  templateUrl: './datatable.component.html',
  styleUrls: ['./datatable.component.scss']
})
export class DatatableComponent implements OnInit, OnChanges {
  @Input() items = [];

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

}
