import {
  Component,
  ElementRef,
  inject,
  input,
  computed,
  effect,
  DestroyRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { MatRipple } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

export type ButtonVariant = 'filled' | 'tonal' | 'outlined' | 'text' | 'elevated';
export type ButtonColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'success'
  | 'warning'
  | 'info'
  | 'error';
export type ButtonSize = 'xs'|'sm' | 'md' | 'lg';

/**
 * Botón base del template. Se aplica como atributo sobre <button> o <a>
 * (igual que mat-button), así se conserva el comportamiento nativo:
 * foco, activación con Enter/Espacio, submit de formularios, etc.
 *
 * Uso:
 *   <button appButton variant="filled" color="primary">Guardar</button>
 *   <a appButton variant="text" color="info" href="/reportes">Ver más</a>
 */
@Component({
  selector: 'button[appButton], a[appButton]',
  standalone: true,
  imports: [MatProgressSpinnerModule, MatIconModule],
  hostDirectives: [MatRipple],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-button',
    '[class]': 'hostClasses()',
    '[attr.disabled]': 'isDisabled() ? true : null',
    '[attr.aria-busy]': 'loading() ? "true" : null',
    '[attr.aria-disabled]': 'isDisabled() ? "true" : null',
  },
  template: `
    @if (icon() && iconPosition() === 'start' && !loading()) {
      <mat-icon class="app-button__icon">{{ icon() }}</mat-icon>
    }

    @if (loading()) {
      <mat-spinner class="app-button__spinner" [diameter]="spinnerSize()" strokeWidth="2" />
    }

    <span class="app-button__label" [class.app-button__label--hidden]="loading()">
      <ng-content />
    </span>

    @if (icon() && iconPosition() === 'end' && !loading()) {
      <mat-icon class="app-button__icon">{{ icon() }}</mat-icon>
    }
  `,
  styleUrl: './button.component.scss',
})
export class AppButtonComponent {
  private hostEl = inject(ElementRef<HTMLButtonElement | HTMLAnchorElement>);
  private focusMonitor = inject(FocusMonitor);
  private destroyRef = inject(DestroyRef);
  private ripple = inject(MatRipple);

  variant = input<ButtonVariant>('filled');
  color = input<ButtonColor>('primary');
  size = input<ButtonSize>('md');
  disabled = input(false);
  loading = input(false);
  icon = input<string | null>(null);
  iconPosition = input<'start' | 'end'>('start');

  isDisabled = computed(() => this.disabled() || this.loading());

  spinnerSize = computed(() => (this.size() === 'sm' ? 14 : this.size() === 'lg' ? 22 : 18));

  hostClasses = computed(() =>
    [
      `app-button--${this.variant()}`,
      `app-button--${this.color()}`,
      `app-button--${this.size()}`,
      this.isDisabled() ? 'app-button--disabled' : '',
    ]
      .filter(Boolean)
      .join(' ')
  );

  constructor() {
    // El ripple de Material corre sobre primitivas del CDK (platform + fast-dom).
    // Lo apagamos cuando el botón está disabled/loading para que no reaccione a clicks.
    effect(() => {
      this.ripple.disabled = this.isDisabled();
    });

    // CDK FocusMonitor: distingue el origen del foco (keyboard / mouse / touch / program).
    // Así el anillo de foco solo se muestra en navegación por teclado, no al hacer click.
    this.focusMonitor.monitor(this.hostEl, true).subscribe((origin: FocusOrigin) => {
      this.hostEl.nativeElement.classList.toggle('cdk-keyboard-focused', origin === 'keyboard');
    });

    this.destroyRef.onDestroy(() => this.focusMonitor.stopMonitoring(this.hostEl));
  }
}
