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
  fromDate,
  toDate,
} from './datepicker.shared';

export interface DateRangeValue<T = Date | string> {
  start: T | null;
  end: T | null;
}

/**
 * Rango de fechas (inicio - fin). El valor es { start, end }.
 *
 * <app-date-range formControlName="periodo" label="Periodo" valueFormat="iso" />
 */
@Component({
  selector: 'app-date-range',
  imports: [MatDatepickerModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AppDateRangeComponent), multi: true },
    ...APP_DATE_PROVIDERS,
  ],
  host: {
    class: 'app-datepicker-host app-datepicker--range',
    '[class]': 'hostClasses()',
  },
  template: `
    <div class="app-datepicker__field">
      <mat-date-range-input
        class="app-datepicker__range"
        [rangePicker]="picker"
        [min]="min()"
        [max]="max()"
        [disabled]="effectiveDisabled()"
      >
        <input
          matStartDate
          placeholder="Inicio"
          [value]="start()"
          (dateChange)="onStart($event)"
          (focus)="focused.set(true)"
          (blur)="onBlur()"
        />
        <input
          matEndDate
          placeholder="Fin"
          [value]="end()"
          (dateChange)="onEnd($event)"
          (focus)="focused.set(true)"
          (blur)="onBlur()"
        />
      </mat-date-range-input>

      @if (label(); as l) {
        <label class="app-datepicker__label app-datepicker__label--floating">
          {{ l }}{{ required() ? ' *' : '' }}
        </label>
      }

      @if (clearable() && (start() || end()) && !effectiveDisabled()) {
        <button type="button" class="app-datepicker__action" aria-label="Limpiar rango" (click)="clear()">
          <mat-icon class="app-datepicker__icon">close</mat-icon>
        </button>
      }

      <mat-datepicker-toggle class="app-datepicker__toggle" [for]="picker" [disabled]="effectiveDisabled()" />
      <mat-date-range-picker #picker (opened)="focused.set(true)" (closed)="onBlur()" />
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
export class AppDateRangeComponent implements ControlValueAccessor {
  label = input<string | null>(null);
  variant = input<DatepickerVariant>('outlined');
  color = input<DatepickerColor>('primary');
  size = input<DatepickerSize>('md');
  hint = input<string | null>(null);
  errorMessage = input<string | null>(null);
  required = input(false);
  requiredErrorMessage = input('Selecciona un rango de fechas');
  clearable = input(true);
  min = input<Date | null>(null);
  max = input<Date | null>(null);
  valueFormat = input<DateValueFormat>('date');
  disabled = input(false);

  start = signal<Date | null>(null);
  end = signal<Date | null>(null);
  focused = signal(false);
  touched = signal(false);
  private cvaDisabled = signal(false);

  private onChange: (v: DateRangeValue) => void = () => {};
  private onTouched: () => void = () => {};

  effectiveDisabled = computed(() => this.disabled() || this.cvaDisabled());

  private incomplete = computed(() => !!this.start() !== !!this.end());
  requiredError = computed(() =>
    this.required() && this.touched() && !this.start() && !this.end() ? this.requiredErrorMessage() : null
  );
  incompleteError = computed(() =>
    this.touched() && !this.focused() && this.incomplete() ? 'Completa la fecha de inicio y fin' : null
  );
  effectiveError = computed(() => this.errorMessage() || this.incompleteError() || this.requiredError());
  hasError = computed(() => !!this.effectiveError());

  hostClasses = computed(() =>
    [
      'app-datepicker-host',
      'app-datepicker--range',
      `app-datepicker--${this.variant()}`,
      `app-datepicker--${this.size()}`,
      `app-datepicker--${this.hasError() ? 'error' : this.color()}`,
      this.focused() ? 'app-datepicker--focused' : '',
      this.effectiveDisabled() ? 'app-datepicker--disabled' : '',
    ]
      .filter(Boolean)
      .join(' ')
  );

  private emit(): void {
    const f = this.valueFormat();
    this.onChange({ start: fromDate(this.start(), f), end: fromDate(this.end(), f) });
  }

  onStart(e: MatDatepickerInputEvent<Date>): void {
    this.start.set(e.value);
    this.emit();
  }

  onEnd(e: MatDatepickerInputEvent<Date>): void {
    this.end.set(e.value);
    this.emit();
  }

  onBlur(): void {
    this.focused.set(false);
    this.touched.set(true);
    this.onTouched();
  }

  clear(): void {
    this.start.set(null);
    this.end.set(null);
    this.emit();
  }

  writeValue(value: DateRangeValue | null): void {
    this.start.set(toDate(value?.start));
    this.end.set(toDate(value?.end));
  }
  registerOnChange(fn: (v: DateRangeValue) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }
}
