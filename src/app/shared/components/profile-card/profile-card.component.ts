import { Component, inject, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { AccountPanelComponent } from '@shared/components/account-panel/account-panel.component';
import { AuthService } from '@core/services/auth.service';
import { SidenavService } from '@shared/services/sidenav.service';

@Component({
  selector: 'app-profile-card',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatDialogModule, MatButtonModule, MatTooltipModule],
  templateUrl: './profile-card.component.html',
  styleUrl: './profile-card.component.css'
})
export class ProfileCardComponent {
  private dialog = inject(MatDialog);
  private authService = inject(AuthService);
  public sidenavService = inject(SidenavService);

  // User input using signals
  user = input<any>();

  userRoleName = computed(() => {
    const u = this.user();
    if (!u) return 'Usuario';
    switch (u.TIPO_US) {
      case 0: return 'Administrador';
      case 3: return 'Promotor';
      case 4: return 'Coordinador';
      default: return 'Analista';
    }
  });

  openAccountPanel(): void {
    const currentUser = this.authService.currentUser();
    if (!currentUser) return;

    this.dialog.open(AccountPanelComponent, {
      data: { user: currentUser },
      width: '380px',
      panelClass: 'account-panel-dialog',
    });
  }
}
