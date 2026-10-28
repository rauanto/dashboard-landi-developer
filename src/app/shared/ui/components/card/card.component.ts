import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  model,
  output,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

export type CardVariant = 'elevated' | 'filled' | 'outlined';
export type CardColor =
  | 'surface'
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'success'
  | 'warning'
  | 'info'
  | 'error';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

let nextId = 0;

/**
 * Card con zonas definidas:
 *
 *  ┌───────────────────────────────────────────┐
 *  │ [leading] Título                [acciones]│  header  (heading / description / appCardHeaderActions)
 *  │           descripción                     │
 *  │                                           │
 *  │              cuerpo (contenido)           │  body    (contenido por defecto)
 *  │                                           │
 *  │ [appCardFooterStart]     [appCardFooterEnd]│ footer   (acción rápida a la izquierda, botones a la derecha)
 *  └───────────────────────────────────────────┘
 *
 * Slots (atributos):
 *   appCardMedia          imagen/media a sangre arriba del header
 *   appCardLeading        avatar/ícono a la izquierda del título (o usa [leadingIcon])
 *   appCardHeaderActions  acciones rápidas arriba a la derecha
 *   appCardFooterStart    acción rápida abajo a la izquierda
 *   appCardFooterEnd      botones principales abajo a la derecha
 *   (cualquier otro contenido)  cuerpo
 *
 * <app-card heading="Cliente" description="Información general" variant="outlined" [divided]="true">
 *   <button appCardHeaderActions appButton variant="text" size="sm">Editar</button>
 *   …cuerpo…
 *   <button appCardFooterStart appButton variant="text" size="sm">Ver historial</button>
 *   <ng-container appCardFooterEnd>
 *     <button appButton variant="outlined">Cancelar</button>
 *     <button appButton variant="filled">Guardar</button>
 *   </ng-container>
 * </app-card>
 *
 * Sin heading/description ni slots, funciona como la card simple de antes (solo cuerpo).
 */
@Component({
  selector: 'app-card',
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-card',
    '[class]': 'hostClasses()',
    '[attr.tabindex]': 'interactive() ? 0 : null',
    '[attr.aria-busy]': 'loading() ? true : null',
    '(click)': 'onHostClick($event)',
    '(keydown.enter)': 'onHostKey($event)',
    '(keydown.space)': 'onHostKey($event)',
  },
  template: `
    @if (loading()) {
      <div class="app-card__loading" role="progressbar" aria-label="Cargando"></div>
    }

    <div class="app-card__media"><ng-content select="[appCardMedia]" /></div>

    <header class="app-card__header" [class.app-card__header--show]="hasHeaderInputs()">
      <div class="app-card__leading">
        @if (leadingIcon(); as icon) {
          <span class="app-card__icon" aria-hidden="true"><mat-icon>{{ icon }}</mat-icon></span>
        }
        <ng-content select="[appCardLeading]" />
      </div>

      <div class="app-card__titles">
        @if (heading(); as h) {
          <div class="app-card__title" role="heading" [attr.aria-level]="headingLevel()" [id]="titleId">{{ h }}</div>
        }
        @if (description(); as d) {
          <div class="app-card__description">{{ d }}</div>
        }
        <ng-content select="[appCardHeader]" />
      </div>

      <div class="app-card__header-actions"><ng-content select="[appCardHeaderActions]" /></div>

      @if (collapsible()) {
        <button
          type="button"
          class="app-card__toggle"
          [attr.aria-expanded]="!collapsed()"
          [attr.aria-controls]="bodyId"
          [attr.aria-label]="collapsed() ? 'Expandir' : 'Contraer'"
          (click)="toggle($event)"
        >
          <mat-icon>expand_more</mat-icon>
        </button>
      }
    </header>

    <div class="app-card__collapse" [id]="bodyId">
      <div class="app-card__clip">
        <div class="app-card__body" [style.max-height]="maxBodyHeight()"><ng-content /></div>
      </div>
    </div>

    <footer class="app-card__footer">
      <div class="app-card__footer-start"><ng-content select="[appCardFooterStart]" /></div>
      <div class="app-card__footer-end"><ng-content select="[appCardFooterEnd]" /></div>
    </footer>
  `,
  styleUrl: './card.component.scss',
})
export class AppCardComponent {
  private host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  readonly titleId = `app-card-title-${nextId}`;
  readonly bodyId = `app-card-body-${nextId++}`;

  variant = input<CardVariant>('elevated');
  color = input<CardColor>('surface');

  /** Título del header (no usa el atributo nativo `title`). */
  heading = input<string | null>(null);
  description = input<string | null>(null);
  /** Nivel semántico del título (aria-level). */
  headingLevel = input(3);
  /** Ícono (mat-icon) a la izquierda del título. Para un avatar usa el slot [appCardLeading]. */
  leadingIcon = input<string | null>(null);

  padding = input<CardPadding>('md');
  /** Líneas divisorias entre header, cuerpo y footer. */
  divided = input(false);
  /** Hover + foco + (cardClick). No pongas botones dentro si la usas así; o detén la propagación. */
  interactive = input(false);
  /** Barra de progreso arriba y cuerpo atenuado. */
  loading = input(false);
  /** Muestra el botón de contraer/expandir el cuerpo. */
  collapsible = input(false);
  /** Estado contraído (two-way: [(collapsed)]). */
  collapsed = model(false);
  /** Altura máxima del cuerpo con scroll interno, p. ej. '16rem'. */
  maxBodyHeight = input<string | null>(null);
  /** La card ocupa todo el alto de su contenedor (útil en grids). */
  fullHeight = input(false);

  /** Click / Enter / Espacio sobre una card `interactive`. */
  cardClick = output<Event>();

  hasHeaderInputs = computed(() => !!(this.heading() || this.description() || this.leadingIcon() || this.collapsible()));

  hostClasses = computed(() =>
    [
      `app-card--${this.variant()}`,
      `app-card--${this.color()}`,
      `app-card--pad-${this.padding()}`,
      this.divided() ? 'app-card--divided' : '',
      this.interactive() ? 'app-card--interactive' : '',
      this.loading() ? 'app-card--loading' : '',
      this.collapsed() ? 'app-card--collapsed' : '',
      this.fullHeight() ? 'app-card--full' : '',
    ]
      .filter(Boolean)
      .join(' ')
  );

  toggle(e?: Event): void {
    e?.stopPropagation();
    this.collapsed.update((v) => !v);
  }

  onHostClick(e: MouseEvent): void {
    if (!this.interactive()) return;
    // ignora clicks en botones/enlaces internos
    if ((e.target as HTMLElement).closest('button, a, input, select, textarea, [role="menuitem"]')) return;
    this.cardClick.emit(e);
  }

  onHostKey(e: Event): void {
    if (!this.interactive() || e.target !== this.host) return;
    e.preventDefault();
    this.cardClick.emit(e);
  }
}
