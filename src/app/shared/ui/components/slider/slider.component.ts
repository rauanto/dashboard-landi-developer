import { Component, ChangeDetectionStrategy, computed, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';

export type SliderColor = 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'info' | 'error';
export interface SliderRange {
  start: number;
  end: number;
}

/**
 * Slider (simple o rango) sobre mat-slider.
 *  - simple: value = number
 *  - rango ([range]="true"): value = { start, end }
 *
 * <app-slider formControlName="monto" label="Monto" [min]="1000" [max]="50000" [step]="500" [format]="moneda" />
 */
@Component({
  selector: 'app-slider',
  imports: [MatSliderModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AppSliderComponent), multi: true }],
  host: { class: 'app-slider-host', '[class]': 'hostClasses()' },
  template: `
    @if (label() || showValue()) {
      <div class="app-slider__header">
        @if (label(); as l) {
          <span class="app-slider__label">{{ l }}</span>
        }
        @if (showValue()) {
          <span class="app-slider__value">{{ displayValue() }}</span>
        }
      </div>
    }

    @if (range()) {
      <mat-slider class="app-slider__control" [min]="min()" [max]="max()" [step]="step()" [discrete]="discrete()" [disabled]="effectiveDisabled()" [displayWith]="format()">
        <input matSliderStartThumb [value]="rangeValue().start" (valueChange)="setStart($event)" (blur)="onBlur()" />
        <input matSliderEndThumb [value]="rangeValue().end" (valueChange)="setEnd($event)" (blur)="onBlur()" />
      </mat-slider>
    } @else {
      <mat-slider class="app-slider__control" [min]="min()" [max]="max()" [step]="step()" [discrete]="discrete()" [disabled]="effectiveDisabled()" [displayWith]="format()">
        <input matSliderThumb [value]="single()" (valueChange)="setSingle($event)" (blur)="onBlur()" />
      </mat-slider>
    }

    <div class="app-slider__footer">
      <span>{{ format()(min()) }}</span>
      @if (errorMessage(); as err) {
        <span class="app-slider__error" role="alert">{{ err }}</span>
      } @else if (hint(); as h) {
        <span>{{ h }}</span>
      }
      <span>{{ format()(max()) }}</span>
    </div>
  `,
  styleUrl: './slider.component.scss',
})
export class AppSliderComponent implements ControlValueAccessor {
  label = input<string | null>(null);
  hint = input<string | null>(null);
  errorMessage = input<string | null>(null);
  color = input<SliderColor>('primary');
  min = input(0);
  max = input(100);
  step = input(1);
  range = input(false);
  discrete = input(false);
  showValue = input(true);
  /** Formatea los números mostrados, p.ej. (v) => `$ ${v.toLocaleString('es-MX')}` */
  format = input<(v: number) => string>((v) => String(v));
  disabled = input(false);

  single = signal(0);
  rangeValue = signal<SliderRange>({ start: 0, end: 0 });
  private cvaDisabled = signal(false);

  private onChange: (v: number | SliderRange) => void = () => {};
  private onTouched: () => void = () => {};

  effectiveDisabled = computed(() => this.disabled() || this.cvaDisabled());

  displayValue = computed(() => {
    const f = this.format();
    if (this.range()) {
      const r = this.rangeValue();
      return `${f(r.start)} – ${f(r.end)}`;
    }
    return f(this.single());
  });

  hostClasses = computed(() =>
    [
      `app-slider--${this.errorMessage() ? 'error' : this.color()}`,
      this.effectiveDisabled() ? 'app-slider--disabled' : '',
    ]
      .filter(Boolean)
      .join(' ')
  );

  setSingle(v: number): void {
    this.single.set(v);
    this.onChange(v);
  }
  setStart(v: number): void {
    this.rangeValue.update((r) => ({ ...r, start: v }));
    this.onChange(this.rangeValue());
  }
  setEnd(v: number): void {
    this.rangeValue.update((r) => ({ ...r, end: v }));
    this.onChange(this.rangeValue());
  }
  onBlur(): void {
    this.onTouched();
  }

  writeValue(value: number | SliderRange | null): void {
    if (typeof value === 'number') {
      this.single.set(value);
    } else if (value && typeof value === 'object') {
      this.rangeValue.set({ start: value.start, end: value.end });
    } else {
      this.single.set(this.min());
      this.rangeValue.set({ start: this.min(), end: this.max() });
    }
  }
  registerOnChange(fn: (v: number | SliderRange) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }
}
