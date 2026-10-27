import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { AppToastComponent, ToastData, ToastType } from './toast.component';

export interface ToastOptions {
  /** ms; 0 = no se cierra solo. */
  duration?: number;
  actionLabel?: string;
}

/**
 * toast.success('Cliente guardado');
 * toast.error('No se pudo guardar', { actionLabel: 'Reintentar' }).onAction().subscribe(...)
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private snack = inject(MatSnackBar);

  show(type: ToastType, message: string, opts: ToastOptions = {}): MatSnackBarRef<AppToastComponent> {
    const data: ToastData = { type, message, actionLabel: opts.actionLabel };
    return this.snack.openFromComponent(AppToastComponent, {
      data,
      duration: opts.duration ?? (type === 'error' ? 6000 : 3500),
      panelClass: ['app-toast-panel', `app-toast-panel--${type}`],
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }

  success(message: string, opts?: ToastOptions) { return this.show('success', message, opts); }
  error(message: string, opts?: ToastOptions) { return this.show('error', message, opts); }
  warning(message: string, opts?: ToastOptions) { return this.show('warning', message, opts); }
  info(message: string, opts?: ToastOptions) { return this.show('info', message, opts); }
}
