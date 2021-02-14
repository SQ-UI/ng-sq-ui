import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SqCommonComponent } from './common/sq-common.component';

const routes: Routes = [
  {
    path: '',
    component: SqCommonComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SqCommonRoutingModule { }
