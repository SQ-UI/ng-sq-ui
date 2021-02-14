import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DatatimePickerDocsComponent } from './datatime-picker-docs/datatime-picker-docs.component';

const routes: Routes = [
  {
    path: '',
    component: DatatimePickerDocsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DatetimePickerRoutingModule { }
