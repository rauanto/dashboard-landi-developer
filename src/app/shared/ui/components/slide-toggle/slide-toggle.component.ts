import { Component, ChangeDetectionStrategy, computed, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

export type SlideToggleColor = 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'info' | 'error';
export type SlideToggleSize = 'sm' | 'md' | 'lg';

/**
 * Switch M3 (boolean).
 *
 * <app-slide-toggle formControlName="activo">Cliente activo</app-slide-toggle>
 */
@Component({
  selector: 'app-slide-toggle',
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AppSlideToggleComponent), multi: true },
  ],
  host: {
    class: 'app-toggle-host',
    '[class]': 'hostClasses()',
  },
  template: `
    <button
      type="button"
      role="switch"
      class="app-toggle__wrap"
      [class.app-toggle__wrap--before]="labelPosition() === 'before'"
      [attr.aria-checked]="checked()"
      [disabled]="effectiveDisabled()"
      (click)="toggle()"
      (blur)="onBlur()"
    >
      <span class="app-toggle__track">
        <span class="app-toggle__thumb">
          @if (showIcon() && checked()) {
            <mat-icon class="app-toggle__icon">check</mat-icon>
          }
        </span>
      </span>
      <span class="app-toggle__label"><ng-content />{{ label() }}</span>
    </button>

    @if (errorMessage(); as err) {
      <span class="app-toggle__helper app-toggle__helper--error" role="alert">{{ err }}</span>
    } @else if (hint(); as h) {
      <span class="app-toggle__helper">{{ h }}</span>
    }
  `,
  styleUrl: './slide-toggle.component.scss',
})
export class AppSlideToggleComponent implements ControlValueAccessor {
  label = input<string | null>(null);
  color = input<SlideToggleColor>('primary');
  size = input<SlideToggleSize>('md');
  labelPosition = input<'after' | 'before'>('after');
  showIcon = input(true);
  hint = input<string | null>(null);
  errorMessage = input<string | null>(null);
  disabled = input(false);

  checked = signal(false);
  private cvaDisabled = signal(false);

  private onChange: (v: boolean) => void = () => {};
  private onTouched: () => void = () => {};

  effectiveDisabled = computed(() => this.disabled() || this.cvaDisabled());

  hostClasses = computed(() =>
    [
      `app-toggle--${this.size()}`,
      `app-toggle--${this.errorMessage() ? 'error' : this.color()}`,
      this.checked() ? 'app-toggle--checked' : '',
      this.effectiveDisabled() ? 'app-toggle--disabled' : '',
    ]
      .filter(Boolean)
      .join(' ')
  );

  toggle(): void {
    if (this.effectiveDisabled()) return;
    const next = !this.checked();
    this.checked.set(next);
    this.onChange(next);
  }

  onBlur(): void {
    this.onTouched();
  }

  writeValue(value: boolean | null): void {
    this.checked.set(!!value);
  }
  registerOnChange(fn: (v: boolean) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }
}
