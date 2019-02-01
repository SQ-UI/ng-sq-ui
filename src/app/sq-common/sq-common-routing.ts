import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SqCommonComponent } from './common/sq-common.component';

const routes: Routes = [
  {
    path: '',
    component: SqCommonComponent
  }
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);
