import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';

export const routes: Routes = [
  {

    path: 'auth',
    loadChildren: () => import('@/features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'dashboard',

    loadComponent: () => import('@/features/dashboard/components/dashboard-layout/dashboard-layout').then(m => m.DashboardLayout),
    title: 'Inicio',
    children: [
      {
        path: '',
        loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES)
      }
    ],
  },
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full',
  },
];
