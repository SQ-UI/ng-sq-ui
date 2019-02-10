import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ModalDocsComponent } from './modal-docs/modal-docs.component';

const routes: Routes = [
  {
    path: '',
    component: ModalDocsComponent
  }
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);
