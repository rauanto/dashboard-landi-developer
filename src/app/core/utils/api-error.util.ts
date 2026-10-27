import { HttpErrorResponse } from '@angular/common/http';
import { ApiErrorBody } from '../models/auth-api.models';

const ERROR_MESSAGES: Record<string, string> = {
  LOGIN_BAD_CREDENTIALS: 'Correo o contraseña incorrectos',
  LOGIN_USER_NOT_VERIFIED: 'Tu cuenta aún no ha sido verificada',
  REGISTER_USER_ALREADY_EXISTS: 'Ya existe una cuenta con este correo',
  REGISTER_INVALID_PASSWORD: 'La contraseña no cumple los requisitos mínimos',
};

/** Traduce un error de HttpClient (idealmente uno de auth) a un mensaje en español para el usuario. */
export function extractAuthErrorMessage(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return 'Ocurrió un error inesperado. Intenta de nuevo.';
  }

  if (error.status === 0) {
    return 'No se pudo conectar con el servidor';
  }

  const detail = (error.error as ApiErrorBody | undefined)?.detail;

  if (typeof detail === 'string') {
    return ERROR_MESSAGES[detail] ?? detail;
  }

  if (detail?.reason) {
    return detail.reason;
  }

  return 'Ocurrió un error inesperado. Intenta de nuevo.';
}
