import { Routes } from '@angular/router';
import { guestGuard } from '@core/guards/guest.guard';

export const AUTH_ROUTES: Routes = [
    {
        path: 'login',
        // canActivate: [guestGuard],
        loadComponent: () => import('./pages/login/login').then((c) => c.Login),
        title: 'Iniciar Sesión',
    },
    {
        path: 'register',
        // canActivate: [guestGuard],
        loadComponent: () => import('./pages/register/register').then((c) => c.Register),
        title: 'Crear cuenta',
    },
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
    },
];
