import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { PermissionService } from '@core/services/permission.service';
import { Permission } from '@core/models/permission.model';
import { AppCardComponent } from '@shared/ui/components/card/card.component';
import { AppButtonComponent } from '@shared/ui/components/button/button.component';
import { AppBadgeComponent } from '@shared/ui/components/badge/badge.component';
import { PermissionDialog } from '../../components/permission-dialog/permission-dialog';

@Component({
  selector: 'app-permissions-page',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatIconModule, MatTableModule, AppButtonComponent, AppBadgeComponent],
  template: `
    <div class="h-full flex flex-col p-6 animate-fade-in gap-6">
      <div class="flex justify-between items-center bg-[var(--mat-sys-surface)] p-6 rounded-2xl shadow-sm border border-[var(--mat-sys-outline-variant)]">
        <div>
          <h1 class="text-3xl font-bold text-[var(--mat-sys-on-surface)]">
            Permisos
          </h1>
          <p class="text-[var(--mat-sys-on-surface-variant)] mt-1">
            Gestiona los permisos granulares disponibles en el sistema
          </p>
        </div>
        <button appButton variant="filled" color="primary" (click)="openPermissionDialog()">
          <mat-icon class="mr-2">add</mat-icon> Nuevo Permiso
        </button>
      </div>

      <div class="flex-1 bg-[var(--mat-sys-surface)] rounded-2xl shadow-sm border border-[var(--mat-sys-outline-variant)] overflow-hidden">
        @if (permissionService.loading() && permissionService.permissions().length === 0) {
          <div class="flex justify-center items-center h-32">
            <span class="text-[var(--mat-sys-on-surface-variant)]">Cargando permisos...</span>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table mat-table [dataSource]="permissionService.permissions()" class="w-full">
              
              <!-- Action Column -->
              <ng-container matColumnDef="action">
                <th mat-header-cell *matHeaderCellDef class="text-[var(--mat-sys-on-surface)] font-semibold uppercase tracking-wider text-xs border-r border-[var(--mat-sys-outline-variant)] px-4">Acción</th>
                <td mat-cell *matCellDef="let perm" class="py-3">
                  <app-badge variant="tonal" color="primary">{{ perm.action?.name || perm.name || 'N/A' }}</app-badge>
                </td>
              </ng-container>

              <!-- Resource Column -->
              <ng-container matColumnDef="resource">
                <th mat-header-cell *matHeaderCellDef class="text-[var(--mat-sys-on-surface)] font-semibold uppercase tracking-wider text-xs border-r border-[var(--mat-sys-outline-variant)] px-4">Recurso</th>
                <td mat-cell *matCellDef="let perm" class="py-3">
                  <span class="text-[var(--mat-sys-on-surface)] font-medium">{{ perm.resource?.name || 'N/A' }}</span>
                </td>
              </ng-container>

              <!-- Group Column -->
              <ng-container matColumnDef="group">
                <th mat-header-cell *matHeaderCellDef class="text-[var(--mat-sys-on-surface)] font-semibold uppercase tracking-wider text-xs border-r border-[var(--mat-sys-outline-variant)] px-4">Grupo</th>
                <td mat-cell *matCellDef="let perm" class="py-3">
                  @if (perm.group?.name) {
                    <app-badge variant="outlined" color="neutral">{{ perm.group.name }}</app-badge>
                  } @else {
                    <span class="text-[var(--mat-sys-on-surface-variant)] italic text-sm opacity-70">Sin Grupo</span>
                  }
                </td>
              </ng-container>

              <!-- Description Column -->
              <ng-container matColumnDef="description">
                <th mat-header-cell *matHeaderCellDef class="text-[var(--mat-sys-on-surface)] font-semibold uppercase tracking-wider text-xs border-r border-[var(--mat-sys-outline-variant)] px-4">Descripción</th>
                <td mat-cell *matCellDef="let perm" class="py-3 text-sm text-[var(--mat-sys-on-surface-variant)]">
                  {{ perm.description || '—' }}
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef class="w-24 text-right text-[var(--mat-sys-on-surface)] font-semibold uppercase tracking-wider text-xs px-4"></th>
                <td mat-cell *matCellDef="let perm" class="py-3 text-right">
                  <div class="flex justify-end gap-1">
                    <button mat-icon-button color="primary" class="h-8 w-8 leading-8" (click)="openPermissionDialog(perm)">
                      <mat-icon class="text-sm">edit</mat-icon>
                    </button>
                    <button mat-icon-button color="warn" class="h-8 w-8 leading-8" (click)="deletePermission(perm)">
                      <mat-icon class="text-sm">delete</mat-icon>
                    </button>
                  </div>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns" class="bg-[var(--mat-sys-primary-container)] border-b-2 border-[var(--mat-sys-outline-variant)]"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="hover:bg-[var(--mat-sys-surface-variant)] transition-colors"></tr>
            </table>
          </div>
        }
      </div>
    </div>
  `
})
export class PermissionsPage implements OnInit {
  public permissionService = inject(PermissionService);
  private dialog = inject(MatDialog);
  public displayedColumns: string[] = ['action', 'resource', 'group', 'description', 'actions'];

  ngOnInit() {
    this.permissionService.loadPermissions();
  }

  openPermissionDialog(permission?: Permission) {
    const dialogRef = this.dialog.open(PermissionDialog, {
      width: '400px',
      data: { permission }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (permission) {
          this.permissionService.updatePermission(permission.id, result);
        } else {
          this.permissionService.createPermission(result);
        }
      }
    });
  }

  deletePermission(permission: Permission) {
    if (confirm(`¿Estás seguro de que deseas eliminar el permiso "${permission.name}"?`)) {
      this.permissionService.deletePermission(permission.id);
    }
  }
}
