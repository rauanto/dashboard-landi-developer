import { Component, ChangeDetectionStrategy, computed, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SelectOption } from '../select/select.types';
import { AppCheckboxComponent, CheckboxColor, CheckboxSize } from './checkbox.component';

/**
 * Grupo de checkboxes. El valor es un arreglo con los `value` de las opciones marcadas.
 *
 * <app-checkbox-group formControlName="dias" label="Días" [options]="dias" direction="horizontal" />
 */
@Component({
  selector: 'app-checkbox-group',
  imports: [FormsModule, AppCheckboxComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AppCheckboxGroupComponent), multi: true },
  ],
  host: { class: 'app-checkbox-group-host' },
  template: `
    <div class="app-checkbox-group" role="group" [attr.aria-label]="label()" (focusout)="onBlur()">
      @if (label(); as l) {
        <span class="app-checkbox-group__label" [class.app-checkbox-group__label--error]="hasError()">
          {{ l }}{{ required() ? ' *' : '' }}
        </span>
      }

      <div
        class="app-checkbox-group__items"
        [class.app-checkbox-group__items--horizontal]="direction() === 'horizontal'"
      >
        @for (option of options(); track option.value) {
          <app-checkbox
            [ngModel]="isChecked(option.value)"
            (ngModelChange)="toggle(option.value, $event)"
            [ngModelOptions]="{ standalone: true }"
            [color]="hasError() ? 'error' : color()"
            [size]="size()"
            [disabled]="effectiveDisabled() || !!option.disabled || isMaxReached(option.value)"
          >
            {{ option.label }}
          </app-checkbox>
        }
      </div>

      @if (effectiveError(); as err) {
        <span class="app-checkbox-group__helper app-checkbox-group__helper--error" role="alert">{{ err }}</span>
      } @else if (hint(); as h) {
        <span class="app-checkbox-group__helper">{{ h }}</span>
      }
    </div>
  `,
  styles: `
    :host { display: block; font-family: inherit; }
    .app-checkbox-group { display: flex; flex-direction: column; gap: 0.5rem; }
    .app-checkbox-group__label {
      font-size: 0.8125rem; font-weight: 500; color: var(--mat-sys-on-surface-variant);
      &--error { color: var(--app-error); }
    }
    .app-checkbox-group__items {
      display: flex; flex-direction: column; gap: 0.5rem;
      &--horizontal { flex-direction: row; flex-wrap: wrap; gap: 0.5rem 1.5rem; }
    }
    .app-checkbox-group__helper {
      font-size: 0.75rem; color: var(--mat-sys-on-surface-variant);
      &--error { color: var(--app-error); }
    }
  `,
})
export class AppCheckboxGroupComponent implements ControlValueAccessor {
  label = input<string | null>(null);
  options = input<SelectOption[]>([]);
  direction = input<'vertical' | 'horizontal'>('vertical');
  color = input<CheckboxColor>('primary');
  size = input<CheckboxSize>('md');
  hint = input<string | null>(null);
  errorMessage = input<string | null>(null);
  required = input(false);
  requiredErrorMessage = input('Selecciona al menos una opción');
  /** Máximo de opciones seleccionables (las demás se deshabilitan). */
  maxSelected = input<number | null>(null);
  disabled = input(false);

  value = signal<unknown[]>([]);
  touched = signal(false);
  private cvaDisabled = signal(false);

  private onChange: (v: unknown[]) => void = () => {};
  private onTouched: () => void = () => {};

  effectiveDisabled = computed(() => this.disabled() || this.cvaDisabled());
  requiredError = computed(() =>
    this.required() && this.touched() && this.value().length === 0 ? this.requiredErrorMessage() : null
  );
  effectiveError = computed(() => this.errorMessage() || this.requiredError());
  hasError = computed(() => !!this.effectiveError());

  isChecked(v: unknown): boolean {
    return this.value().includes(v);
  }

  isMaxReached(v: unknown): boolean {
    const max = this.maxSelected();
    return max !== null && this.value().length >= max && !this.isChecked(v);
  }

  toggle(v: unknown, checked: boolean): void {
    const next = checked
      ? this.isChecked(v) ? this.value() : [...this.value(), v]
      : this.value().filter((x) => x !== v);
    this.value.set(next);
    this.onChange(next);
  }

  onBlur(): void {
    this.touched.set(true);
    this.onTouched();
  }

  writeValue(value: unknown[] | null): void {
    this.value.set(Array.isArray(value) ? value : []);
  }
  registerOnChange(fn: (v: unknown[]) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }
}
