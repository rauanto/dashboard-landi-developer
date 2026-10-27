import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { RoleCreate, RoleUpdate, Role } from '@core/models/role.model';
import { AppInputComponent } from '@shared/ui/components/input/input.component';
import { AppButtonComponent } from '@shared/ui/components/button/button.component';

export interface RoleDialogData {
  role?: Role;
}

@Component({
  selector: 'app-role-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatButtonModule, AppInputComponent, AppButtonComponent],
  template: `
    <div class="p-6">
      <h2 mat-dialog-title class="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
        {{ data?.role ? 'Editar Rol' : 'Crear Rol' }}
      </h2>
      
      <mat-dialog-content>
        <form [formGroup]="form" class="flex flex-col gap-6 mt-2 pt-2">
          <app-input
            label="Nombre"
            formControlName="name"
            placeholder="Ej. Administrador"
            variant="filled"
          />
          
          <app-input
            label="Descripción"
            formControlName="description"
            placeholder="Ej. Acceso total al sistema"
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
export class RoleDialog {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<RoleDialog>);
  public data: RoleDialogData = inject(MAT_DIALOG_DATA);

  form = this.fb.nonNullable.group({
    name: [this.data?.role?.name || '', [Validators.required]],
    description: [this.data?.role?.description || '']
  });

  onCancel() {
    this.dialogRef.close();
  }

  onSave() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.getRawValue());
    }
  }
}
