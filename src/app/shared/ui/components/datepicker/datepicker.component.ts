import { Component, ChangeDetectionStrategy, computed, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatDatepickerInputEvent, MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import {
  APP_DATE_PROVIDERS,
  DateValueFormat,
  DatepickerColor,
  DatepickerSize,
  DatepickerVariant,
  formatDisplay,
  fromDate,
  toDate,
} from './datepicker.shared';

/**
 * Selector de fecha con el mismo look que app-input (pill + label flotante).
 * Se puede escribir (dd/mm/aaaa) o elegir en el calendario.
 *
 * <app-datepicker formControlName="nacimiento" label="Fecha de nacimiento" [max]="hoy" valueFormat="iso" />
 */
@Component({
  selector: 'app-datepicker',
  imports: [MatDatepickerModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AppDatepickerComponent), multi: true },
    ...APP_DATE_PROVIDERS,
  ],
  host: {
    class: 'app-datepicker-host',
    '[class]': 'hostClasses()',
  },
  template: `
    <div class="app-datepicker__field">
      <input
        class="app-datepicker__control"
        [matDatepicker]="picker"
        [min]="min()"
        [max]="max()"
        [matDatepickerFilter]="filter()"
        [value]="value()"
        [disabled]="effectiveDisabled()"
        [placeholder]="isFloating() ? placeholder() : ''"
        (dateInput)="onDateInput($event)"
        (dateChange)="onDateChange($event)"
        (focus)="focused.set(true)"
        (blur)="onBlur()"
      />

      @if (label(); as l) {
        <label class="app-datepicker__label" [class.app-datepicker__label--floating]="isFloating()">
          {{ l }}{{ required() ? ' *' : '' }}
        </label>
      }

      @if (clearable() && value() && !effectiveDisabled()) {
        <button type="button" class="app-datepicker__action" aria-label="Limpiar fecha" (click)="clear()">
          <mat-icon class="app-datepicker__icon">close</mat-icon>
        </button>
      }

      <mat-datepicker-toggle class="app-datepicker__toggle" [for]="picker" [disabled]="effectiveDisabled()" />
      <mat-datepicker #picker (opened)="focused.set(true)" (closed)="onBlur()" />
    </div>

    <div class="app-datepicker__footer">
      @if (effectiveError(); as err) {
        <span class="app-datepicker__helper app-datepicker__helper--error" role="alert">{{ err }}</span>
      } @else if (hint(); as h) {
        <span class="app-datepicker__helper">{{ h }}</span>
      }
    </div>
  `,
  styleUrl: './datepicker.component.scss',
})
export class AppDatepickerComponent implements ControlValueAccessor {
  label = input<string | null>(null);
  placeholder = input('dd/mm/aaaa');
  variant = input<DatepickerVariant>('outlined');
  color = input<DatepickerColor>('primary');
  size = input<DatepickerSize>('md');
  hint = input<string | null>(null);
  errorMessage = input<string | null>(null);
  required = input(false);
  requiredErrorMessage = input('Este campo es requerido');
  clearable = input(true);
  min = input<Date | null>(null);
  max = input<Date | null>(null);
  /** Filtro de días seleccionables, p.ej. (d) => d.getDay() !== 0 */
  filter = input<(d: Date | null) => boolean>(() => true);
  valueFormat = input<DateValueFormat>('date');
  disabled = input(false);

  value = signal<Date | null>(null);
  focused = signal(false);
  touched = signal(false);
  private rawInvalid = signal(false);
  private cvaDisabled = signal(false);

  private onChange: (v: Date | string | null) => void = () => {};
  private onTouched: () => void = () => {};

  effectiveDisabled = computed(() => this.disabled() || this.cvaDisabled());
  hasValue = computed(() => !!this.value());
  isFloating = computed(() => this.focused() || this.hasValue() || !!this.placeholder());

  private strip(d: Date): number {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  }

  rangeError = computed(() => {
    const v = this.value();
    if (!v) return null;
    const min = this.min();
    const max = this.max();
    if (min && this.strip(v) < this.strip(min)) return `La fecha mínima es ${formatDisplay(min)}`;
    if (max && this.strip(v) > this.strip(max)) return `La fecha máxima es ${formatDisplay(max)}`;
    return null;
  });

  requiredError = computed(() =>
    this.required() && this.touched() && !this.hasValue() && !this.rawInvalid()
      ? this.requiredErrorMessage()
      : null
  );

  effectiveError = computed(
    () =>
      this.errorMessage() ||
      (this.rawInvalid() ? 'Fecha inválida (dd/mm/aaaa)' : null) ||
      this.rangeError() ||
      this.requiredError()
  );
  hasError = computed(() => !!this.effectiveError());

  hostClasses = computed(() =>
    [
      `app-datepicker--${this.variant()}`,
      `app-datepicker--${this.size()}`,
      `app-datepicker--${this.hasError() ? 'error' : this.color()}`,
      this.focused() ? 'app-datepicker--focused' : '',
      this.effectiveDisabled() ? 'app-datepicker--disabled' : '',
    ]
      .filter(Boolean)
      .join(' ')
  );

  onDateInput(e: MatDatepickerInputEvent<Date>): void {
    const typed = (e.targetElement as HTMLInputElement).value;
    this.rawInvalid.set(!e.value && !!typed.trim());
    this.value.set(e.value);
    this.onChange(fromDate(e.value, this.valueFormat()));
  }

  onDateChange(e: MatDatepickerInputEvent<Date>): void {
    this.value.set(e.value);
    this.onChange(fromDate(e.value, this.valueFormat()));
  }

  onBlur(): void {
    this.focused.set(false);
    this.touched.set(true);
    this.onTouched();
  }

  clear(): void {
    this.rawInvalid.set(false);
    this.value.set(null);
    this.onChange(null);
  }

  writeValue(value: Date | string | null): void {
    this.rawInvalid.set(false);
    this.value.set(toDate(value));
  }
  registerOnChange(fn: (v: Date | string | null) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }
}
