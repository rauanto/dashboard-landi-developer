import { Component, ChangeDetectionStrategy, computed, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { SelectOption } from '../select/select.types';

export type ButtonToggleColor = 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'info' | 'error';
export type ButtonToggleSize = 'sm' | 'md' | 'lg';

/**
 * Segmented button (selección única o múltiple).
 *  - single: value = valor de la opción
 *  - [multiple]="true": value = arreglo de valores
 *
 * <app-button-toggle formControlName="frecuencia" label="Frecuencia" [options]="frecuencias" />
 */
@Component({
  selector: 'app-button-toggle',
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AppButtonToggleComponent), multi: true }],
  host: { class: 'app-toggle-group-host', '[class]': 'hostClasses()' },
  template: `
    @if (label(); as l) {
      <span class="app-toggle-group__label">{{ l }}{{ required() ? ' *' : '' }}</span>
    }

    <div class="app-toggle-group" role="group" [attr.aria-label]="label()" (focusout)="onBlur()">
      @for (option of options(); track option.value) {
        <button
          type="button"
          class="app-toggle-group__btn"
          [class.app-toggle-group__btn--selected]="isSelected(option.value)"
          [attr.aria-pressed]="isSelected(option.value)"
          [disabled]="effectiveDisabled() || !!option.disabled"
          (click)="toggle(option.value)"
        >
          @if (isSelected(option.value) && showCheck()) {
            <mat-icon class="app-toggle-group__icon">check</mat-icon>
          } @else if (option.icon) {
            <mat-icon class="app-toggle-group__icon">{{ option.icon }}</mat-icon>
          }
          <span>{{ option.label }}</span>
        </button>
      }
    </div>

    @if (effectiveError(); as err) {
      <span class="app-toggle-group__helper app-toggle-group__helper--error" role="alert">{{ err }}</span>
    } @else if (hint(); as h) {
      <span class="app-toggle-group__helper">{{ h }}</span>
    }
  `,
  styleUrl: './button-toggle.component.scss',
})
export class AppButtonToggleComponent implements ControlValueAccessor {
  label = input<string | null>(null);
  options = input<SelectOption[]>([]);
  multiple = input(false);
  /** Permite des-seleccionar en modo simple. */
  allowEmpty = input(false);
  showCheck = input(true);
  color = input<ButtonToggleColor>('primary');
  size = input<ButtonToggleSize>('md');
  fullWidth = input(false);
  hint = input<string | null>(null);
  errorMessage = input<string | null>(null);
  required = input(false);
  requiredErrorMessage = input('Selecciona una opción');
  disabled = input(false);

  value = signal<unknown>(null);
  touched = signal(false);
  private cvaDisabled = signal(false);

  private onChange: (v: unknown) => void = () => {};
  private onTouched: () => void = () => {};

  effectiveDisabled = computed(() => this.disabled() || this.cvaDisabled());
  hasValue = computed(() => {
    const v = this.value();
    return Array.isArray(v) ? v.length > 0 : v !== null && v !== undefined && v !== '';
  });
  requiredError = computed(() =>
    this.required() && this.touched() && !this.hasValue() ? this.requiredErrorMessage() : null
  );
  effectiveError = computed(() => this.errorMessage() || this.requiredError());
  hasError = computed(() => !!this.effectiveError());

  hostClasses = computed(() =>
    [
      `app-toggle-group--${this.size()}`,
      `app-toggle-group--${this.hasError() ? 'error' : this.color()}`,
      this.fullWidth() ? 'app-toggle-group--full' : '',
      this.effectiveDisabled() ? 'app-toggle-group--disabled' : '',
    ]
      .filter(Boolean)
      .join(' ')
  );

  isSelected(v: unknown): boolean {
    const cur = this.value();
    return Array.isArray(cur) ? cur.includes(v) : cur === v;
  }

  toggle(v: unknown): void {
    let next: unknown;
    if (this.multiple()) {
      const cur = Array.isArray(this.value()) ? (this.value() as unknown[]) : [];
      next = cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v];
    } else {
      next = this.isSelected(v) ? (this.allowEmpty() ? null : v) : v;
    }
    this.value.set(next);
    this.onChange(next);
  }

  onBlur(): void {
    this.touched.set(true);
    this.onTouched();
  }

  writeValue(value: unknown): void {
    this.value.set(this.multiple() ? (Array.isArray(value) ? value : []) : (value ?? null));
  }
  registerOnChange(fn: (v: unknown) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }
}
