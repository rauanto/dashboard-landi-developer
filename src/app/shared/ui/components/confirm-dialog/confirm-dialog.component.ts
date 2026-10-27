import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { AppButtonComponent, ButtonColor } from '../button/button.component';

export interface ConfirmDialogData {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Color del botón de confirmar (usa 'error' para acciones destructivas). */
  color?: ButtonColor;
  icon?: string;
  /** Oculta el botón cancelar (diálogo informativo). */
  hideCancel?: boolean;
}

@Component({
  selector: 'app-confirm-dialog',
  imports: [MatDialogModule, MatIconModule, AppButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="app-confirm">
      @if (data.icon) {
        <mat-icon class="app-confirm__icon" [class]="'app-confirm__icon app-confirm__icon--' + (data.color ?? 'primary')">
          {{ data.icon }}
        </mat-icon>
      }
      <h2 mat-dialog-title class="app-confirm__title">{{ data.title }}</h2>
      @if (data.message) {
        <mat-dialog-content class="app-confirm__message">{{ data.message }}</mat-dialog-content>
      }
      <mat-dialog-actions align="end" class="app-confirm__actions">
        @if (!data.hideCancel) {
          <button appButton variant="text" color="secondary" type="button" [mat-dialog-close]="false">
            {{ data.cancelLabel ?? 'Cancelar' }}
          </button>
        }
        <button appButton variant="filled" [color]="data.color ?? 'primary'" type="button" [mat-dialog-close]="true" cdkFocusInitial>
          {{ data.confirmLabel ?? 'Aceptar' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: `
    .app-confirm { display: flex; flex-direction: column; gap: 0.25rem; padding: 0.5rem 0.5rem 0; min-width: 18rem; }
    .app-confirm__icon { width: 2.5rem; height: 2.5rem; font-size: 2.5rem; margin: 0.5rem 1.5rem 0; color: var(--mat-sys-primary);
      &--error { color: var(--app-error); } &--warning { color: var(--app-warning); }
      &--success { color: var(--app-success); } &--info { color: var(--app-info); }
      &--secondary { color: var(--mat-sys-secondary); } &--tertiary { color: var(--mat-sys-tertiary); } }
    .app-confirm__title { font-weight: 600; }
    .app-confirm__message { color: var(--mat-sys-on-surface-variant); white-space: pre-line; }
    .app-confirm__actions { padding: 1rem 1.5rem 1.25rem; gap: 0.5rem; }
  `,
})
export class AppConfirmDialogComponent {
  data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
}
