import { Component, inject, OnInit, ViewContainerRef, TemplateRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { RoleService } from '@core/services/role.service';
import { Role } from '@core/models/role.model';
import { AppButtonComponent } from '@shared/ui/components/button/button.component';
import { AppBadgeComponent } from '@shared/ui/components/badge/badge.component';
import { UserCreateDialog } from '../../components/user-create-dialog/user-create-dialog';
import { UserService } from '@core/services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RoleDialog } from '../../components/role-dialog/role-dialog';
import { AssignPermissionsDialog } from '../../components/assign-permissions-dialog/assign-permissions-dialog';
import { GlobalSidenavService } from '@shared/services/global-sidenav.service';
import { TemplatePortal } from '@angular/cdk/portal';

@Component({
  selector: 'app-roles-page',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatIconModule, MatTableModule, AppButtonComponent, AppBadgeComponent],
  template: `
    <div class="h-full flex flex-col p-6 animate-fade-in gap-6">
      <div class="flex justify-between items-center bg-[var(--mat-sys-surface)] p-6 rounded-2xl shadow-sm border border-[var(--mat-sys-outline-variant)]">
        <div>
          <h1 class="text-3xl font-bold text-[var(--mat-sys-on-surface)]">
            Roles
          </h1>
          <p class="text-[var(--mat-sys-on-surface-variant)] mt-1">
            Gestiona los roles del sistema y sus permisos asociados
          </p>
        </div>
        <div class="flex gap-2">
          <button appButton variant="outlined" color="primary" (click)="openUserDialog()">
            <mat-icon class="mr-2">person_add</mat-icon> Registrar Usuario
          </button>
          <button appButton variant="filled" color="primary" (click)="openRoleDialog()">
            <mat-icon class="mr-2">add</mat-icon> Nuevo Rol
          </button>
        </div>
      </div>

      <div class="flex-1 bg-[var(--mat-sys-surface)] rounded-2xl shadow-sm border border-[var(--mat-sys-outline-variant)] overflow-hidden">
        @if (roleService.loading() && roleService.roles().length === 0) {
          <div class="flex justify-center items-center h-32">
            <span class="text-[var(--mat-sys-on-surface-variant)]">Cargando roles...</span>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table mat-table [dataSource]="roleService.roles()" class="w-full">
              
              <!-- Name Column -->
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef class="text-[var(--mat-sys-on-surface)] font-semibold uppercase tracking-wider text-xs border-r border-[var(--mat-sys-outline-variant)] px-4">Nombre</th>
                <td mat-cell *matCellDef="let role" class="py-4">
                  <span class="font-bold text-[var(--mat-sys-on-surface)]">{{ role.name }}</span>
                </td>
              </ng-container>

              <!-- Description Column -->
              <ng-container matColumnDef="description">
                <th mat-header-cell *matHeaderCellDef class="text-[var(--mat-sys-on-surface)] font-semibold uppercase tracking-wider text-xs border-r border-[var(--mat-sys-outline-variant)] px-4">Descripción</th>
                <td mat-cell *matCellDef="let role" class="py-4 text-sm text-[var(--mat-sys-on-surface-variant)]">
                  {{ role.description || '—' }}
                </td>
              </ng-container>

              <!-- Permissions Column -->
              <ng-container matColumnDef="permissions">
                <th mat-header-cell *matHeaderCellDef class="text-[var(--mat-sys-on-surface)] font-semibold uppercase tracking-wider text-xs border-r border-[var(--mat-sys-outline-variant)] px-4">Permisos</th>
                <td mat-cell *matCellDef="let role" class="py-4">
                  <div class="flex flex-wrap gap-2">
                    @for (perm of role.permissions.slice(0, 3); track perm.id) {
                      <app-badge variant="tonal" color="info">{{ perm.action?.name || perm.name || 'Permiso' }}</app-badge>
                    }
                    @if (role.permissions.length > 3) {
                      <app-badge variant="tonal" color="neutral">+{{ role.permissions.length - 3 }} más</app-badge>
                    }
                    @if (role.permissions.length === 0) {
                      <span class="text-sm text-[var(--mat-sys-on-surface-variant)] italic opacity-70">Ninguno</span>
                    }
                  </div>
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef class="w-48 text-right text-[var(--mat-sys-on-surface)] font-semibold uppercase tracking-wider text-xs px-4"></th>
                <td mat-cell *matCellDef="let role" class="py-4 text-right">
                  <div class="flex justify-end gap-1">
                    <button mat-icon-button color="primary" matTooltip="Gestionar Permisos" (click)="openAssignPermissionsDialog(role)">
                      <mat-icon class="text-sm">security</mat-icon>
                    </button>
                    <button mat-icon-button color="primary" (click)="openRoleDialog(role)">
                      <mat-icon class="text-sm">edit</mat-icon>
                    </button>
                    <button mat-icon-button color="warn" (click)="deleteRole(role)">
                      <mat-icon class="text-sm">delete</mat-icon>
                    </button>
                  </div>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns" class="bg-[var(--mat-sys-primary-container)] border-b-2 border-[var(--mat-sys-outline-variant)]"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="hover:bg-[var(--mat-sys-surface-variant)] transition-colors group"></tr>
            </table>
          </div>
        }
      </div>
    </div>
  `
})
export class RolesPage implements OnInit, AfterViewInit, OnDestroy {
  public roleService = inject(RoleService);
  private dialog = inject(MatDialog);
  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);
  public globalSidenav = inject(GlobalSidenavService);
  private viewContainerRef = inject(ViewContainerRef);
  public displayedColumns: string[] = ['name', 'description', 'permissions', 'actions'];

  ngOnInit() {
    this.roleService.loadRoles();
  }

  ngAfterViewInit() {
    // Si necesitas un sidebar extra, puedes usar el globalSidenav
  }

  ngOnDestroy() {
    this.globalSidenav.clearContent();
  }

  openRoleDialog(role?: Role) {
    const dialogRef = this.dialog.open(RoleDialog, {
      width: '400px',
      data: { role }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (role) {
          this.roleService.updateRole(role.id, result);
        } else {
          this.roleService.createRole(result);
        }
      }
    });
  }

  deleteRole(role: Role) {
    if (confirm(`¿Estás seguro de que deseas eliminar el rol "${role.name}"?`)) {
      this.roleService.deleteRole(role.id);
    }
  }

  openAssignPermissionsDialog(role: Role) {
    const dialogRef = this.dialog.open(AssignPermissionsDialog, {
      width: '500px',
      data: { role }
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        // Procesar las adiciones
        for (const permId of result.toAdd) {
          await this.roleService.assignPermission(role.id, permId);
        }
        // Procesar las remociones
        for (const permId of result.toRemove) {
          await this.roleService.removePermission(role.id, permId);
        }
      }
    });
  }

  openUserDialog() {
    const dialogRef = this.dialog.open(UserCreateDialog, {
      width: '450px'
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        try {
          await this.userService.createUser(result);
          this.snackBar.open('Usuario registrado exitosamente', 'Cerrar', { duration: 3000 });
        } catch (err: any) {
          this.snackBar.open('Error al registrar usuario: ' + err.message, 'Cerrar', { duration: 5000 });
        }
      }
    });
  }
}
