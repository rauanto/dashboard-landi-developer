import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { Role } from '@core/models/role.model';
import { Permission } from '@core/models/permission.model';
import { PermissionService } from '@core/services/permission.service';
import { AppButtonComponent } from '@shared/ui/components/button/button.component';

export interface AssignPermissionsData {
  role: Role;
}

@Component({
  selector: 'app-assign-permissions-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, AppButtonComponent],
  template: `
    <div class="p-6">
      <h2 mat-dialog-title class="text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-100">
        Permisos para {{ data.role.name }}
      </h2>
      <p class="text-sm text-gray-500 mb-4">Selecciona los permisos que deseas asignar a este rol.</p>
      
      <mat-dialog-content>
        @if (permissionService.loading()) {
          <div class="flex justify-center p-4">
            <span class="text-gray-500">Cargando permisos...</span>
          </div>
        } @else {
          <div class="flex flex-col gap-3 max-h-96 overflow-y-auto pr-2">
            @for (perm of permissionService.permissions(); track perm.id) {
              <label 
                class="flex items-start space-x-4 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer"
                [class.border-indigo-500]="isSelected(perm.id)"
                [class.bg-indigo-50]="isSelected(perm.id)"
                [class.dark:bg-indigo-900]="isSelected(perm.id)"
                [class.dark:bg-opacity-20]="isSelected(perm.id)"
                [class.border-gray-100]="!isSelected(perm.id)"
                [class.dark:border-gray-700]="!isSelected(perm.id)"
                [class.hover:border-indigo-300]="!isSelected(perm.id)"
                [class.dark:hover:border-indigo-500]="!isSelected(perm.id)"
              >
                <div class="flex-shrink-0 mt-0.5">
                  <input 
                    type="checkbox" 
                    [checked]="isSelected(perm.id)"
                    (change)="toggleSelection(perm.id)"
                    class="h-5 w-5 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 dark:bg-gray-800"
                  >
                </div>
                <div class="flex flex-col flex-1">
                  <span class="text-sm font-semibold" 
                    [class.text-indigo-900]="isSelected(perm.id)"
                    [class.dark:text-indigo-100]="isSelected(perm.id)"
                    [class.text-gray-900]="!isSelected(perm.id)"
                    [class.dark:text-gray-200]="!isSelected(perm.id)"
                  >
                    {{ perm.name }}
                  </span>
                  @if (perm.description) {
                    <span class="text-xs mt-1"
                      [class.text-indigo-700]="isSelected(perm.id)"
                      [class.dark:text-indigo-300]="isSelected(perm.id)"
                      [class.text-gray-500]="!isSelected(perm.id)"
                      [class.dark:text-gray-400]="!isSelected(perm.id)"
                    >
                      {{ perm.description }}
                    </span>
                  }
                </div>
              </label>
            }
          </div>
        }
      </mat-dialog-content>
      
      <mat-dialog-actions align="end" class="mt-6 flex gap-2">
        <button appButton variant="outlined" (click)="onCancel()">Cancelar</button>
        <button appButton variant="filled" color="primary" (click)="onSave()">Guardar Cambios</button>
      </mat-dialog-actions>
    </div>
  `
})
export class AssignPermissionsDialog implements OnInit {
  private dialogRef = inject(MatDialogRef<AssignPermissionsDialog>);
  public data: AssignPermissionsData = inject(MAT_DIALOG_DATA);
  public permissionService = inject(PermissionService);

  selectedIds = signal<Set<string>>(new Set());

  ngOnInit() {
    // Inicializar seleccionados basados en el rol
    const initialSet = new Set<string>();
    this.data.role.permissions.forEach(p => initialSet.add(p.id));
    this.selectedIds.set(initialSet);
    
    // Cargar todos los permisos disponibles
    this.permissionService.loadPermissions();
  }

  isSelected(id: string): boolean {
    return this.selectedIds().has(id);
  }

  toggleSelection(id: string) {
    const current = new Set(this.selectedIds());
    if (current.has(id)) {
      current.delete(id);
    } else {
      current.add(id);
    }
    this.selectedIds.set(current);
  }

  onCancel() {
    this.dialogRef.close();
  }

  onSave() {
    const originalSet = new Set(this.data.role.permissions.map(p => p.id));
    const newSet = this.selectedIds();

    const toAdd = Array.from(newSet).filter(id => !originalSet.has(id));
    const toRemove = Array.from(originalSet).filter(id => !newSet.has(id));

    this.dialogRef.close({ toAdd, toRemove });
  }
}
