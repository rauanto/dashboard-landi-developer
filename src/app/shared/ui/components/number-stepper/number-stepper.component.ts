import { Component, ChangeDetectionStrategy, computed, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

export type NumberStepperColor = 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'info' | 'error';
export type NumberStepperSize = 'sm' | 'md' | 'lg';

/**
 * Input numérico con botones − / +. Valor: number | null.
 *
 * <app-number-stepper formControlName="plazo" label="Plazo" suffix="meses" [min]="1" [max]="60" />
 */
@Component({
  selector: 'app-number-stepper',
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AppNumberStepperComponent), multi: true }],
  host: { class: 'app-num-host', '[class]': 'hostClasses()' },
  template: `
    <div class="app-num__field">
      <button type="button" class="app-num__btn" aria-label="Disminuir" [disabled]="effectiveDisabled() || !canDec()" (click)="step(-1)">
        <mat-icon>remove</mat-icon>
      </button>

      <div class="app-num__center">
        <input
          class="app-num__input"
          type="text"
          inputmode="decimal"
          [value]="text()"
          [disabled]="effectiveDisabled()"
          [attr.aria-label]="label()"
          (input)="onInput($event)"
          (keydown.arrowUp)="step(1); $event.preventDefault()"
          (keydown.arrowDown)="step(-1); $event.preventDefault()"
          (focus)="focused.set(true)"
          (blur)="onBlur()"
        />
        @if (suffix(); as s) {
          <span class="app-num__suffix">{{ s }}</span>
        }
      </div>

      <button type="button" class="app-num__btn" aria-label="Aumentar" [disabled]="effectiveDisabled() || !canInc()" (click)="step(1)">
        <mat-icon>add</mat-icon>
      </button>

      @if (label(); as l) {
        <label class="app-num__label">{{ l }}{{ required() ? ' *' : '' }}</label>
      }
    </div>

    <div class="app-num__footer">
      @if (effectiveError(); as err) {
        <span class="app-num__helper app-num__helper--error" role="alert">{{ err }}</span>
      } @else if (hint(); as h) {
        <span class="app-num__helper">{{ h }}</span>
      }
    </div>
  `,
  styleUrl: './number-stepper.component.scss',
})
export class AppNumberStepperComponent implements ControlValueAccessor {
  label = input<string | null>(null);
  hint = input<string | null>(null);
  errorMessage = input<string | null>(null);
  suffix = input<string | null>(null);
  color = input<NumberStepperColor>('primary');
  size = input<NumberStepperSize>('md');
  min = input<number | null>(null);
  max = input<number | null>(null);
  stepSize = input(1);
  /** Decimales permitidos (0 = enteros). */
  decimals = input(0);
  required = input(false);
  requiredErrorMessage = input('Este campo es requerido');
  disabled = input(false);

  value = signal<number | null>(null);
  text = signal('');
  focused = signal(false);
  touched = signal(false);
  private cvaDisabled = signal(false);

  private onChange: (v: number | null) => void = () => {};
  private onTouched: () => void = () => {};

  effectiveDisabled = computed(() => this.disabled() || this.cvaDisabled());
  canDec = computed(() => this.min() === null || (this.value() ?? 0) > this.min()!);
  canInc = computed(() => this.max() === null || (this.value() ?? 0) < this.max()!);

  rangeError = computed(() => {
    const v = this.value();
    if (v === null) return null;
    if (this.min() !== null && v < this.min()!) return `El valor mínimo es ${this.min()}`;
    if (this.max() !== null && v > this.max()!) return `El valor máximo es ${this.max()}`;
    return null;
  });
  requiredError = computed(() =>
    this.required() && this.touched() && this.value() === null ? this.requiredErrorMessage() : null
  );
  effectiveError = computed(() => this.errorMessage() || this.rangeError() || this.requiredError());
  hasError = computed(() => !!this.effectiveError());

  hostClasses = computed(() =>
    [
      `app-num--${this.size()}`,
      `app-num--${this.hasError() ? 'error' : this.color()}`,
      this.focused() ? 'app-num--focused' : '',
      this.effectiveDisabled() ? 'app-num--disabled' : '',
    ]
      .filter(Boolean)
      .join(' ')
  );

  private clampRound(n: number): number {
    const f = 10 ** this.decimals();
    let r = Math.round(n * f) / f;
    if (this.min() !== null) r = Math.max(r, this.min()!);
    if (this.max() !== null) r = Math.min(r, this.max()!);
    return r;
  }

  private set(v: number | null, syncText = true): void {
    this.value.set(v);
    if (syncText) this.text.set(v === null ? '' : String(v));
    this.onChange(v);
  }

  step(dir: 1 | -1): void {
    if (this.effectiveDisabled()) return;
    const base = this.value() ?? (this.min() ?? 0) - (dir === 1 ? this.stepSize() : -this.stepSize());
    const next = this.clampRound(base + dir * this.stepSize());
    this.set(next);
    this.touched.set(true);
  }

  onInput(e: Event): void {
    const el = e.target as HTMLInputElement;
    const pattern = this.decimals() > 0 ? /[^0-9.-]/g : /[^0-9-]/g;
    const clean = el.value.replace(pattern, '');
    if (clean !== el.value) el.value = clean;
    this.text.set(clean);
    const n = parseFloat(clean);
    this.set(isNaN(n) ? null : n, false);
  }

  onBlur(): void {
    this.focused.set(false);
    this.touched.set(true);
    const v = this.value();
    if (v !== null) {
      const fixed = this.clampRound(v);
      this.set(fixed);
    }
    this.onTouched();
  }

  writeValue(value: number | string | null): void {
    const n = value === null || value === undefined || value === '' ? null : Number(value);
    this.value.set(n === null || isNaN(n) ? null : n);
    this.text.set(this.value() === null ? '' : String(this.value()));
  }
  registerOnChange(fn: (v: number | null) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }
}
