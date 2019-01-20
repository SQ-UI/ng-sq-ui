import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'sq-ui',
    pathMatch: 'full'
  },
  {
    path: 'sq-ui',
    loadChildren: './sq-ui/sq-ui.module#SqUiModule'
  }
];
