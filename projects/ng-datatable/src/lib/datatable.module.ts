import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatatableComponent } from './datatable/datatable.component';
import { DatatableColumnComponent } from './datatable-column/datatable-column.component';
import { DatatableHeaderDirective } from './directives/datatable-header.directive';
import { DatatableBodyDirective } from './directives/datatable-body.directive';
import { DatatableRowComponent } from './datatable-row/datatable-row.component';
import { NgSqCommonModule } from '@sq-ui/ng-sq-common';

@NgModule({
  imports: [
    CommonModule,
    NgSqCommonModule
  ],
  declarations: [
    DatatableComponent,
    DatatableHeaderDirective,
    DatatableBodyDirective,
    DatatableColumnComponent,
    DatatableRowComponent
  ],
  exports: [
    DatatableComponent,
    DatatableHeaderDirective,
    DatatableBodyDirective,
    DatatableColumnComponent,
    DatatableRowComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class NgDatatableModule { }
