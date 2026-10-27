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
import { SelectOption, SelectVariant, SelectColor, SelectSize } from './select.types';

export * from './select.types';

const APP_SELECT_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => AppSelectComponent),
  multi: true,
};

@Component({
  selector: 'app-select',
  imports: [MatIconModule, OverlayModule],
  providers: [APP_SELECT_VALUE_ACCESSOR],
  host: {
    class: 'app-select-host',
    '[class]': 'hostClasses()',
  },
  template: `
    <div
      class="app-select__field"
      cdkOverlayOrigin
      #trigger="cdkOverlayOrigin"
      (click)="toggleOpen()"
      [attr.tabindex]="disabled() ? -1 : 0"
      (keydown.enter)="toggleOpen()"
      (keydown.space)="toggleOpen(); $event.preventDefault()"
      (keydown.arrowDown)="open(); $event.preventDefault()"
      (keydown.arrowUp)="open(); $event.preventDefault()"
      #field
      role="combobox"
      [attr.aria-expanded]="isOpen()"
      aria-haspopup="listbox"
      [attr.aria-disabled]="disabled()"
    >
      @if (prefixIcon()) {
        <mat-icon class="app-select__icon">{{ prefixIcon() }}</mat-icon>
      }

      <div class="app-select__control">
        @if (!hasValue()) {
          <span class="app-select__placeholder">{{ placeholder() }}</span>
        } @else {
          <span class="app-select__value">{{ displayValue() }}</span>
        }
      </div>

      <mat-icon class="app-select__dropdown-icon" [class.app-select__dropdown-icon--open]="isOpen()">expand_more</mat-icon>

      @if (label(); as l) {
        <label class="app-select__label" [class.app-select__label--floating]="isFloating()">
          {{ l }}{{ required() ? ' *' : '' }}
        </label>
      }
    </div>

    <ng-template
      cdkConnectedOverlay
      [cdkConnectedOverlayOrigin]="trigger"
      [cdkConnectedOverlayOpen]="isOpen()"
      [cdkConnectedOverlayWidth]="triggerWidth()"
      [cdkConnectedOverlayHasBackdrop]="true"
      cdkConnectedOverlayBackdropClass="cdk-overlay-transparent-backdrop"
      (backdropClick)="close()"
      (detach)="close()"
    >
      <div class="app-select__dropdown" role="listbox">
        @if (searchable()) {
          <div class="app-select__search-header">
            <mat-icon class="app-select__search-icon">search</mat-icon>
            <input
              #searchInput
              class="app-select__search-input"
              [placeholder]="searchPlaceholder()"
              [value]="searchQuery()"
              (input)="onSearchInput($event)"
              (keydown)="$event.stopPropagation()"
              (keydown.escape)="close()"
              aria-label="Buscar opciones"
            />
            @if (searchQuery()) {
              <button
                type="button"
                class="app-select__search-clear"
                (click)="clearSearch($event)"
                aria-label="Limpiar búsqueda"
              >
                <mat-icon>close</mat-icon>
              </button>
            }
          </div>
        }

        @for (option of filteredOptions(); track option.value) {
          <div
            class="app-select__option"
            [class.app-select__option--selected]="option.value === value()"
            (click)="selectOption(option)"
            role="option"
            [attr.aria-selected]="option.value === value()"
          >
            {{ option.label }}
          </div>
        } @empty {
          <div class="app-select__empty">
            <mat-icon>search_off</mat-icon>
            <span>{{ notFoundText() }}</span>
          </div>
        }
      </div>
    </ng-template>

    @if (effectiveError(); as err) {
      <span class="app-select__helper app-select__helper--error" role="alert">{{ err }}</span>
    } @else if (hint(); as h) {
      <span class="app-select__helper">{{ h }}</span>
    }
  `,
  styleUrl: './select.component.scss',
})
export class AppSelectComponent implements ControlValueAccessor, AfterViewInit, OnDestroy {
  private focusMonitor = inject(FocusMonitor);

  @ViewChild('field')
  private fieldRef?: ElementRef<HTMLDivElement>;

  @ViewChild('searchInput')
  private searchInputRef?: ElementRef<HTMLInputElement>;

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
  searchable = input(false);
  searchPlaceholder = input('Buscar...');
  notFoundText = input('No se encontraron resultados');

  value = signal<unknown>('');
  disabled = signal(false);
  focused = signal(false);
  isOpen = signal(false);
  triggerWidth = signal<number | string>('100%');
  searchQuery = signal('');
  touched = signal(false);

  requiredErrorMessage = input('Este campo es requerido');

  private onChange: (value: unknown) => void = () => {};
  private onTouched: () => void = () => {};

  hasValue = computed(() => this.value() !== '' && this.value() !== null && this.value() !== undefined);

  isCatalogValid = computed(() => {
    if (!this.hasValue()) return true;
    return this.options().some((o) => o.value === this.value());
  });

  catalogError = computed(() =>
    !this.isCatalogValid() ? 'La opción seleccionada no pertenece al catálogo' : null
  );

  requiredError = computed(() =>
    this.required() && this.touched() && !this.hasValue() ? this.requiredErrorMessage() : null
  );

  effectiveError = computed(() => this.errorMessage() || this.catalogError() || this.requiredError());
  hasError = computed(() => !!this.effectiveError());

  isFloating = computed(() => this.focused() || this.hasValue() || !!this.placeholder());
  
  hasPrefixIcon = computed(() => !!this.prefixIcon());

  displayValue = computed(() => {
    const val = this.value();
    const option = this.options().find(o => o.value === val);
    return option ? option.label : '';
  });

  filteredOptions = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.options();
    return this.options().filter(o => o.label.toLowerCase().includes(query));
  });

  hostClasses = computed(() =>
    [
      `app-select--${this.variant()}`,
      `app-select--${this.size()}`,
      `app-select--${this.hasError() ? 'error' : this.color()}`,
      this.focused() ? 'app-select--focused' : '',
      this.isOpen() ? 'app-select--open' : '',
      this.disabled() ? 'app-select--disabled' : '',
      this.hasPrefixIcon() ? 'app-select--has-icon' : '',
    ]
      .filter(Boolean)
      .join(' ')
  );

  ngAfterViewInit(): void {
    if (this.fieldRef) {
      this.focusMonitor.monitor(this.fieldRef, true).subscribe((origin) => {
        this.focused.set(origin !== null || this.isOpen());
        if (origin === null && !this.isOpen()) {
          this.onBlur();
        }
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

  toggleOpen(): void {
    if (this.disabled()) return;
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  open(): void {
    if (this.disabled()) return;
    if (this.fieldRef) {
      this.triggerWidth.set(this.fieldRef.nativeElement.getBoundingClientRect().width);
    }
    this.isOpen.set(true);
    this.focused.set(true);

    if (this.searchable()) {
      setTimeout(() => this.searchInputRef?.nativeElement.focus(), 50);
    }
  }

  close(): void {
    this.isOpen.set(false);
    this.searchQuery.set('');
    this.touched.set(true);
    this.onTouched();
    if (this.fieldRef) {
      this.fieldRef.nativeElement.focus();
    }
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  clearSearch(event: MouseEvent): void {
    event.stopPropagation();
    this.searchQuery.set('');
    this.searchInputRef?.nativeElement.focus();
  }

  selectOption(option: SelectOption): void {
    this.value.set(option.value);
    this.touched.set(true);
    this.onChange(option.value);
    this.close();
  }

  onBlur(): void {
    this.touched.set(true);
    this.onTouched();
  }
}
