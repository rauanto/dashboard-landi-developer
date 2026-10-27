import { Injectable, inject, signal, computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AUTH_API_PORT } from '../adapters/auth-api.port';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly authApi = inject(AUTH_API_PORT);

  private readonly _currentUser = signal<User | null>(null);
  private readonly _authChecked = signal(false);

  /** El JWT vive únicamente en una cookie httpOnly puesta por el backend; nunca pasa por JS. */
  public readonly currentUser = this._currentUser.asReadonly();
  /** true una vez que ya se resolvió (con éxito o no) el intento de recuperar la sesión al cargar la app. */
  public readonly authChecked = this._authChecked.asReadonly();
  public readonly isAuthenticated = computed(() => this._currentUser() !== null);

  private sessionCheck: Promise<void> | null = null;

  async login(email: string, password: string): Promise<void> {
    await firstValueFrom(this.authApi.login(email, password));
    const user = await firstValueFrom(this.authApi.getCurrentUser());
    this._currentUser.set(user);
    this._authChecked.set(true);
  }

  async register(email: string, password: string): Promise<User> {
    return firstValueFrom(this.authApi.register(email, password));
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(this.authApi.logout());
    } finally {
      this._currentUser.set(null);
    }
  }

  /**
   * Intenta recuperar la sesión a partir de la cookie httpOnly (si el navegador la sigue
   * mandando) pidiendo el usuario actual. Se cachea la promesa para que, sin importar cuántos
   * guards/componentes la disparen en paralelo durante la carga de la app, solo se llame una vez.
   */
  ensureSessionChecked(): Promise<void> {
    if (!this.sessionCheck) {
      this.sessionCheck = firstValueFrom(this.authApi.getCurrentUser())
        .then((user) => this._currentUser.set(user))
        .catch(() => this._currentUser.set(null))
        .finally(() => this._authChecked.set(true));
    }

    return this.sessionCheck;
  }
}
