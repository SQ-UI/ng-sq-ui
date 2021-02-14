import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DatatableDocsComponent } from './datatable-docs/datatable-docs.component';

const routes: Routes = [
  {
    path: '',
    component: DatatableDocsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DatatableRoutingModule { }