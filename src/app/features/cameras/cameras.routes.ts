import { Routes } from '@angular/router';

export const CAMERAS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./camera-list/camera-list.component').then(m => m.CameraListComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./camera-detail/camera-detail.component').then(m => m.CameraDetailComponent)
  }
];

