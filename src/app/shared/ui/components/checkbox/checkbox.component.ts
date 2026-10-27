import { Component, ChangeDetectionStrategy, computed, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

export type CheckboxColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'success'
  | 'warning'
  | 'info'
  | 'error';
export type CheckboxSize = 'sm' | 'md' | 'lg';

/**
 * Checkbox M3 (boolean). ControlValueAccessor -> formControl / ngModel.
 *
 * <app-checkbox formControlName="terminos" [required]="true">Acepto los términos</app-checkbox>
 */
@Component({
  selector: 'app-checkbox',
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AppCheckboxComponent), multi: true },
  ],
  host: {
    class: 'app-checkbox-host',
    '[class]': 'hostClasses()',
  },
  template: `
    <label class="app-checkbox__wrap">
      <input
        type="checkbox"
        class="app-checkbox__native"
        [checked]="checked()"
        [indeterminate]="indeterminate()"
        [disabled]="effectiveDisabled()"
        [attr.aria-invalid]="hasError()"
        [attr.aria-required]="required() ? true : null"
        (change)="onToggle($event)"
        (blur)="onBlur()"
      />
      <span class="app-checkbox__box">
        <mat-icon class="app-checkbox__icon">{{ indeterminate() ? 'remove' : 'check' }}</mat-icon>
      </span>
      <span class="app-checkbox__label">
        <ng-content />{{ label() }}{{ required() ? ' *' : '' }}
      </span>
    </label>

    @if (effectiveError(); as err) {
      <span class="app-checkbox__helper app-checkbox__helper--error" role="alert">{{ err }}</span>
    } @else if (hint(); as h) {
      <span class="app-checkbox__helper">{{ h }}</span>
    }
  `,
  styleUrl: './checkbox.component.scss',
})
export class AppCheckboxComponent implements ControlValueAccessor {
  label = input<string | null>(null);
  color = input<CheckboxColor>('primary');
  size = input<CheckboxSize>('md');
  hint = input<string | null>(null);
  errorMessage = input<string | null>(null);
  indeterminate = input(false);
  /** Requerido = debe estar marcado. */
  required = input(false);
  requiredErrorMessage = input('Este campo es requerido');
  disabled = input(false);

  checked = signal(false);
  touched = signal(false);
  private cvaDisabled = signal(false);

  private onChange: (v: boolean) => void = () => {};
  private onTouched: () => void = () => {};

  effectiveDisabled = computed(() => this.disabled() || this.cvaDisabled());
  requiredError = computed(() =>
    this.required() && this.touched() && !this.checked() ? this.requiredErrorMessage() : null
  );
  effectiveError = computed(() => this.errorMessage() || this.requiredError());
  hasError = computed(() => !!this.effectiveError());

  hostClasses = computed(() =>
    [
      `app-checkbox--${this.size()}`,
      `app-checkbox--${this.hasError() ? 'error' : this.color()}`,
      this.effectiveDisabled() ? 'app-checkbox--disabled' : '',
      this.checked() || this.indeterminate() ? 'app-checkbox--checked' : '',
    ]
      .filter(Boolean)
      .join(' ')
  );

  writeValue(value: boolean | null): void {
    this.checked.set(!!value);
  }
  registerOnChange(fn: (v: boolean) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  onToggle(event: Event): void {
    const value = (event.target as HTMLInputElement).checked;
    this.checked.set(value);
    this.onChange(value);
  }

  onBlur(): void {
    this.touched.set(true);
    this.onTouched();
  }
}
