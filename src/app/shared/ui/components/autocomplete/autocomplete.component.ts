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
import { OverlayModule } from '@angular/cdk/overlay';
import { MatIconModule } from '@angular/material/icon';
import { SelectOption, SelectVariant, SelectColor, SelectSize } from '../select/select.types';

const APP_AUTOCOMPLETE_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => AppAutocompleteComponent),
  multi: true,
};

@Component({
  selector: 'app-autocomplete',
  imports: [MatIconModule, OverlayModule],
  providers: [APP_AUTOCOMPLETE_VALUE_ACCESSOR],
  host: {
    class: 'app-autocomplete-host',
    '[class]': 'hostClasses()',
  },
  template: `
    <div
      class="app-autocomplete__field"
      cdkOverlayOrigin
      #trigger="cdkOverlayOrigin"
      (click)="onFieldClick()"
      #field
    >
      @if (prefixIcon()) {
        <mat-icon class="app-autocomplete__icon">{{ prefixIcon() }}</mat-icon>
      }

      <input
        #nativeInput
        class="app-autocomplete__control"
        [placeholder]="isFloating() ? placeholder() : ''"
        [disabled]="disabled()"
        [attr.required]="required() ? true : null"
        [value]="displayInputText()"
        (input)="onInputChange($event)"
        (focus)="onInputFocus()"
        (blur)="onInputBlur()"
        (keydown)="onKeydown($event)"
        role="combobox"
        aria-autocomplete="list"
        [attr.aria-expanded]="isOpen()"
        aria-haspopup="listbox"
        [attr.aria-label]="label() || placeholder()"
      />

      @if (clearable() && (displayInputText().length > 0 || hasValue()) && !disabled()) {
        <button
          type="button"
          class="app-autocomplete__action"
          aria-label="Limpiar campo"
          (click)="clear($event)"
        >
          <mat-icon class="app-autocomplete__icon">close</mat-icon>
        </button>
      }

      <button
        type="button"
        class="app-autocomplete__dropdown-toggle"
        (click)="toggleDropdown($event)"
        [attr.tabindex]="-1"
        aria-label="Ver opciones"
      >
        <mat-icon
          class="app-autocomplete__dropdown-icon"
          [class.app-autocomplete__dropdown-icon--open]="isOpen()"
        >
          arrow_drop_down
        </mat-icon>
      </button>

      @if (label(); as l) {
        <label
          class="app-autocomplete__label"
          [class.app-autocomplete__label--floating]="isFloating()"
        >
          {{ l }}{{ required() ? ' *' : '' }}
        </label>
      }
    </div>

    <ng-template
      cdkConnectedOverlay
      [cdkConnectedOverlayOrigin]="trigger"
      [cdkConnectedOverlayOpen]="isOpen()"
      [cdkConnectedOverlayWidth]="triggerWidth()"
      [cdkConnectedOverlayHasBackdrop]="false"
      (detach)="closeDropdown()"
    >
      <div class="app-autocomplete__dropdown" role="listbox">
        @for (option of filteredOptions(); track option.value; let i = $index) {
          <div
            class="app-autocomplete__option"
            [class.app-autocomplete__option--selected]="option.value === value()"
            [class.app-autocomplete__option--highlighted]="highlightedIndex() === i"
            [class.app-autocomplete__option--disabled]="option.disabled"
            (mousedown)="selectOption(option, $event)"
            (mouseenter)="highlightedIndex.set(i)"
            role="option"
            [attr.aria-selected]="option.value === value()"
          >
            @if (option.icon) {
              <mat-icon class="app-autocomplete__option-icon">{{ option.icon }}</mat-icon>
            }
            <div class="app-autocomplete__option-details">
              <span class="app-autocomplete__option-label">{{ option.label }}</span>
              @if (option.description) {
                <span class="app-autocomplete__option-desc">{{ option.description }}</span>
              }
            </div>
            @if (option.value === value()) {
              <mat-icon class="app-autocomplete__check-icon">check</mat-icon>
            }
          </div>
        } @empty {
          <div class="app-autocomplete__empty-state">
            <mat-icon class="app-autocomplete__empty-icon">search_off</mat-icon>
            <span>{{ notFoundText() }}</span>
          </div>
        }
      </div>
    </ng-template>

    @if (effectiveError(); as err) {
      <span class="app-autocomplete__helper app-autocomplete__helper--error" role="alert">{{ err }}</span>
    } @else if (hint(); as h) {
      <span class="app-autocomplete__helper">{{ h }}</span>
    }
  `,
  styleUrl: './autocomplete.component.scss',
})
export class AppAutocompleteComponent implements ControlValueAccessor, AfterViewInit, OnDestroy {
  private focusMonitor = inject(FocusMonitor);

  @ViewChild('field')
  private fieldRef?: ElementRef<HTMLDivElement>;

  @ViewChild('nativeInput')
  private nativeInputRef?: ElementRef<HTMLInputElement>;

  label = input<string | null>(null);
  placeholder = input('');
  options = input<SelectOption[]>([]);
  variant = input<SelectVariant>('outlined');
  color = input<SelectColor>('primary');
  size = input<SelectSize>('md');
  hint = input<string | null>(null);
  errorMessage = input<string | null>(null);
  prefixIcon = input<string | null>(null);
  required = input(false);
  clearable = input(true);
  freeText = input(false);
  notFoundText = input('No se encontraron sugerencias');
  notInCatalogErrorMessage = input('La opción ingresada no existe en el catálogo');
  requiredErrorMessage = input('Este campo es requerido');

  value = signal<unknown>('');
  displayInputText = signal('');
  disabled = signal(false);
  focused = signal(false);
  isOpen = signal(false);
  triggerWidth = signal<number | string>('100%');
  highlightedIndex = signal<number>(-1);
  touched = signal(false);

  private onChange: (value: unknown) => void = () => {};
  private onTouched: () => void = () => {};

  hasValue = computed(() => this.value() !== '' && this.value() !== null && this.value() !== undefined);

  matchedOption = computed(() => {
    const text = this.displayInputText().toLowerCase().trim();
    if (!text) return null;
    return this.options().find((o) => o.label.toLowerCase() === text) || null;
  });

  isNotInCatalog = computed(() => {
    if (this.freeText()) return false;
    const text = this.displayInputText().trim();
    if (!text) return false;
    return !this.matchedOption();
  });

  catalogError = computed(() => (this.isNotInCatalog() ? this.notInCatalogErrorMessage() : null));

  requiredError = computed(() => {
    if (!this.required() || !this.touched()) return null;
    if (!this.displayInputText().trim()) return this.requiredErrorMessage();
    return null;
  });

  effectiveError = computed(() => this.errorMessage() || this.catalogError() || this.requiredError());
  hasError = computed(() => !!this.effectiveError());

  isFloating = computed(() => this.focused() || this.hasValue() || this.displayInputText().length > 0 || !!this.placeholder());
  hasPrefixIcon = computed(() => !!this.prefixIcon());

  filteredOptions = computed(() => {
    const query = this.displayInputText().toLowerCase().trim();
    if (!query) return this.options();
    return this.options().filter(
      (o) =>
        o.label.toLowerCase().includes(query) ||
        (o.description && o.description.toLowerCase().includes(query))
    );
  });

  hostClasses = computed(() =>
    [
      `app-autocomplete--${this.variant()}`,
      `app-autocomplete--${this.size()}`,
      `app-autocomplete--${this.hasError() ? 'error' : this.color()}`,
      this.focused() ? 'app-autocomplete--focused' : '',
      this.isOpen() ? 'app-autocomplete--open' : '',
      this.disabled() ? 'app-autocomplete--disabled' : '',
      this.hasPrefixIcon() ? 'app-autocomplete--has-icon' : '',
    ]
      .filter(Boolean)
      .join(' ')
  );

  ngAfterViewInit(): void {
    if (this.fieldRef) {
      this.focusMonitor.monitor(this.fieldRef, true).subscribe((origin) => {
        this.focused.set(origin !== null);
      });
    }
  }

  ngOnDestroy(): void {
    if (this.fieldRef) {
      this.focusMonitor.stopMonitoring(this.fieldRef);
    }
  }

  writeValue(value: unknown): void {
    this.value.set(value ?? '');
    const option = this.options().find((o) => o.value === value);
    if (option) {
      this.displayInputText.set(option.label);
    } else if (typeof value === 'string') {
      this.displayInputText.set(value);
    } else {
      this.displayInputText.set('');
    }
  }

  registerOnChange(fn: (value: unknown) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  onFieldClick(): void {
    if (this.disabled()) return;
    this.nativeInputRef?.nativeElement.focus();
  }

  onInputFocus(): void {
    if (this.disabled()) return;
    this.openDropdown();
  }

  onInputBlur(): void {
    setTimeout(() => {
      this.closeDropdown();
      this.touched.set(true);
      this.onTouched();

      if (!this.freeText()) {
        const text = this.displayInputText().toLowerCase().trim();
        const matched = this.options().find((o) => o.label.toLowerCase() === text);

        if (matched) {
          this.value.set(matched.value);
          this.displayInputText.set(matched.label);
          this.onChange(matched.value);
        } else if (text) {
          // Mantiene el texto visible para mostrar claramente que no existe en el catálogo
          this.value.set(null);
          this.onChange(null);
        } else {
          this.value.set('');
          this.onChange('');
        }
      }
    }, 200);
  }

  onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const text = input.value;
    this.displayInputText.set(text);

    if (this.freeText()) {
      this.value.set(text);
      this.onChange(text);
    } else {
      const matched = this.options().find((o) => o.label.toLowerCase() === text.toLowerCase().trim());
      if (matched) {
        this.value.set(matched.value);
        this.onChange(matched.value);
      } else {
        this.value.set(null);
        this.onChange(null);
      }
    }

    this.openDropdown();
    this.highlightedIndex.set(0);
  }

  onKeydown(event: KeyboardEvent): void {
    const opts = this.filteredOptions();

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!this.isOpen()) {
          this.openDropdown();
        } else if (opts.length > 0) {
          this.highlightedIndex.update((curr) => (curr + 1) % opts.length);
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (this.isOpen() && opts.length > 0) {
          this.highlightedIndex.update((curr) => (curr <= 0 ? opts.length - 1 : curr - 1));
        }
        break;
      case 'Enter':
        if (this.isOpen() && this.highlightedIndex() >= 0) {
          event.preventDefault();
          const option = opts[this.highlightedIndex()];
          if (option && !option.disabled) {
            this.selectOption(option);
          }
        }
        break;
      case 'Escape':
        event.preventDefault();
        this.closeDropdown();
        break;
      case 'Tab':
        this.closeDropdown();
        break;
    }
  }

  openDropdown(): void {
    if (this.disabled()) return;
    if (this.fieldRef) {
      this.triggerWidth.set(this.fieldRef.nativeElement.getBoundingClientRect().width);
    }
    this.isOpen.set(true);
  }

  closeDropdown(): void {
    this.isOpen.set(false);
    this.highlightedIndex.set(-1);
  }

  toggleDropdown(event: MouseEvent): void {
    event.stopPropagation();
    if (this.disabled()) return;
    if (this.isOpen()) {
      this.closeDropdown();
    } else {
      this.nativeInputRef?.nativeElement.focus();
      this.openDropdown();
    }
  }

  selectOption(option: SelectOption, event?: MouseEvent): void {
    if (event) {
      event.preventDefault(); // Prevents input from losing focus before selection
    }
    if (option.disabled) return;

    this.value.set(option.value);
    this.displayInputText.set(option.label);
    this.touched.set(true);
    this.onChange(option.value);
    this.closeDropdown();
    this.nativeInputRef?.nativeElement.focus();
  }

  clear(event: MouseEvent): void {
    event.stopPropagation();
    this.value.set('');
    this.displayInputText.set('');
    this.touched.set(true);
    this.onChange('');
    this.highlightedIndex.set(-1);
    this.nativeInputRef?.nativeElement.focus();
    this.openDropdown();
  }
}
