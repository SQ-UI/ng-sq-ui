import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'sq-ui',
    loadChildren: './sq-ui/sq-ui.module#SqUiModule'
  },
  {
    path: 'sq-common',
    loadChildren: './sq-common/sq-common.module#SqCommonModule'
  },
  {
    path: 'datetime-picker',
    loadChildren: './datetime-picker/datetime-picker.module#DatetimePickerModule'
  },
  {
    path: '',
    redirectTo: '/sq-ui',
    pathMatch: 'full'
  }
];
