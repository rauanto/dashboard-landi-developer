import { Component, ChangeDetectionStrategy, ElementRef, computed, forwardRef, input, signal, viewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

export type ChipsColor = 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'info' | 'error';
export type ChipsSize = 'sm' | 'md' | 'lg';
export type ChipsVariant = 'outlined' | 'filled';

/**
 * Campo de etiquetas (chip grid con texto libre). El valor es string[].
 * Enter, coma o Tab (si hay texto) agregan; Backspace con el campo vacío borra la última.
 *
 * <app-chips formControlName="correos" label="Correos" [validate]="esCorreo" />
 */
@Component({
  selector: 'app-chips',
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AppChipsComponent), multi: true }],
  host: { class: 'app-chips-host', '[class]': 'hostClasses()' },
  template: `
    <div class="app-chips__field" (click)="focusInput()">
      @if (label(); as l) {
        <label class="app-chips__label" [class.app-chips__label--floating]="isFloating()">
          {{ l }}{{ required() ? ' *' : '' }}
        </label>
      }

      @for (chip of value(); track $index) {
        <span class="app-chips__chip">
          <span class="app-chips__chip-text">{{ chip }}</span>
          @if (!effectiveDisabled()) {
            <button type="button" class="app-chips__remove" [attr.aria-label]="'Quitar ' + chip" (click)="remove($index, $event)">
              <mat-icon>close</mat-icon>
            </button>
          }
        </span>
      }

      <input
        #input
        class="app-chips__input"
        [placeholder]="isFloating() ? placeholder() : ''"
        [disabled]="effectiveDisabled() || maxReached()"
        [value]="draft()"
        (input)="draft.set($any($event.target).value); localError.set(null)"
        (keydown)="onKeydown($event)"
        (paste)="onPaste($event)"
        (focus)="focused.set(true)"
        (blur)="onBlur()"
      />
    </div>

    <div class="app-chips__footer">
      @if (effectiveError(); as err) {
        <span class="app-chips__helper app-chips__helper--error" role="alert">{{ err }}</span>
      } @else if (hint(); as h) {
        <span class="app-chips__helper">{{ h }}</span>
      }
      @if (maxChips(); as max) {
        <span class="app-chips__counter">{{ value().length }}/{{ max }}</span>
      }
    </div>
  `,
  styleUrl: './chips.component.scss',
})
export class AppChipsComponent implements ControlValueAccessor {
  private inputRef = viewChild<ElementRef<HTMLInputElement>>('input');

  label = input<string | null>(null);
  placeholder = input('Escribe y presiona Enter');
  variant = input<ChipsVariant>('outlined');
  color = input<ChipsColor>('primary');
  size = input<ChipsSize>('md');
  hint = input<string | null>(null);
  errorMessage = input<string | null>(null);
  required = input(false);
  requiredErrorMessage = input('Agrega al menos un elemento');
  maxChips = input<number | null>(null);
  allowDuplicates = input(false);
  /** Devuelve un mensaje de error o null si el texto es válido. */
  validate = input<((text: string) => string | null) | null>(null);
  disabled = input(false);

  value = signal<string[]>([]);
  draft = signal('');
  focused = signal(false);
  touched = signal(false);
  localError = signal<string | null>(null);
  private cvaDisabled = signal(false);

  private onChange: (v: string[]) => void = () => {};
  private onTouched: () => void = () => {};

  effectiveDisabled = computed(() => this.disabled() || this.cvaDisabled());
  maxReached = computed(() => this.maxChips() !== null && this.value().length >= this.maxChips()!);
  isFloating = computed(() => this.focused() || this.value().length > 0 || !!this.draft());
  requiredError = computed(() =>
    this.required() && this.touched() && this.value().length === 0 ? this.requiredErrorMessage() : null
  );
  effectiveError = computed(() => this.errorMessage() || this.localError() || this.requiredError());
  hasError = computed(() => !!this.effectiveError());

  hostClasses = computed(() =>
    [
      `app-chips--${this.variant()}`,
      `app-chips--${this.size()}`,
      `app-chips--${this.hasError() ? 'error' : this.color()}`,
      this.focused() ? 'app-chips--focused' : '',
      this.effectiveDisabled() ? 'app-chips--disabled' : '',
    ]
      .filter(Boolean)
      .join(' ')
  );

  focusInput(): void {
    this.inputRef()?.nativeElement.focus();
  }

  onKeydown(e: KeyboardEvent): void {
    if (e.key === 'Enter' || e.key === ',' || (e.key === 'Tab' && this.draft().trim())) {
      if (e.key !== 'Tab' || this.draft().trim()) e.preventDefault();
      this.commit();
    } else if (e.key === 'Backspace' && !this.draft() && this.value().length) {
      this.remove(this.value().length - 1);
    }
  }

  onPaste(e: ClipboardEvent): void {
    const text = e.clipboardData?.getData('text') ?? '';
    if (!/[,;\n]/.test(text)) return;
    e.preventDefault();
    text.split(/[,;\n]/).forEach((t) => this.add(t));
  }

  commit(): void {
    if (this.add(this.draft())) this.draft.set('');
  }

  private add(raw: string): boolean {
    const text = raw.trim();
    if (!text) return false;
    if (this.maxReached()) return false;
    if (!this.allowDuplicates() && this.value().some((v) => v.toLowerCase() === text.toLowerCase())) {
      this.localError.set('Ese valor ya fue agregado');
      return false;
    }
    const msg = this.validate()?.(text) ?? null;
    if (msg) {
      this.localError.set(msg);
      return false;
    }
    this.localError.set(null);
    const next = [...this.value(), text];
    this.value.set(next);
    this.onChange(next);
    return true;
  }

  remove(index: number, e?: Event): void {
    e?.stopPropagation();
    const next = this.value().filter((_, i) => i !== index);
    this.value.set(next);
    this.onChange(next);
  }

  onBlur(): void {
    this.commit();
    this.focused.set(false);
    this.touched.set(true);
    this.onTouched();
  }

  writeValue(value: string[] | null): void {
    this.value.set(Array.isArray(value) ? value : []);
  }
  registerOnChange(fn: (v: string[]) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }
}
