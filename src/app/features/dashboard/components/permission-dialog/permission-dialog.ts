import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { Permission } from '@core/models/permission.model';
import { AppInputComponent } from '@shared/ui/components/input/input.component';
import { AppButtonComponent } from '@shared/ui/components/button/button.component';
import { AppSelectComponent, SelectOption } from '@shared/ui/components/select/select.component';

export interface PermissionDialogData {
  permission?: Permission;
}

@Component({
  selector: 'app-permission-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatButtonModule, AppInputComponent, AppButtonComponent, AppSelectComponent],
  template: `
    <div class="p-6">
      <h2 mat-dialog-title class="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
        {{ data?.permission ? 'Editar Permiso' : 'Crear Permiso' }}
      </h2>
      
      <mat-dialog-content>
        <form [formGroup]="form" class="flex flex-col gap-6 mt-2 pt-2">
          <app-select
            label="Acción (Action)"
            formControlName="action_id"
            placeholder="Selecciona una acción..."
            [options]="actionOptions"
            variant="filled"
          ></app-select>
          
          <app-select
            label="Recurso (Resource)"
            formControlName="resource_id"
            placeholder="Selecciona un recurso..."
            [options]="resourceOptions"
            variant="filled"
          ></app-select>

          <app-select
            label="Grupo (Group) (Opcional)"
            formControlName="group_id"
            placeholder="Selecciona un grupo..."
            [options]="groupOptions"
            variant="filled"
          ></app-select>

          <app-input
            label="Descripción"
            formControlName="description"
            placeholder="Ej. Permiso de escritura"
            variant="filled"
          />
        </form>
      </mat-dialog-content>
      
      <mat-dialog-actions align="end" class="mt-6 flex gap-2">
        <button appButton variant="outlined" (click)="onCancel()">Cancelar</button>
        <button appButton variant="filled" color="primary" (click)="onSave()" [disabled]="form.invalid">Guardar</button>
      </mat-dialog-actions>
    </div>
  `
})
export class PermissionDialog {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<PermissionDialog>);
  public data: PermissionDialogData = inject(MAT_DIALOG_DATA);

  form = this.fb.nonNullable.group({
    action_id: [this.data?.permission?.action_id || '', [Validators.required]],
    resource_id: [this.data?.permission?.resource_id || '', [Validators.required]],
    group_id: [this.data?.permission?.group_id || ''],
    description: [this.data?.permission?.description || '']
  });

  // Mocked options for demonstration until backend endpoints exist
  actionOptions: SelectOption[] = [
    { label: 'Crear (Create)', value: '11111111-1111-1111-1111-111111111111' },
    { label: 'Leer (Read)', value: '22222222-2222-2222-2222-222222222222' },
    { label: 'Actualizar (Update)', value: '33333333-3333-3333-3333-333333333333' },
    { label: 'Eliminar (Delete)', value: '44444444-4444-4444-4444-444444444444' },
    { label: 'Gestionar (Manage)', value: '55555555-5555-5555-5555-555555555555' }
  ];

  resourceOptions: SelectOption[] = [
    { label: 'Usuarios (Users)', value: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' },
    { label: 'Roles (Roles)', value: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' },
    { label: 'Permisos (Permissions)', value: 'cccccccc-cccc-cccc-cccc-cccccccccccc' },
    { label: 'Reportes (Reports)', value: 'dddddddd-dddd-dddd-dddd-dddddddddddd' }
  ];

  groupOptions: SelectOption[] = [
    { label: 'Sin Grupo (None)', value: '' },
    { label: 'Administración', value: '10000000-0000-0000-0000-000000000000' },
    { label: 'Operaciones', value: '20000000-0000-0000-0000-000000000000' },
    { label: 'Finanzas', value: '30000000-0000-0000-0000-000000000000' }
  ];

  onCancel() {
    this.dialogRef.close();
  }

  onSave() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.getRawValue());
    }
  }
}
