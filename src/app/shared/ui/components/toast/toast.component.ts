import { Component, ChangeDetectionStrategy, ViewEncapsulation, inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastData {
  message: string;
  type: ToastType;
  actionLabel?: string;
}

const ICONS: Record<ToastType, string> = {
  success: 'check_circle',
  error: 'error',
  warning: 'warning',
  info: 'info',
};

@Component({
  selector: 'app-toast',
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Sin encapsulación: necesitamos tokens sobre el contenedor del snackbar (panelClass)
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="app-toast">
      <mat-icon class="app-toast__icon">{{ icon }}</mat-icon>
      <span class="app-toast__message">{{ data.message }}</span>
      @if (data.actionLabel) {
        <button type="button" class="app-toast__action" (click)="ref.dismissWithAction()">{{ data.actionLabel }}</button>
      }
      <button type="button" class="app-toast__close" aria-label="Cerrar" (click)="ref.dismiss()">
        <mat-icon>close</mat-icon>
      </button>
    </div>
  `,
  styles: `
    .app-toast { display: flex; align-items: center; gap: 0.75rem; min-width: 16rem; }
    .app-toast__message { flex: 1; font-size: 0.875rem; }
    .app-toast__icon { flex-shrink: 0; }
    .app-toast__action, .app-toast__close {
      border: none; background: transparent; color: inherit; font: inherit; cursor: pointer;
      border-radius: 100px; padding: 0.25rem 0.5rem; display: inline-flex; align-items: center;
    }
    .app-toast__action { font-weight: 600; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.04em; }
    .app-toast__close { padding: 0.125rem; mat-icon { width: 1.125rem; height: 1.125rem; font-size: 1.125rem; } }
    .app-toast__action:hover, .app-toast__close:hover { background: color-mix(in srgb, currentColor 14%, transparent); }

    .app-toast-panel--success { --mat-snack-bar-container-color: var(--app-success-container); --mat-snack-bar-supporting-text-color: var(--app-on-success-container); }
    .app-toast-panel--error   { --mat-snack-bar-container-color: var(--app-error-container);   --mat-snack-bar-supporting-text-color: var(--app-on-error-container); }
    .app-toast-panel--warning { --mat-snack-bar-container-color: var(--app-warning-container); --mat-snack-bar-supporting-text-color: var(--app-on-warning-container); }
    .app-toast-panel--info    { --mat-snack-bar-container-color: var(--app-info-container);    --mat-snack-bar-supporting-text-color: var(--app-on-info-container); }
    .app-toast-panel { --mat-snack-bar-container-shape: 100px; }
  `,
})
export class AppToastComponent {
  data = inject<ToastData>(MAT_SNACK_BAR_DATA);
  ref = inject(MatSnackBarRef<AppToastComponent>);
  get icon(): string {
    return ICONS[this.data.type];
  }
}
