import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { AppConfirmDialogComponent, ConfirmDialogData } from './confirm-dialog.component';

/**
 * if (await this.confirm.ask({ title: '¿Eliminar cliente?', message: 'No se puede deshacer', color: 'error', icon: 'delete', confirmLabel: 'Eliminar' })) { ... }
 */
@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private dialog = inject(MatDialog);

  async ask(data: ConfirmDialogData): Promise<boolean> {
    const ref = this.dialog.open<AppConfirmDialogComponent, ConfirmDialogData, boolean>(AppConfirmDialogComponent, {
      data,
      autoFocus: 'dialog',
      maxWidth: '28rem',
    });
    return (await firstValueFrom(ref.afterClosed())) === true;
  }

  /** Confirmación pensada para borrar. */
  delete(what: string): Promise<boolean> {
    return this.ask({
      title: `¿Eliminar ${what}?`,
      message: 'Esta acción no se puede deshacer.',
      confirmLabel: 'Eliminar',
      color: 'error',
      icon: 'delete_outline',
    });
  }
}
