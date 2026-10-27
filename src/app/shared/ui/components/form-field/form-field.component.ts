import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  effect,
  input,
  signal,
} from '@angular/core';
import { NgControl, Validators } from '@angular/forms';

export type FormFieldErrorMessages = Record<string, string | ((error: any) => string)>;

const DEFAULT_ERRORS: FormFieldErrorMessages = {
  required: 'Este campo es requerido',
  email: 'Correo electrónico inválido',
  minlength: (e) => `Mínimo ${e.requiredLength} caracteres (${e.actualLength}/${e.requiredLength})`,
  maxlength: (e) => `Máximo ${e.requiredLength} caracteres`,
  min: (e) => `El valor mínimo es ${e.min}`,
  max: (e) => `El valor máximo es ${e.max}`,
  pattern: 'Formato inválido',
};

/**
 * Equivalente a `mat-form-field` para los controles `app-*` (input, select,
 * searchable-select, multi-select, autocomplete, otp-input, file-upload...).
 *
 * Detecta el `NgControl` del control proyectado (formControl / formControlName /
 * ngModel) y se encarga de: label, asterisco de requerido, hint y mensaje de error
 * automático (touched + invalid).
 *
 * Importante: al usarlo dentro, NO pases `label`, `hint`, `errorMessage` ni
 * `required` al control interno, para no duplicarlos.
 *
 * <app-form-field label="Correo" hint="Usa tu correo corporativo">
 *   <app-input formControlName="email" type="email" />
 * </app-form-field>
 */
@Component({
  selector: 'app-form-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-form-field',
    '[class.app-form-field--error]': 'hasError()',
    '[class.app-form-field--disabled]': 'disabled()',
  },
  template: `
    @if (label(); as l) {
      <label class="app-form-field__label">
        {{ l }}@if (isRequired()) {<span class="app-form-field__asterisk"> *</span>}
      </label>
    }

    <div class="app-form-field__control">
      <ng-content />
    </div>

    <div class="app-form-field__footer">
      @if (error(); as err) {
        <span class="app-form-field__helper app-form-field__helper--error" role="alert">{{ err }}</span>
      } @else if (hint(); as h) {
        <span class="app-form-field__helper">{{ h }}</span>
      }
    </div>
  `,
  styleUrl: './form-field.component.scss',
})
export class AppFormFieldComponent {
  label = input<string | null>(null);
  hint = input<string | null>(null);
  /** Mensajes por clave de error; se mezclan con los defaults. */
  errors = input<FormFieldErrorMessages>({});
  /** Fuerza el asterisco aunque no haya Validators.required. */
  required = input(false);
  /** Mostrar errores también cuando el control está dirty (sin esperar blur). */
  showErrorsOnDirty = input(false);

  private ngControl = contentChild(NgControl);
  private tick = signal(0);

  constructor() {
    effect((onCleanup) => {
      const control = this.ngControl()?.control;
      if (!control) return;
      const sub = control.events.subscribe(() => this.tick.update((v) => v + 1));
      onCleanup(() => sub.unsubscribe());
    });
  }

  isRequired = computed(() => {
    this.tick();
    const control = this.ngControl()?.control;
    return this.required() || !!control?.hasValidator(Validators.required);
  });

  disabled = computed(() => {
    this.tick();
    return !!this.ngControl()?.control?.disabled;
  });

  error = computed(() => {
    this.tick();
    const control = this.ngControl()?.control;
    if (!control || !control.errors) return null;
    if (!(control.touched || (this.showErrorsOnDirty() && control.dirty))) {
      return null;
    }

    const messages = { ...DEFAULT_ERRORS, ...this.errors() };
    const [key, value] = Object.entries(control.errors)[0];
    const msg = messages[key];
    if (typeof msg === 'function') return msg(value);
    if (msg) return msg;
    if (typeof value === 'string') return value;
    if (value && typeof value.message === 'string') return value.message;
    return 'Valor inválido';
  });

  hasError = computed(() => !!this.error());
}
