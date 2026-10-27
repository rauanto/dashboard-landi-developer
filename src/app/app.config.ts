import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';
import { credentialsInterceptor } from './core/interceptors/credentials.interceptor';
import { AUTH_API_PORT } from './core/adapters/auth-api.port';
import { FastApiAuthAdapter } from './core/adapters/fastapi-auth.adapter';
import { ROLES_API_PORT } from './core/adapters/roles-api.port';
import { FastApiRolesAdapter } from './core/adapters/fastapi-roles.adapter';
import { PERMISSIONS_API_PORT } from './core/adapters/permissions-api.port';
import { FastApiPermissionsAdapter } from './core/adapters/fastapi-permissions.adapter';
import { USERS_API_PORT } from './core/adapters/users-api.port';
import { FastApiUsersAdapter } from './core/adapters/fastapi-users.adapter';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([credentialsInterceptor])),
    provideAnimationsAsync(),
    { provide: AUTH_API_PORT, useClass: FastApiAuthAdapter },
    { provide: ROLES_API_PORT, useClass: FastApiRolesAdapter },
    { provide: PERMISSIONS_API_PORT, useClass: FastApiPermissionsAdapter },
    { provide: USERS_API_PORT, useClass: FastApiUsersAdapter },
  ]
};
