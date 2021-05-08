import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ModalDocsComponent } from './modal-docs/modal-docs.component';

const routes: Routes = [
  {
    path: '',
    component: ModalDocsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ModalRoutingModule { }
