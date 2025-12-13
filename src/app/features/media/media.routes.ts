import { Routes } from '@angular/router';

export const MEDIA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./media-library/media-library.component').then(m => m.MediaLibraryComponent)
  },
  {
    path: 'viewer/:id',
    loadComponent: () => import('./media-viewer/media-viewer.component').then(m => m.MediaViewerComponent)
  }
];

