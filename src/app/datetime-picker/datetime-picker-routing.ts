import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DatatimePickerDocsComponent } from './datatime-picker-docs/datatime-picker-docs.component';

const routes: Routes = [
  {
    path: '',
    component: DatatimePickerDocsComponent
  }
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);
