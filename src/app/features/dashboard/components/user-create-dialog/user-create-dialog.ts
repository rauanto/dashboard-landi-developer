import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { AppInputComponent } from '@shared/ui/components/input/input.component';
import { AppButtonComponent } from '@shared/ui/components/button/button.component';
import { UserCreateDto } from '@core/models/auth-api.models';

@Component({
  selector: 'app-user-create-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, AppInputComponent, AppButtonComponent],
  template: `
    <div class="p-6 max-w-md w-full">
      <h2 mat-dialog-title class="text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-100">
        Registrar Usuario
      </h2>
      <p class="text-sm text-gray-500 mb-4">Ingresa las credenciales del nuevo usuario.</p>
      
      <mat-dialog-content>
        <form [formGroup]="form" class="flex flex-col gap-6 mt-2 pt-2">
          <app-input
            label="Correo Electrónico"
            type="email"
            formControlName="email"
            placeholder="ejemplo@correo.com"
            variant="filled"
          />
          
          <app-input
            label="Contraseña"
            type="password"
            formControlName="password"
            placeholder="Mínimo 8 caracteres"
            variant="filled"
          />

          <div class="flex flex-col gap-3 mt-2">
            <label class="flex items-center space-x-3 p-3 rounded-lg border-2 border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <input type="checkbox" formControlName="is_active" class="h-5 w-5 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 dark:bg-gray-800">
              <div class="flex flex-col">
                <span class="text-sm font-semibold text-gray-900 dark:text-gray-100">Activo</span>
                <span class="text-xs text-gray-500">El usuario podrá iniciar sesión.</span>
              </div>
            </label>
            
            <label class="flex items-center space-x-3 p-3 rounded-lg border-2 border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <input type="checkbox" formControlName="is_superuser" class="h-5 w-5 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 dark:bg-gray-800">
              <div class="flex flex-col">
                <span class="text-sm font-semibold text-gray-900 dark:text-gray-100">Superusuario</span>
                <span class="text-xs text-gray-500">Tendrá acceso total al sistema.</span>
              </div>
            </label>

            <label class="flex items-center space-x-3 p-3 rounded-lg border-2 border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <input type="checkbox" formControlName="is_verified" class="h-5 w-5 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 dark:bg-gray-800">
              <div class="flex flex-col">
                <span class="text-sm font-semibold text-gray-900 dark:text-gray-100">Verificado</span>
                <span class="text-xs text-gray-500">Marca el correo como verificado.</span>
              </div>
            </label>
          </div>
        </form>
      </mat-dialog-content>
      
      <mat-dialog-actions align="end" class="mt-6 flex gap-2">
        <button appButton variant="outlined" (click)="onCancel()">Cancelar</button>
        <button appButton variant="filled" color="primary" (click)="onSave()" [disabled]="form.invalid">Guardar</button>
      </mat-dialog-actions>
    </div>
  `
})
export class UserCreateDialog {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<UserCreateDialog>);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(3)]],
    is_active: [true],
    is_superuser: [false],
    is_verified: [false]
  });

  onCancel() {
    this.dialogRef.close();
  }

  onSave() {
    if (this.form.valid) {
      const payload: UserCreateDto = this.form.getRawValue();
      this.dialogRef.close(payload);
    }
  }
}
