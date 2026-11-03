import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'about',
    loadComponent: () => import('./home/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'sq-ui',
    loadComponent: () => import('./sq-ui/sq-ui/sq-ui.component').then(m => m.SqUiComponent)
  },
  {
    path: 'sq-common',
    loadComponent: () => import('./sq-common/common/sq-common.component').then(m => m.SqCommonComponent)
  },
  {
    path: 'datetime-picker',
    loadComponent: () => import('./datetime-picker/datatime-picker-docs/datatime-picker-docs.component').then(m => m.DatatimePickerDocsComponent)
  },
  {
    path: 'modal',
    loadComponent: () => import('./modal/modal-docs/modal-docs.component').then(m => m.ModalDocsComponent)
  },
  {
    path: 'datatable',
    loadComponent: () => import('./datatable/datatable-docs/datatable-docs.component').then(m => m.DatatableDocsComponent)
  },
  {
    path: '',
    redirectTo: '/about',
    pathMatch: 'full'
  }
];
