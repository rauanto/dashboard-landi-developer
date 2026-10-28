import { Directive, effect, inject, input, signal } from '@angular/core';
import { CdkMenuTrigger } from '@angular/cdk/menu';
import { ConnectedPosition } from '@angular/cdk/overlay';
import { AppMenuComponent } from './menu.component';
import { MenuPlacement } from './menu.types';

const GAP = 4;
const below = (x: 'start' | 'end'): ConnectedPosition[] => [
  { originX: x, originY: 'bottom', overlayX: x, overlayY: 'top', offsetY: GAP },
  { originX: x, originY: 'top', overlayX: x, overlayY: 'bottom', offsetY: -GAP },
];
const above = (x: 'start' | 'end'): ConnectedPosition[] => [
  { originX: x, originY: 'top', overlayX: x, overlayY: 'bottom', offsetY: -GAP },
  { originX: x, originY: 'bottom', overlayX: x, overlayY: 'top', offsetY: GAP },
];

export const MENU_POSITIONS: Record<MenuPlacement, ConnectedPosition[]> = {
  'below-start': [...below('start'), ...below('end')],
  'below-end': [...below('end'), ...below('start')],
  'above-start': [...above('start'), ...above('end')],
  'above-end': [...above('end'), ...above('start')],
  right: [
    { originX: 'end', originY: 'top', overlayX: 'start', overlayY: 'top', offsetX: GAP },
    { originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'top', offsetX: -GAP },
  ],
  left: [
    { originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'top', offsetX: -GAP },
    { originX: 'end', originY: 'top', overlayX: 'start', overlayY: 'top', offsetX: GAP },
  ],
};

/**
 * Abre un <app-menu> al hacer click / Enter / Espacio / ↓ sobre el elemento.
 *
 * <button appButton [appMenuTriggerFor]="m" appMenuPlacement="below-end" [appMenuData]="fila">…</button>
 */
@Directive({
  selector: '[appMenuTriggerFor]',
  exportAs: 'appMenuTrigger',
  hostDirectives: [
    {
      directive: CdkMenuTrigger,
      outputs: ['cdkMenuOpened: appMenuOpened', 'cdkMenuClosed: appMenuClosed'],
    },
  ],
  host: {
    '[class.app-menu-trigger--open]': 'isOpen()',
  },
})
export class AppMenuTriggerDirective {
  private cdk = inject(CdkMenuTrigger, { self: true });

  appMenuTriggerFor = input.required<AppMenuComponent>();
  appMenuData = input<unknown>(undefined);
  appMenuPlacement = input<MenuPlacement>('below-start');

  readonly isOpen = signal(false);

  constructor() {
    effect(() => {
      this.cdk.menuTemplateRef = this.appMenuTriggerFor().template();
      this.cdk.menuData = { $implicit: this.appMenuData() }; // el contexto del template: let-data
      this.cdk.menuPosition = MENU_POSITIONS[this.appMenuPlacement()];
    });
    this.cdk.opened.subscribe(() => this.isOpen.set(true));
    this.cdk.closed.subscribe(() => this.isOpen.set(false));
  }

  open(): void { this.cdk.open(); }
  close(): void { this.cdk.close(); }
  toggle(): void { this.cdk.toggle(); }
}
