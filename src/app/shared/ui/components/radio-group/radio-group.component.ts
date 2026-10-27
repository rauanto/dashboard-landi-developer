import { Component, ChangeDetectionStrategy, computed, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SelectOption } from '../select/select.types';

export type RadioColor = 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'info' | 'error';
export type RadioSize = 'sm' | 'md' | 'lg';

let nextId = 0;

/**
 * Grupo de radios M3. Usa radios nativos (navegación con flechas incluida).
 *
 * <app-radio-group formControlName="tipo" label="Tipo de persona" [options]="tipos" direction="horizontal" />
 */
@Component({
  selector: 'app-radio-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AppRadioGroupComponent), multi: true },
  ],
  host: {
    class: 'app-radio-host',
    '[class]': 'hostClasses()',
  },
  template: `
    <div class="app-radio" role="radiogroup" [attr.aria-label]="label()" (focusout)="onBlur()">
      @if (label(); as l) {
        <span class="app-radio__group-label">{{ l }}{{ required() ? ' *' : '' }}</span>
      }

      <div class="app-radio__items" [class.app-radio__items--horizontal]="direction() === 'horizontal'">
        @for (option of options(); track option.value) {
          <label class="app-radio__wrap" [class.app-radio__wrap--disabled]="effectiveDisabled() || option.disabled">
            <input
              type="radio"
              class="app-radio__native"
              [name]="name"
              [checked]="option.value === value()"
              [disabled]="effectiveDisabled() || !!option.disabled"
              (change)="select(option.value)"
            />
            <span class="app-radio__circle"></span>
            <span class="app-radio__text">
              <span class="app-radio__label">{{ option.label }}</span>
              @if (option.description) {
                <span class="app-radio__description">{{ option.description }}</span>
              }
            </span>
          </label>
        }
      </div>

      @if (effectiveError(); as err) {
        <span class="app-radio__helper app-radio__helper--error" role="alert">{{ err }}</span>
      } @else if (hint(); as h) {
        <span class="app-radio__helper">{{ h }}</span>
      }
    </div>
  `,
  styleUrl: './radio-group.component.scss',
})
export class AppRadioGroupComponent implements ControlValueAccessor {
  readonly name = `app-radio-${nextId++}`;

  label = input<string | null>(null);
  options = input<SelectOption[]>([]);
  direction = input<'vertical' | 'horizontal'>('vertical');
  color = input<RadioColor>('primary');
  size = input<RadioSize>('md');
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
  hasValue = computed(() => this.value() !== null && this.value() !== undefined && this.value() !== '');
  requiredError = computed(() =>
    this.required() && this.touched() && !this.hasValue() ? this.requiredErrorMessage() : null
  );
  effectiveError = computed(() => this.errorMessage() || this.requiredError());
  hasError = computed(() => !!this.effectiveError());

  hostClasses = computed(() =>
    [`app-radio--${this.size()}`, `app-radio--${this.hasError() ? 'error' : this.color()}`].join(' ')
  );

  select(v: unknown): void {
    this.value.set(v);
    this.onChange(v);
  }

  onBlur(): void {
    this.touched.set(true);
    this.onTouched();
  }

  writeValue(value: unknown): void {
    this.value.set(value ?? null);
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
