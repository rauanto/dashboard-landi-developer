import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

/**
 * Puerto (Adapter Pattern): el resto de la app depende solo de este contrato,
 * nunca del cliente HTTP concreto ni de las rutas/DTOs reales de la API.
 * Cambiar de backend o de esquema de auth implica escribir un nuevo adapter,
 * no tocar AuthService ni los componentes.
 */
export interface AuthApiPort {
  login(email: string, password: string): Observable<void>;
  logout(): Observable<void>;
  register(email: string, password: string): Observable<User>;
  getCurrentUser(): Observable<User>;
}

export const AUTH_API_PORT = new InjectionToken<AuthApiPort>('AUTH_API_PORT');
