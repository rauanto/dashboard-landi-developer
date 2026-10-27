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

const APP_MULTI_SELECT_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => AppMultiSelectComponent),
  multi: true,
};

@Component({
  selector: 'app-multi-select',
  imports: [MatIconModule, OverlayModule],
  providers: [APP_MULTI_SELECT_VALUE_ACCESSOR],
  host: {
    class: 'app-multi-select-host',
    '[class]': 'hostClasses()',
  },
  template: `
    <div
      class="app-multi-select__field"
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
        <mat-icon class="app-multi-select__icon">{{ prefixIcon() }}</mat-icon>
      }

      <div class="app-multi-select__control">
        @if (!hasValue()) {
          <span class="app-multi-select__placeholder">{{ placeholder() }}</span>
        } @else {
          <div class="app-multi-select__chips">
            @for (item of displayedOptions(); track item.value) {
              <span class="app-multi-select__chip" (click)="$event.stopPropagation()">
                <span class="app-multi-select__chip-label">{{ item.label }}</span>
                @if (!disabled()) {
                  <button
                    type="button"
                    class="app-multi-select__chip-remove"
                    (click)="removeOption(item.value, $event)"
                    [attr.aria-label]="'Quitar ' + item.label"
                  >
                    <mat-icon>close</mat-icon>
                  </button>
                }
              </span>
            }
            @if (remainingCount() > 0) {
              <span class="app-multi-select__chip app-multi-select__chip--count">
                +{{ remainingCount() }}
              </span>
            }
          </div>
        }
      </div>

      @if (clearable() && hasValue() && !disabled()) {
        <button
          type="button"
          class="app-multi-select__clear-btn"
          (click)="clearAll($event)"
          aria-label="Limpiar selección"
        >
          <mat-icon>cancel</mat-icon>
        </button>
      }

      <mat-icon
        class="app-multi-select__dropdown-icon"
        [class.app-multi-select__dropdown-icon--open]="isOpen()"
      >
        expand_more
      </mat-icon>

      @if (label(); as l) {
        <label
          class="app-multi-select__label"
          [class.app-multi-select__label--floating]="isFloating()"
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
      <div class="app-multi-select__dropdown" role="listbox" aria-multiselectable="true">
        @if (searchable()) {
          <div class="app-multi-select__search-header">
            <mat-icon class="app-multi-select__search-icon">search</mat-icon>
            <input
              #searchInput
              class="app-multi-select__search-input"
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
                class="app-multi-select__search-clear"
                (click)="clearSearch($event)"
                aria-label="Limpiar búsqueda"
              >
                <mat-icon>close</mat-icon>
              </button>
            }
          </div>
        }

        @if (showSelectAll() && options().length > 1) {
          <div class="app-multi-select__actions-bar">
            <button
              type="button"
              class="app-multi-select__action-link"
              (click)="selectAll()"
            >
              Seleccionar todos ({{ filteredOptions().length }})
            </button>
            @if (hasValue()) {
              <button
                type="button"
                class="app-multi-select__action-link app-multi-select__action-link--danger"
                (click)="clearAll()"
              >
                Deseleccionar todos
              </button>
            }
          </div>
        }

        <div class="app-multi-select__options-list">
          @for (option of filteredOptions(); track option.value) {
            <div
              class="app-multi-select__option"
              [class.app-multi-select__option--selected]="isSelected(option.value)"
              [class.app-multi-select__option--disabled]="option.disabled"
              (click)="toggleOption(option)"
              role="option"
              [attr.aria-selected]="isSelected(option.value)"
            >
              <mat-icon class="app-multi-select__checkbox">
                {{ isSelected(option.value) ? 'check_box' : 'check_box_outline_blank' }}
              </mat-icon>
              @if (option.icon) {
                <mat-icon class="app-multi-select__option-icon">{{ option.icon }}</mat-icon>
              }
              <div class="app-multi-select__option-details">
                <span class="app-multi-select__option-label">{{ option.label }}</span>
                @if (option.description) {
                  <span class="app-multi-select__option-desc">{{ option.description }}</span>
                }
              </div>
            </div>
          } @empty {
            <div class="app-multi-select__empty-state">
              <mat-icon class="app-multi-select__empty-icon">search_off</mat-icon>
              <span>{{ notFoundText() }}</span>
            </div>
          }
        </div>
      </div>
    </ng-template>

    @if (effectiveError(); as err) {
      <span class="app-multi-select__helper app-multi-select__helper--error" role="alert">{{ err }}</span>
    } @else if (hint(); as h) {
      <span class="app-multi-select__helper">{{ h }}</span>
    }
  `,
  styleUrl: './multi-select.component.scss',
})
export class AppMultiSelectComponent implements ControlValueAccessor, AfterViewInit, OnDestroy {
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
  searchable = input(true);
  searchPlaceholder = input('Buscar opciones...');
  maxDisplayedChips = input<number>(2);
  showSelectAll = input(true);
  clearable = input(true);
  notFoundText = input('No se encontraron resultados');

  value = signal<unknown[]>([]);
  disabled = signal(false);
  focused = signal(false);
  isOpen = signal(false);
  triggerWidth = signal<number | string>('100%');
  searchQuery = signal('');
  touched = signal(false);

  requiredErrorMessage = input('Debes seleccionar al menos una opción');

  private onChange: (value: unknown[]) => void = () => {};
  private onTouched: () => void = () => {};

  hasValue = computed(() => this.value().length > 0);

  isCatalogValid = computed(() => {
    if (!this.hasValue()) return true;
    const allowed = new Set(this.options().map((o) => o.value));
    return this.value().every((val) => allowed.has(val));
  });

  catalogError = computed(() =>
    !this.isCatalogValid() ? 'Una o más opciones seleccionadas no pertenecen al catálogo' : null
  );

  requiredError = computed(() =>
    this.required() && this.touched() && !this.hasValue() ? this.requiredErrorMessage() : null
  );

  effectiveError = computed(() => this.errorMessage() || this.catalogError() || this.requiredError());
  hasError = computed(() => !!this.effectiveError());

  isFloating = computed(() => this.focused() || this.hasValue() || !!this.placeholder());
  hasPrefixIcon = computed(() => !!this.prefixIcon());

  selectedOptions = computed(() => {
    const currentValues = this.value();
    return this.options().filter(o => currentValues.includes(o.value));
  });

  displayedOptions = computed(() => {
    return this.selectedOptions().slice(0, this.maxDisplayedChips());
  });

  remainingCount = computed(() => {
    return Math.max(0, this.selectedOptions().length - this.maxDisplayedChips());
  });

  filteredOptions = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.options();
    return this.options().filter(o =>
      o.label.toLowerCase().includes(query) ||
      (o.description && o.description.toLowerCase().includes(query))
    );
  });

  hostClasses = computed(() =>
    [
      `app-multi-select--${this.variant()}`,
      `app-multi-select--${this.size()}`,
      `app-multi-select--${this.hasError() ? 'error' : this.color()}`,
      this.focused() ? 'app-multi-select--focused' : '',
      this.isOpen() ? 'app-multi-select--open' : '',
      this.disabled() ? 'app-multi-select--disabled' : '',
      this.hasPrefixIcon() ? 'app-multi-select--has-icon' : '',
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
    if (Array.isArray(value)) {
      this.value.set(value);
    } else if (value !== null && value !== undefined && value !== '') {
      this.value.set([value]);
    } else {
      this.value.set([]);
    }
  }

  registerOnChange(fn: (value: unknown[]) => void): void {
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

  isSelected(val: unknown): boolean {
    return this.value().includes(val);
  }

  toggleOption(option: SelectOption): void {
    if (option.disabled) return;
    if (this.isSelected(option.value)) {
      this.value.update((arr) => arr.filter((v) => v !== option.value));
    } else {
      this.value.update((arr) => [...arr, option.value]);
    }
    this.onChange(this.value());
    this.onTouched();
  }

  selectAll(): void {
    const selectableValues = this.filteredOptions()
      .filter((o) => !o.disabled)
      .map((o) => o.value);

    // Merge with current selections
    const merged = Array.from(new Set([...this.value(), ...selectableValues]));
    this.value.set(merged);
    this.onChange(this.value());
    this.onTouched();
  }

  clearAll(event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    this.value.set([]);
    this.onChange([]);
    this.onTouched();
  }

  removeOption(val: unknown, event: MouseEvent): void {
    event.stopPropagation();
    if (this.disabled()) return;
    this.value.update((arr) => arr.filter((v) => v !== val));
    this.onChange(this.value());
    this.onTouched();
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

  onBlur(): void {
    this.touched.set(true);
    this.onTouched();
  }
}
