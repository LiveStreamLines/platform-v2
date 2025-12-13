import { Routes } from '@angular/router';
import { AuthGuard } from './services/auth.guard';
import { CustomerShellComponent } from './layout/customer-shell/customer-shell.component';

export const customerRoutes: Routes = [
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
      }
    ]
  },
  {
    path: '',
    component: CustomerShellComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'projects',
        loadChildren: () => import('./features/projects/projects.routes').then(m => m.PROJECTS_ROUTES)
      },
      {
        path: 'cameras',
        loadChildren: () => import('./features/cameras/cameras.routes').then(m => m.CAMERAS_ROUTES)
      },
      {
        path: 'live-view',
        loadComponent: () => import('./features/live-view/live-view.component').then(m => m.LiveViewComponent)
      },
      {
        path: 'timelapse',
        loadChildren: () => import('./features/timelapse/timelapse.routes').then(m => m.TIMELAPSE_ROUTES)
      },
      {
        path: 'media',
        loadChildren: () => import('./features/media/media.routes').then(m => m.MEDIA_ROUTES)
      },
      {
        path: 'memories',
        loadChildren: () => import('./features/memories/memories.routes').then(m => m.MEMORIES_ROUTES)
      },
      {
        path: 'services',
        loadChildren: () => import('./features/services/services.routes').then(m => m.SERVICES_ROUTES)
      },
      {
        path: 'messages',
        loadChildren: () => import('./features/messages/messages.routes').then(m => m.MESSAGES_ROUTES)
      },
      {
        path: 'about',
        loadComponent: () => import('./features/about/about.component').then(m => m.AboutComponent)
      },
      {
        path: '404',
        loadComponent: () => import('./features/not-found/not-found.component').then(m => m.NotFoundComponent)
      },
      {
        path: '**',
        redirectTo: '404'
      }
    ]
  },
  {
    path: '**',
    redirectTo: '404'
  }
];

