import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SqUiComponent } from './sq-ui/sq-ui.component';

const routes: Routes = [
  {
    path: '',
    component: SqUiComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SqUiRoutingModule { }

