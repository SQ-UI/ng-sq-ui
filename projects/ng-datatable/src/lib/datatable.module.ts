import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatatableComponent } from './datatable/datatable.component';
import { DatatableColumnComponent } from './datatable-column/datatable-column.component';
import { DatatableHeaderDirective } from './directives/datatable-header.directive';
import { DatatableBodyDirective } from './directives/datatable-body.directive';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    DatatableComponent,
    DatatableColumnComponent,
    DatatableHeaderDirective,
    DatatableBodyDirective
  ],
  exports: [
    DatatableComponent,
    DatatableColumnComponent,
    DatatableHeaderDirective,
    DatatableBodyDirective
  ]
})
export class DatatableModule { }
