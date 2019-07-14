import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'about',
    loadChildren: () => import('./home/home.module').then(m => m.HomeModule)
  },
  {
    path: 'sq-ui',
    loadChildren: () => import('./sq-ui/sq-ui.module').then(m => m.SqUiModule)
  },
  {
    path: 'sq-common',
    loadChildren: () => import('./sq-common/sq-common.module').then(m => m.SqCommonModule)
  },
  {
    path: 'datetime-picker',
    loadChildren: () => import('./datetime-picker/datetime-picker.module').then(m => m.DatetimePickerModule)
  },
  {
    path: 'modal',
    loadChildren: () => import('./modal/modal.module').then(m => m.ModalModule)
  },
  {
    path: 'datatable',
    loadChildren: () => import('./datatable/datatable.module').then(m => m.DatatableModule)
  },
  {
    path: '',
    redirectTo: '/about',
    pathMatch: 'full'
  }
];
