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

const APP_SEARCHABLE_SELECT_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => AppSearchableSelectComponent),
  multi: true,
};

@Component({
  selector: 'app-searchable-select',
  imports: [MatIconModule, OverlayModule],
  providers: [APP_SEARCHABLE_SELECT_VALUE_ACCESSOR],
  host: {
    class: 'app-searchable-select-host',
    '[class]': 'hostClasses()',
  },
  template: `
    <div
      class="app-searchable-select__field"
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
        <mat-icon class="app-searchable-select__icon">{{ prefixIcon() }}</mat-icon>
      }

      <div class="app-searchable-select__control">
        @if (!hasValue()) {
          <span class="app-searchable-select__placeholder">{{ placeholder() }}</span>
        } @else {
          <span class="app-searchable-select__value">{{ displayValue() }}</span>
        }
      </div>

      @if (clearable() && hasValue() && !disabled()) {
        <button
          type="button"
          class="app-searchable-select__clear-btn"
          (click)="clearSelection($event)"
          aria-label="Limpiar selección"
        >
          <mat-icon>cancel</mat-icon>
        </button>
      }

      <mat-icon
        class="app-searchable-select__dropdown-icon"
        [class.app-searchable-select__dropdown-icon--open]="isOpen()"
      >
        expand_more
      </mat-icon>

      @if (label(); as l) {
        <label
          class="app-searchable-select__label"
          [class.app-searchable-select__label--floating]="isFloating()"
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
      [cdkConnectedOverlayHasBackdrop]="true"
      cdkConnectedOverlayBackdropClass="cdk-overlay-transparent-backdrop"
      (backdropClick)="close()"
      (detach)="close()"
    >
      <div class="app-searchable-select__dropdown" role="listbox">
        <div class="app-searchable-select__search-header">
          <mat-icon class="app-searchable-select__search-icon">search</mat-icon>
          <input
            #searchInput
            class="app-searchable-select__search-input"
            [placeholder]="searchPlaceholder()"
            [value]="searchQuery()"
            (input)="onSearchInput($event)"
            (keydown)="onSearchKeydown($event)"
            aria-label="Buscar en la lista"
          />
          @if (searchQuery()) {
            <button
              type="button"
              class="app-searchable-select__search-clear"
              (click)="clearSearch($event)"
              aria-label="Limpiar búsqueda"
            >
              <mat-icon>close</mat-icon>
            </button>
          }
        </div>

        <div class="app-searchable-select__options-list">
          @for (option of filteredOptions(); track option.value; let i = $index) {
            <div
              class="app-searchable-select__option"
              [class.app-searchable-select__option--selected]="option.value === value()"
              [class.app-searchable-select__option--highlighted]="highlightedIndex() === i"
              [class.app-searchable-select__option--disabled]="option.disabled"
              (click)="selectOption(option)"
              (mouseenter)="highlightedIndex.set(i)"
              role="option"
              [attr.aria-selected]="option.value === value()"
            >
              @if (option.icon) {
                <mat-icon class="app-searchable-select__option-icon">{{ option.icon }}</mat-icon>
              }
              <div class="app-searchable-select__option-details">
                <span class="app-searchable-select__option-label">{{ option.label }}</span>
                @if (option.description) {
                  <span class="app-searchable-select__option-desc">{{ option.description }}</span>
                }
              </div>
              @if (option.value === value()) {
                <mat-icon class="app-searchable-select__check-icon">check</mat-icon>
              }
            </div>
          } @empty {
            <div class="app-searchable-select__empty-state">
              <mat-icon class="app-searchable-select__empty-icon">search_off</mat-icon>
              <span>{{ notFoundText() }}</span>
            </div>
          }
        </div>
      </div>
    </ng-template>

    @if (effectiveError(); as err) {
      <span class="app-searchable-select__helper app-searchable-select__helper--error" role="alert">{{ err }}</span>
    } @else if (hint(); as h) {
      <span class="app-searchable-select__helper">{{ h }}</span>
    }
  `,
  styleUrl: './searchable-select.component.scss',
})
export class AppSearchableSelectComponent implements ControlValueAccessor, AfterViewInit, OnDestroy {
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
  clearable = input(false);
  searchPlaceholder = input('Buscar...');
  notFoundText = input('No se encontraron resultados');

  value = signal<unknown>('');
  disabled = signal(false);
  focused = signal(false);
  isOpen = signal(false);
  triggerWidth = signal<number | string>('100%');
  searchQuery = signal('');
  highlightedIndex = signal<number>(-1);
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
    const option = this.options().find((o) => o.value === val);
    return option ? option.label : '';
  });

  filteredOptions = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.options();
    return this.options().filter(
      (o) =>
        o.label.toLowerCase().includes(query) ||
        (o.description && o.description.toLowerCase().includes(query))
    );
  });

  hostClasses = computed(() =>
    [
      `app-searchable-select--${this.variant()}`,
      `app-searchable-select--${this.size()}`,
      `app-searchable-select--${this.hasError() ? 'error' : this.color()}`,
      this.focused() ? 'app-searchable-select--focused' : '',
      this.isOpen() ? 'app-searchable-select--open' : '',
      this.disabled() ? 'app-searchable-select--disabled' : '',
      this.hasPrefixIcon() ? 'app-searchable-select--has-icon' : '',
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

    const currentVal = this.value();
    const idx = this.filteredOptions().findIndex((o) => o.value === currentVal);
    this.highlightedIndex.set(idx >= 0 ? idx : 0);

    this.isOpen.set(true);
    this.focused.set(true);

    setTimeout(() => this.searchInputRef?.nativeElement.focus(), 50);
  }

  close(): void {
    this.isOpen.set(false);
    this.searchQuery.set('');
    this.highlightedIndex.set(-1);
    this.touched.set(true);
    this.onTouched();
    if (this.fieldRef) {
      this.fieldRef.nativeElement.focus();
    }
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
    this.highlightedIndex.set(0);
  }

  onSearchKeydown(event: KeyboardEvent): void {
    event.stopPropagation();
    const opts = this.filteredOptions();

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (opts.length > 0) {
          this.highlightedIndex.update((curr) => (curr + 1) % opts.length);
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (opts.length > 0) {
          this.highlightedIndex.update((curr) => (curr <= 0 ? opts.length - 1 : curr - 1));
        }
        break;
      case 'Enter':
        event.preventDefault();
        const highlighted = opts[this.highlightedIndex()];
        if (highlighted && !highlighted.disabled) {
          this.selectOption(highlighted);
        }
        break;
      case 'Escape':
        event.preventDefault();
        this.close();
        break;
    }
  }

  clearSearch(event: MouseEvent): void {
    event.stopPropagation();
    this.searchQuery.set('');
    this.highlightedIndex.set(0);
    this.searchInputRef?.nativeElement.focus();
  }

  clearSelection(event: MouseEvent): void {
    event.stopPropagation();
    this.value.set('');
    this.touched.set(true);
    this.onChange('');
    this.onTouched();
  }

  selectOption(option: SelectOption): void {
    if (option.disabled) return;
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
