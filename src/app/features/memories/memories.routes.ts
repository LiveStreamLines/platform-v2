import { Routes } from '@angular/router';

export const MEMORIES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./memories-list/memories-list.component').then(m => m.MemoriesListComponent)
  },
  {
    path: 'create',
    loadComponent: () => import('./memory-form/memory-form.component').then(m => m.MemoryFormComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./memory-detail/memory-detail.component').then(m => m.MemoryDetailComponent)
  }
];

