import {
  Component,
  ElementRef,
  inject,
  input,
  output,
  signal,
  computed,
  forwardRef,
  viewChildren,
  linkedSignal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { InputVariant, InputColor, InputSize } from '../input/input.component';

const APP_OTP_INPUT_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => AppOtpInputComponent),
  multi: true,
};

@Component({
  selector: 'app-otp-input',
  providers: [APP_OTP_INPUT_VALUE_ACCESSOR],
  host: {
    class: 'app-otp-input-host',
    '[class]': 'hostClasses()',
  },
  template: `
    @if (label(); as l) {
      <label class="app-otp-input__label">{{ l }}{{ required() ? ' *' : '' }}</label>
    }

    <div class="app-otp-input__field" role="group" [attr.aria-label]="label() || 'Código OTP'">
      @for (d of digits(); track $index; let i = $index) {
        <input
          #digitInput
          class="app-otp-input__cell"
          [class.app-otp-input__cell--filled]="digits()[i] !== ''"
          [type]="masked() ? 'password' : 'text'"
          inputmode="numeric"
          pattern="[0-9]*"
          maxlength="1"
          [disabled]="effectiveDisabled()"
          [attr.required]="required() ? true : null"
          [value]="digits()[i]"
          (input)="onDigitInput($event, i)"
          (keydown)="onKeyDown($event, i)"
          (paste)="onPaste($event)"
          (focus)="onCellFocus(i)"
          (blur)="onCellBlur()"
          [attr.aria-label]="'Dígito ' + (i + 1) + ' de ' + length()"
        />

        @if (length() === 6 && i === 2) {
          <span class="app-otp-input__divider" aria-hidden="true">&ndash;</span>
        }
      }
    </div>

    @if (effectiveError(); as err) {
      <span class="app-otp-input__helper app-otp-input__helper--error" role="alert">{{ err }}</span>
    } @else if (hint(); as h) {
      <span class="app-otp-input__helper">{{ h }}</span>
    }
  `,
  styleUrl: './otp-input.component.scss',
})
export class AppOtpInputComponent implements ControlValueAccessor {
  private cellInputs = viewChildren<ElementRef<HTMLInputElement>>('digitInput');

  label = input<string | null>(null);
  length = input<number>(6);
  variant = input<InputVariant>('outlined');
  color = input<InputColor>('primary');
  size = input<InputSize>('md');
  masked = input(false);
  hint = input<string | null>(null);
  errorMessage = input<string | null>(null);
  disabled = input(false);
  required = input(false);
  requiredErrorMessage = input('El código OTP es requerido');

  completed = output<string>();

  digits = linkedSignal<number, string[]>({
    source: () => this.length(),
    computation: (len) => Array.from({ length: len }, () => ''),
  });

  private cvaDisabled = signal(false);
  touched = signal(false);
  effectiveDisabled = computed(() => this.disabled() || this.cvaDisabled());

  requiredError = computed(() =>
    this.required() && this.touched() && this.digits().some((d) => !d)
      ? this.requiredErrorMessage()
      : null
  );

  effectiveError = computed(() => this.errorMessage() || this.requiredError());
  hasError = computed(() => !!this.effectiveError());

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  hostClasses = computed(() =>
    [
      `app-otp-input--${this.variant()}`,
      `app-otp-input--${this.size()}`,
      `app-otp-input--${this.hasError() ? 'error' : this.color()}`,
      this.effectiveDisabled() ? 'app-otp-input--disabled' : '',
    ]
      .filter(Boolean)
      .join(' ')
  );

  writeValue(value: string | null): void {
    const val = value ? String(value).replace(/\D/g, '') : '';
    const len = this.length();
    const newDigits = Array.from({ length: len }, (_, i) => val[i] || '');
    this.digits.set(newDigits);
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

  onCellFocus(index: number): void {
    const inputs = this.cellInputs();
    inputs[index]?.nativeElement.select();
  }

  onDigitInput(event: Event, index: number): void {
    const inputEl = event.target as HTMLInputElement;
    const rawVal = inputEl.value.replace(/\D/g, '');

    if (!rawVal) {
      this.setDigit(index, '');
      return;
    }

    // Take the last character typed
    const char = rawVal.slice(-1);
    this.setDigit(index, char);

    // Auto-advance
    if (index < this.length() - 1) {
      this.focusCell(index + 1);
    } else {
      this.checkCompletion();
    }
  }

  onKeyDown(event: KeyboardEvent, index: number): void {
    if (this.effectiveDisabled()) return;

    if (event.key === 'Backspace') {
      event.preventDefault();
      if (this.digits()[index]) {
        this.setDigit(index, '');
      } else if (index > 0) {
        this.focusCell(index - 1);
        this.setDigit(index - 1, '');
      }
      return;
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      if (index > 0) {
        this.focusCell(index - 1);
      }
      return;
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      if (index < this.length() - 1) {
        this.focusCell(index + 1);
      }
      return;
    }

    if (event.key === 'Delete') {
      event.preventDefault();
      this.setDigit(index, '');
      return;
    }
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    if (this.effectiveDisabled()) return;

    const text = event.clipboardData?.getData('text') || '';
    const pastedDigits = text.replace(/\D/g, '');
    if (!pastedDigits) return;

    const maxLen = this.length();
    const newDigits = [...this.digits()];

    for (let i = 0; i < maxLen && i < pastedDigits.length; i++) {
      newDigits[i] = pastedDigits[i];
    }
    this.digits.set(newDigits);
    this.emitChange();

    const nextEmptyIndex = newDigits.findIndex((d) => !d);
    if (nextEmptyIndex !== -1) {
      this.focusCell(nextEmptyIndex);
    } else {
      this.focusCell(maxLen - 1);
      this.checkCompletion();
    }
  }

  clear(): void {
    this.digits.set(Array.from({ length: this.length() }, () => ''));
    this.emitChange();
    this.focusCell(0);
  }

  private setDigit(index: number, val: string): void {
    const arr = [...this.digits()];
    arr[index] = val;
    this.digits.set(arr);
    this.emitChange();

    if (val) {
      this.checkCompletion();
    }
  }

  onCellBlur(): void {
    this.touched.set(true);
    this.onTouched();
  }

  private emitChange(): void {
    const code = this.digits().join('');
    this.onChange(code);
    this.onTouched();
  }

  private checkCompletion(): void {
    const code = this.digits().join('');
    if (code.length === this.length() && !this.digits().some((d) => !d)) {
      this.completed.emit(code);
    }
  }

  private focusCell(index: number): void {
    const inputs = this.cellInputs();
    if (inputs[index]) {
      inputs[index].nativeElement.focus();
      inputs[index].nativeElement.select();
    }
  }
}
