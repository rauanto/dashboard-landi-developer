import { Routes } from '@angular/router';

export const DASHBOARD_ROUTES: Routes = [
    {
        path: 'home',
        loadComponent: () => import('./pages/home/home').then((c) => c.Home),
        title: 'Inicio',
    },
    {
        path: 'view-tables',
        loadComponent: () => import('./pages/view-tables/view-tables').then((c) => c.ViewTables),
        title: 'Vizualiador de Tablas',
    },
    {
        path: 'roles',
        loadComponent: () => import('./pages/roles/roles').then((c) => c.RolesPage),
        title: 'Gestión de Roles',
    },
    {
        path: 'permissions',
        loadComponent: () => import('./pages/permissions/permissions').then((c) => c.PermissionsPage),
        title: 'Gestión de Permisos',
    },
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
    },
    {
        path: 'form-view',
        loadComponent: () => import('./pages/vista-formulario/vista-formulario').then((c) => c.VistaFormulario),
        title: 'Vista de Formularios',
    },
    {
        path: 'ui-demo',
        loadComponent: () => import('./pages/ui-demo/ui-demo.component').then((c) => c.UiDemoComponent),
        title: 'UI Demo',
    }
];
