import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DatatableDocsComponent } from './datatable-docs/datatable-docs.component';

const routes: Routes = [
  {
    path: '',
    component: DatatableDocsComponent
  }
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);
