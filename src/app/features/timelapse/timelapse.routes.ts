import { Routes } from '@angular/router';

export const TIMELAPSE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./timelapse-list/timelapse-list.component').then(m => m.TimelapseListComponent)
  },
  {
    path: 'request',
    loadComponent: () => import('./timelapse-request/timelapse-request.component').then(m => m.TimelapseRequestComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./timelapse-viewer/timelapse-viewer.component').then(m => m.TimelapseViewerComponent)
  }
];

