import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

export type PageHeaderVariant = 'plain' | 'filled' | 'outlined';
export type PageHeaderDensity = 'comfortable' | 'compact';
export type PageHeaderSection = 'toolbar' | 'tabs' | 'extra';

export interface HeaderCrumb {
  label: string;
  /** Si lo defines, se renderiza como enlace <a>. Si no, como botón (usa (crumbClick)). */
  href?: string;
  /** Ícono mat-icon opcional (p. ej. 'home'). */
  icon?: string;
  /** Dato libre que recibes de vuelta en (crumbClick). */
  data?: unknown;
}

/**
 * Header de página minimalista con secciones que se activan solas
 * según el contenido que proyectes (o las que fuerces con `hide`).
 *
 *  Fila 1  [back] [appHeaderLeading] Ruta › Título [appHeaderTitleAfter] ........ [appHeaderActions]
 *          descripción / [appHeaderSubtitle]
 *  Fila 2  [appHeaderToolbar]  |  [appHeaderFilters] ................. [appHeaderToolbarEnd]   (toolbar)
 *  Fila 3  [appHeaderTabs]                                                                      (tabs)
 *  Fila 4  [appHeaderExtra]  (stats, alertas, banner…)                                          (extra)
 *
 * <app-page-header title="FINCRECE" [breadcrumbs]="[{ label: 'Mi unidad' }]">
 *   <button appHeaderTitleAfter appButton variant="text" icon="arrow_drop_down" [appMenuTriggerFor]="m"></button>
 *   <app-button-toggle appHeaderActions … />
 *   <button appHeaderToolbar appButton variant="tonal">Preguntarle a Gemini</button>
 *   <ng-container appHeaderFilters>
 *     <app-header-filter label="Tipo" [items]="tipos" />
 *   </ng-container>
 * </app-page-header>
 */
@Component({
  selector: 'app-page-header',
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-page-header',
    '[class]': 'hostClasses()',
    '[style.--_top]': 'stickyOffset()',
  },
  template: `
    <div class="ph__main">
      @if (back()) {
        <button type="button" class="ph__back" aria-label="Volver" (click)="backClick.emit()">
          <mat-icon>arrow_back</mat-icon>
        </button>
      }
      <div class="ph__leading"><ng-content select="[appHeaderLeading]" /></div>

      <div class="ph__heading">
        <div class="ph__line">
          @if (breadcrumbs().length) {
            <nav class="ph__crumbs" aria-label="Ruta de navegación">
              <ol>
                @for (c of breadcrumbs(); track $index) {
                  <li>
                    @if (c.href) {
                      <a class="ph__crumb" [href]="c.href" (click)="crumbClick.emit(c)">
                        @if (c.icon) { <mat-icon>{{ c.icon }}</mat-icon> }{{ c.label }}
                      </a>
                    } @else {
                      <button type="button" class="ph__crumb" (click)="crumbClick.emit(c)">
                        @if (c.icon) { <mat-icon>{{ c.icon }}</mat-icon> }{{ c.label }}
                      </button>
                    }
                    <mat-icon class="ph__sep" aria-hidden="true">chevron_right</mat-icon>
                  </li>
                }
              </ol>
            </nav>
          }
          @if (title()) {
            <div class="ph__title" role="heading" [attr.aria-level]="headingLevel()">{{ title() }}</div>
          }
          <div class="ph__title-after"><ng-content select="[appHeaderTitleAfter]" /></div>
        </div>
        @if (description()) {
          <div class="ph__description">{{ description() }}</div>
        }
        <div class="ph__subtitle"><ng-content select="[appHeaderSubtitle]" /></div>
      </div>

      <div class="ph__actions"><ng-content select="[appHeaderActions]" /></div>
    </div>

    @if (!hidden('toolbar')) {
      <div class="ph__toolbar">
        <div class="ph__tb-start"><ng-content select="[appHeaderToolbar]" /></div>
        <span class="ph__divider" aria-hidden="true"></span>
        <div class="ph__filters" role="group" aria-label="Filtros"><ng-content select="[appHeaderFilters]" /></div>
        <div class="ph__tb-end"><ng-content select="[appHeaderToolbarEnd]" /></div>
      </div>
    }

    @if (!hidden('tabs')) {
      <div class="ph__tabs"><ng-content select="[appHeaderTabs]" /></div>
    }
    @if (!hidden('extra')) {
      <div class="ph__extra"><ng-content select="[appHeaderExtra]" /></div>
    }
  `,
  styleUrl: './page-header.component.scss',
})
export class AppPageHeaderComponent {
  title = input<string | null>(null);
  description = input<string | null>(null);
  /** Rutas anteriores; el título actual va en `title`. */
  breadcrumbs = input<HeaderCrumb[]>([]);
  headingLevel = input(1);

  /** Muestra el botón de volver. */
  back = input(false);

  variant = input<PageHeaderVariant>('plain');
  density = input<PageHeaderDensity>('comfortable');
  /** Se queda pegado arriba al hacer scroll (con sombra sutil). */
  sticky = input(false);
  /** `top` para sticky, p. ej. '3.5rem' si hay una barra fija arriba. */
  stickyOffset = input('0px');
  /** Línea inferior fina. */
  bordered = input(false);
  /** Apaga secciones aunque tengan contenido. */
  hide = input<PageHeaderSection[]>([]);

  backClick = output<void>();
  crumbClick = output<HeaderCrumb>();

  hidden(s: PageHeaderSection): boolean {
    return this.hide().includes(s);
  }

  hostClasses = computed(() =>
    [
      `app-page-header--${this.variant()}`,
      `app-page-header--${this.density()}`,
      this.sticky() ? 'app-page-header--sticky' : '',
      this.bordered() ? 'app-page-header--bordered' : '',
    ]
      .filter(Boolean)
      .join(' ')
  );
}
