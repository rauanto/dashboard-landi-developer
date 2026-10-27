import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  inject,
  input,
  signal,
  computed,
  forwardRef,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FocusMonitor } from '@angular/cdk/a11y';
import { TextFieldModule } from '@angular/cdk/text-field';
import { MatIconModule } from '@angular/material/icon';

export type InputVariant = 'outlined' | 'filled';
export type InputColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'success'
  | 'warning'
  | 'info'
  | 'error';
export type InputSize = 'xs' | 'sm' | 'md' | 'lg';
export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'search';
export type InputFormat = 'none' | 'phone' | 'currency' | 'digits';

const APP_INPUT_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => AppInputComponent),
  multi: true,
};

/**
 * Input de texto estilo M3, con esquinas redondeadas tipo pill (igual que
 * AppButtonComponent) y label flotante. Soporta texto normal, multilínea,
 * formateo numérico/teléfono/moneda, contador de palabras y longitudes exactas/mínimas.
 *
 * Funciona como ControlValueAccessor -> compatible con formControl/ngModel.
 */
@Component({
  selector: 'app-input',
  imports: [MatIconModule, TextFieldModule],
  providers: [APP_INPUT_VALUE_ACCESSOR],
  host: {
    class: 'app-input-host',
    '[class]': 'hostClasses()',
  },
  template: `
    <div class="app-input__field">
      @if (prefixIcon()) {
        <mat-icon class="app-input__icon">{{ prefixIcon() }}</mat-icon>
      }

      @if (prefixText(); as pt) {
        <span class="app-input__affix app-input__affix--prefix">{{ pt }}</span>
      }

      @if (multiline()) {
        <textarea
          #nativeInput
          class="app-input__control"
          cdkTextareaAutosize
          [cdkAutosizeMinRows]="rows()"
          [placeholder]="isFloating() ? placeholder() : ''"
          [disabled]="effectiveDisabled()"
          [attr.maxlength]="maxLength()"
          [attr.required]="required() ? true : null"
          [value]="value()"
          (input)="onInput($event)"
          (blur)="onBlur()"
        ></textarea>
      } @else {
        <input
          #nativeInput
          class="app-input__control"
          [type]="effectiveType()"
          [attr.inputmode]="effectiveInputMode()"
          [placeholder]="isFloating() ? placeholder() : ''"
          [disabled]="effectiveDisabled()"
          [attr.maxlength]="effectiveMaxLength()"
          [attr.required]="required() ? true : null"
          [value]="value()"
          (input)="onInput($event)"
          (blur)="onBlur()"
        />
      }

      @if (suffixText(); as st) {
        <span class="app-input__affix app-input__affix--suffix">{{ st }}</span>
      }

      @if (label(); as l) {
        <label class="app-input__label" [class.app-input__label--floating]="isFloating()">
          {{ l }}{{ required() ? ' *' : '' }}
        </label>
      }

      @if (clearable() && hasValue() && !effectiveDisabled()) {
        <button
          type="button"
          class="app-input__action"
          aria-label="Limpiar campo"
          (click)="clear()"
        >
          <mat-icon class="app-input__icon">close</mat-icon>
        </button>
      }

      @if (type() === 'password') {
        <button
          type="button"
          class="app-input__action"
          [attr.aria-label]="showPassword() ? 'Ocultar contraseña' : 'Mostrar contraseña'"
          (click)="togglePassword()"
        >
          <mat-icon class="app-input__icon">{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
        </button>
      }
    </div>

    <div class="app-input__footer">
      <div class="app-input__helper-area">
        @if (effectiveError(); as err) {
          <span class="app-input__helper app-input__helper--error" role="alert">{{ err }}</span>
        } @else if (hint(); as h) {
          <span class="app-input__helper">{{ h }}</span>
        }
      </div>

      @if (counterText(); as counter) {
        <span
          class="app-input__counter"
          [class.app-input__counter--valid]="isRequirementMet()"
          [class.app-input__counter--warning]="hasValue() && !isRequirementMet()"
        >
          {{ counter }}
        </span>
      }
    </div>
  `,
  styleUrl: './input.component.scss',
})
export class AppInputComponent implements ControlValueAccessor, AfterViewInit, OnDestroy {
  private focusMonitor = inject(FocusMonitor);

  @ViewChild('nativeInput')
  private nativeInputRef?: ElementRef<HTMLInputElement | HTMLTextAreaElement>;

  label = input<string | null>(null);
  placeholder = input('');
  type = input<InputType>('text');
  format = input<InputFormat>('none');
  prefixText = input<string | null>(null);
  suffixText = input<string | null>(null);
  multiline = input(false);
  rows = input(1);
  variant = input<InputVariant>('outlined');
  color = input<InputColor>('primary');
  size = input<InputSize>('md');
  hint = input<string | null>(null);
  errorMessage = input<string | null>(null);
  prefixIcon = input<string | null>(null);
  clearable = input(false);
  maxLength = input<number | null>(null);
  minLength = input<number | null>(null);
  exactLength = input<number | null>(null);
  minWords = input<number | null>(null);
  exactWords = input<number | null>(null);
  maxWords = input<number | null>(null);
  required = input(false);
  disabled = input(false);

  value = signal('');
  private cvaDisabled = signal(false);
  focused = signal(false);
  showPassword = signal(false);
  touched = signal(false);

  requiredErrorMessage = input('Este campo es requerido');

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  effectiveDisabled = computed(() => this.disabled() || this.cvaDisabled());
  hasValue = computed(() => this.value().length > 0);
  
  requiredError = computed(() =>
    this.required() && this.touched() && !this.hasValue() ? this.requiredErrorMessage() : null
  );

  effectiveError = computed(() => this.errorMessage() || this.requiredError() || this.requirementWarning());
  hasError = computed(() => !!this.effectiveError());

  isFloating = computed(() => this.focused() || this.hasValue() || !!this.prefixText() || !!this.placeholder());
  effectiveType = computed(() => (this.type() === 'password' && this.showPassword() ? 'text' : this.type()));
  hasPrefix = computed(() => !!this.prefixIcon() || !!this.prefixText());

  effectiveInputMode = computed(() => {
    if (this.format() === 'phone' || this.format() === 'currency' || this.format() === 'digits') {
      return 'numeric';
    }
    return undefined;
  });

  effectiveMaxLength = computed(() => {
    if (this.exactLength() !== null && this.format() === 'none') {
      return this.exactLength();
    }
    if (this.format() === 'phone') {
      return 14; // e.g. (555) 123-4567
    }
    return this.maxLength();
  });

  charCount = computed(() => this.value().length);

  wordCount = computed(() => {
    const trimmed = this.value().trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  });

  isRequirementMet = computed(() => {
    if (!this.hasValue()) return false;

    if (this.exactLength() !== null) {
      const targetCount = this.format() === 'digits' || this.format() === 'phone'
        ? this.value().replace(/\D/g, '').length
        : this.charCount();
      return targetCount === this.exactLength();
    }
    if (this.minLength() !== null) {
      const targetCount = this.format() === 'digits' || this.format() === 'phone'
        ? this.value().replace(/\D/g, '').length
        : this.charCount();
      return targetCount >= this.minLength()!;
    }
    if (this.exactWords() !== null) {
      return this.wordCount() === this.exactWords();
    }
    if (this.minWords() !== null) {
      return this.wordCount() >= this.minWords()!;
    }
    return true;
  });

  requirementWarning = computed(() => {
    if (!this.hasValue() || this.isRequirementMet()) return null;

    if (this.exactLength() !== null) {
      const count = this.format() === 'digits' || this.format() === 'phone'
        ? this.value().replace(/\D/g, '').length
        : this.charCount();
      const diff = this.exactLength()! - count;
      return diff > 0
        ? `Faltan ${diff} dígito${diff > 1 ? 's' : ''} (exacto: ${this.exactLength()})`
        : `Excede por ${Math.abs(diff)} (exacto: ${this.exactLength()})`;
    }
    if (this.minLength() !== null) {
      const count = this.format() === 'digits' || this.format() === 'phone'
        ? this.value().replace(/\D/g, '').length
        : this.charCount();
      return `Mínimo ${this.minLength()} caracteres requeridos (${count}/${this.minLength()})`;
    }
    if (this.exactWords() !== null) {
      return `Requiere exactamente ${this.exactWords()} palabras (${this.wordCount()}/${this.exactWords()})`;
    }
    if (this.minWords() !== null) {
      return `Mínimo ${this.minWords()} palabras requeridas (${this.wordCount()}/${this.minWords()})`;
    }
    return null;
  });

  counterText = computed(() => {
    // 1. Longitud exacta
    if (this.exactLength() !== null) {
      const count = this.format() === 'digits' || this.format() === 'phone'
        ? this.value().replace(/\D/g, '').length
        : this.charCount();
      return `${count}/${this.exactLength()} ${count === this.exactLength() ? '✓' : ''}`;
    }

    // 2. Longitud mínima
    if (this.minLength() !== null) {
      const count = this.format() === 'digits' || this.format() === 'phone'
        ? this.value().replace(/\D/g, '').length
        : this.charCount();
      const suffix = this.maxLength() ? `/${this.maxLength()}` : `/${this.minLength()} mín.`;
      return `${count}${suffix} ${count >= this.minLength()! ? '✓' : ''}`;
    }

    // 3. Palabras exactas
    if (this.exactWords() !== null) {
      return `${this.wordCount()}/${this.exactWords()} palabras ${this.wordCount() === this.exactWords() ? '✓' : ''}`;
    }

    // 4. Palabras mínimas
    if (this.minWords() !== null) {
      const suffix = this.maxWords() ? `/${this.maxWords()}` : `/${this.minWords()} mín.`;
      return `${this.wordCount()}${suffix} palabras ${this.wordCount() >= this.minWords()! ? '✓' : ''}`;
    }

    // 5. Palabras máximas
    if (this.maxWords() !== null) {
      return `${this.wordCount()}/${this.maxWords()} palabras`;
    }

    // 6. MaxLength estándar
    if (this.maxLength()) {
      return `${this.charCount()}/${this.maxLength()}`;
    }

    return null;
  });

  hostClasses = computed(() =>
    [
      `app-input--${this.variant()}`,
      `app-input--${this.size()}`,
      `app-input--${this.hasError() ? 'error' : this.color()}`,
      this.focused() ? 'app-input--focused' : '',
      this.effectiveDisabled() ? 'app-input--disabled' : '',
      this.multiline() ? 'app-input--multiline' : '',
      this.hasPrefix() ? 'app-input--has-icon' : '',
    ]
      .filter(Boolean)
      .join(' ')
  );

  ngAfterViewInit(): void {
    if (this.nativeInputRef) {
      this.focusMonitor.monitor(this.nativeInputRef, false).subscribe((origin) => {
        this.focused.set(origin !== null);
      });
    }
  }

  ngOnDestroy(): void {
    if (this.nativeInputRef) {
      this.focusMonitor.stopMonitoring(this.nativeInputRef);
    }
  }

  writeValue(value: string | number | null): void {
    const str = value !== null && value !== undefined ? String(value) : '';
    const formatted = this.applyFormat(str);
    this.value.set(formatted);
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    const raw = target.value;
    const formatted = this.applyFormat(raw);

    if (raw !== formatted) {
      target.value = formatted;
    }

    this.value.set(formatted);
    this.onChange(formatted);
  }

  onBlur(): void {
    this.touched.set(true);
    this.onTouched();
  }

  clear(): void {
    this.value.set('');
    this.onChange('');
    this.nativeInputRef?.nativeElement.focus();
  }

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  private applyFormat(val: string): string {
    switch (this.format()) {
      case 'phone':
        return this.formatPhone(val);
      case 'currency':
        return this.formatCurrency(val);
      case 'digits':
        return this.formatDigits(val);
      default:
        return val;
    }
  }

  private formatPhone(val: string): string {
    const digits = val.replace(/\D/g, '').slice(0, 10);
    if (!digits) return '';
    if (digits.length <= 3) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  private formatCurrency(val: string): string {
    const clean = val.replace(/[^0-9.]/g, '');
    if (!clean) return '';

    const parts = clean.split('.');
    const intPart = parts[0];
    const decPart = parts.length > 1 ? '.' + parts[1].slice(0, 2) : '';

    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `$ ${formattedInt}${decPart}`;
  }

  private formatDigits(val: string): string {
    return val.replace(/\D/g, '');
  }
}
