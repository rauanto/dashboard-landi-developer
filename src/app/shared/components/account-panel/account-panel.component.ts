import { Component, inject, signal } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { Router } from '@angular/router';
import { AppAvatarComponent, AppBadgeComponent, AppButtonComponent } from '@shared/ui';
import { AuthService } from '@core/services/auth.service';
import { User } from '@core/models/user.model';

export interface AccountPanelData {
  user: User;
}

/**
 * Panel de cuenta estilo "cuenta de Google": correo, avatar, estado de
 * verificación/rol y cerrar sesión. Se abre desde ProfileCardComponent con
 * MatDialog, pasando el usuario autenticado real (AuthService.currentUser()).
 */
@Component({
  selector: 'app-account-panel',
  standalone: true,
  imports: [MatDialogModule, MatIconModule, MatDividerModule, AppAvatarComponent, AppBadgeComponent, AppButtonComponent],
  templateUrl: './account-panel.component.html',
  styleUrl: './account-panel.component.css',
})
export class AccountPanelComponent {
  private readonly dialogRef = inject(MatDialogRef<AccountPanelComponent>);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly data = inject<AccountPanelData>(MAT_DIALOG_DATA);

  public readonly user = this.data.user;
  public readonly displayName: string;
  public readonly loggingOut = signal(false);

  constructor() {
    const localPart = this.user.email.split('@')[0] ?? '';
    this.displayName = localPart.charAt(0).toUpperCase() + localPart.slice(1);
  }

  async logout(): Promise<void> {
    this.loggingOut.set(true);
    try {
      await this.authService.logout();
      this.dialogRef.close('logged-out');
      await this.router.navigate(['/auth/login']);
    } finally {
      this.loggingOut.set(false);
    }
  }
}
