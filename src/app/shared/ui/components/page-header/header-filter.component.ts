import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { AppButtonComponent } from '../button/button.component';
import { AppMenuComponent } from '../menu/menu.component';
import { AppMenuTriggerDirective } from '../menu/menu-trigger.directive';
import { MenuItem, MenuPlacement, MenuSelectEvent } from '../menu/menu.types';

/**
 * Filtro tipo "chip desplegable" (Tipo ▾, Personas ▾…) para el header.
 * Se ve outlined; con `value` se vuelve tonal y muestra "Etiqueta: valor".
 *
 * <app-header-filter label="Tipo" [items]="tipos" [value]="tipo()" (itemSelect)="tipo.set($event.item.label)" (cleared)="tipo.set(null)" />
 */
@Component({
  selector: 'app-header-filter',
  imports: [AppButtonComponent, AppMenuComponent, AppMenuTriggerDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'app-header-filter' },
  template: `
    <button
      appButton
      size="sm"
      [variant]="value() ? 'tonal' : 'outlined'"
      [color]="value() ? 'secondary' : 'primary'"
      [icon]="icon()"
      [disabled]="disabled()"
      [appMenuTriggerFor]="menu"
      [appMenuPlacement]="placement()"
      [attr.aria-label]="ariaText()"
    >
      {{ text() }}
    </button>
    @if (value() && clearable()) {
      <button type="button" class="app-header-filter__clear" aria-label="Quitar filtro" (click)="cleared.emit()">×</button>
    }
    <app-menu #menu [items]="items()" [minWidth]="minWidth()" [ariaLabel]="label()" (itemSelect)="itemSelect.emit($event)" />
  `,
  styles: `
    :host { display: inline-flex; align-items: center; position: relative; flex-shrink: 0; }
    .app-header-filter__clear {
      margin-left: -0.25rem; width: 1.5rem; height: 1.5rem; border: 0; border-radius: 50%;
      background: transparent; color: inherit; font-size: 1.125rem; line-height: 1; cursor: pointer;
    }
    .app-header-filter__clear:hover { background: color-mix(in srgb, currentColor 12%, transparent); }
  `,
})
export class AppHeaderFilterComponent {
  label = input.required<string>();
  items = input<MenuItem[]>([]);
  /** Valor activo a mostrar (null = sin filtro). */
  value = input<string | null>(null);
  icon = input<string | null>(null);
  placement = input<MenuPlacement>('below-start');
  minWidth = input('12rem');
  clearable = input(true);
  disabled = input(false);

  itemSelect = output<MenuSelectEvent>();
  cleared = output<void>();

  text = computed(() => (this.value() ? `${this.label()}: ${this.value()}` : this.label()));
  ariaText = computed(() => `Filtro ${this.text()}`);
}
