import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Evita que alguien con sesión activa vuelva a ver las páginas de login/registro. */
export const guestGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  await authService.ensureSessionChecked();

  if (authService.isAuthenticated()) {
    return router.parseUrl('/dashboard');
  }

  return true;
};
