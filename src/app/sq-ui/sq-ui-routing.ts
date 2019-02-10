import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SqUiComponent } from './sq-ui/sq-ui.component';

const routes: Routes = [
  {
    path: '',
    component: SqUiComponent
  }
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);
