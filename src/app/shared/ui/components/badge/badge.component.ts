import {
  Component,
  input,
  computed,
  effect,
  inject,
  output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatIconModule } from '@angular/material/icon';

export type BadgeVariant = 'filled' | 'tonal' | 'outlined';
export type BadgeColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'success'
  | 'warning'
  | 'info'
  | 'error'
  | 'neutral';
export type BadgeSize = 'xs' | 'sm' | 'md' | 'lg';

/**
 * Badge / status-pill. Pensado para estados de negocio: "Aprobado",
 * "Pendiente", "Vencida", "Rechazado", etc. en tablas de estimaciones,
 * obras, cartera vencida, etc.
 *
 * Modo dot: <app-badge color="success" [dot]="true" /> -> punto de 8px,
 * útil como indicador compacto dentro de una celda de tabla.
 *
 * Uso:
 *   <app-badge color="success" variant="tonal" icon="check_circle">Aprobado</app-badge>
 *   <app-badge color="warning" variant="outlined">Pendiente</app-badge>
 *   <app-badge color="error" [dismissible]="true" (dismissed)="quitarFiltro()">Vencida</app-badge>
 */
@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-badge',
    '[class]': 'hostClasses()',
    role: 'status',
  },
  template: `
    @if (dot()) {
      <span class="app-badge__dot"></span>
    } @else {
      @if (icon()) {
        <mat-icon class="app-badge__icon">{{ icon() }}</mat-icon>
      }

      <span class="app-badge__label"><ng-content /></span>

      @if (dismissible()) {
        <button
          type="button"
          class="app-badge__dismiss"
          [attr.aria-label]="'Quitar ' + (ariaLabel() ?? 'etiqueta')"
          (click)="onDismiss($event)"
        >
          <mat-icon class="app-badge__dismiss-icon">close</mat-icon>
        </button>
      }
    }
  `,
  styleUrl: './badge.component.scss',
})
export class AppBadgeComponent {
  private liveAnnouncer = inject(LiveAnnouncer);

  variant = input<BadgeVariant>('tonal');
  color = input<BadgeColor>('neutral');
  size = input<BadgeSize>('md');
  icon = input<string | null>(null);
  dot = input(false);
  dismissible = input(false);

  /** Si es true, cada vez que cambie ariaLabel() se anuncia a lectores de pantalla. */
  announceChanges = input(false);
  /** Texto accesible del estado actual, ej: "Aprobado". Úsalo si no confías en el texto proyectado. */
  ariaLabel = input<string | null>(null);

  dismissed = output<void>();

  hostClasses = computed(() =>
    [
      `app-badge--${this.variant()}`,
      `app-badge--${this.color()}`,
      `app-badge--${this.size()}`,
      this.dot() ? 'app-badge--dot' : '',
    ]
      .filter(Boolean)
      .join(' ')
  );

  constructor() {
    // CDK LiveAnnouncer: cuando el estado del badge cambia dinámicamente
    // (ej. una estimación pasa de "Pendiente" a "Aprobado"), se lo avisamos
    // a lectores de pantalla sin que el usuario tenga que volver a enfocar nada.
    effect(() => {
      if (this.announceChanges() && this.ariaLabel()) {
        this.liveAnnouncer.announce(this.ariaLabel()!, 'polite');
      }
    });
  }

  onDismiss(event: Event) {
    event.stopPropagation();
    this.dismissed.emit();
  }
}
