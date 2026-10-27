import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AppInputComponent, AppButtonComponent, AppCardComponent } from '@shared/ui';
import { AuthService } from '@core/services/auth.service';
import { extractAuthErrorMessage } from '@core/utils/api-error.util';

function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return password && confirmPassword && password !== confirmPassword ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, MatIconModule, AppInputComponent, AppButtonComponent, AppCardComponent],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  public readonly loading = signal(false);
  public readonly errorMessage = signal('');

  public readonly registerForm = this.fb.nonNullable.group(
    {
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordsMatchValidator },
  );

  get emailErrorMessage(): string | null {
    const control = this.registerForm.controls.email;
    if (!control.touched) return null;
    if (control.hasError('required')) return 'El correo es requerido';
    if (control.hasError('email')) return 'Ingresa un correo válido';
    return null;
  }

  get passwordErrorMessage(): string | null {
    const control = this.registerForm.controls.password;
    if (!control.touched) return null;
    if (control.hasError('required')) return 'La contraseña es requerida';
    if (control.hasError('minlength')) return 'Debe tener al menos 6 caracteres';
    return null;
  }

  get confirmPasswordErrorMessage(): string | null {
    const control = this.registerForm.controls.confirmPassword;
    if (!control.touched) return null;
    if (control.hasError('required')) return 'Confirma tu contraseña';
    if (this.registerForm.hasError('passwordMismatch')) return 'Las contraseñas no coinciden';
    return null;
  }

  async onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    try {
      const { email, password } = this.registerForm.getRawValue();
      await this.authService.register(email, password);
      await this.router.navigate(['/auth/login'], { queryParams: { registered: '1' } });
    } catch (error) {
      this.errorMessage.set(extractAuthErrorMessage(error));
    } finally {
      this.loading.set(false);
    }
  }
}
