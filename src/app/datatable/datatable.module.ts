import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatatableDocsComponent } from './datatable-docs/datatable-docs.component';
import { NgDatatableModule } from '@sq-ui/ng-datatable';
import { SharedModule } from '../shared/shared.module';
import { DatatableRoutingModule } from './datatable-routing.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    NgDatatableModule,
    DatatableRoutingModule
  ],
  declarations: [DatatableDocsComponent]
})
export class DatatableModule { }
