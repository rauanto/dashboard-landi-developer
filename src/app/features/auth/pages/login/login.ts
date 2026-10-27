import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AppInputComponent, AppButtonComponent, AppCardComponent } from '@shared/ui';
import { AuthService } from '@core/services/auth.service';
import { extractAuthErrorMessage } from '@core/utils/api-error.util';

type LoginStep = 'email' | 'password';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, MatIconModule, AppInputComponent, AppButtonComponent, AppCardComponent],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  public readonly step = signal<LoginStep>('email');
  public readonly loading = signal(false);
  public readonly errorMessage = signal('');
  public readonly justRegistered = signal(this.route.snapshot.queryParamMap.get('registered') === '1');

  public readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  get emailErrorMessage(): string | null {
    const control = this.loginForm.controls.email;
    if (!control.touched) return null;
    if (control.hasError('required')) return 'El correo es requerido';
    if (control.hasError('email')) return 'Ingresa un correo válido';
    return null;
  }

  get passwordErrorMessage(): string | null {
    const control = this.loginForm.controls.password;
    if (!control.touched) return null;
    if (control.hasError('required')) return 'La contraseña es requerida';
    if (control.hasError('minlength')) return 'Debe tener al menos 6 caracteres';
    return null;
  }

  continueWithEmail(): void {
    const emailControl = this.loginForm.controls.email;
    emailControl.markAsTouched();
    if (emailControl.invalid) return;

    this.errorMessage.set('');
    this.step.set('password');
  }

  goBackToEmail(): void {
    this.step.set('email');
    this.loginForm.controls.password.reset();
    this.errorMessage.set('');
  }

  async onSubmit() {
    if (this.step() === 'email') {
      this.continueWithEmail();
      return;
    }

    const passwordControl = this.loginForm.controls.password;
    passwordControl.markAsTouched();
    if (passwordControl.invalid) return;

    this.loading.set(true);
    this.errorMessage.set('');
    this.justRegistered.set(false);

    try {
      const { email, password } = this.loginForm.getRawValue();
      await this.authService.login(email, password);

      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
      await this.router.navigateByUrl(returnUrl && !returnUrl.startsWith('/auth') ? returnUrl : '/dashboard');
    } catch (error) {
      this.errorMessage.set(extractAuthErrorMessage(error));
    } finally {
      this.loading.set(false);
    }
  }
}
