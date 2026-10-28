import { Directive, ElementRef, OnDestroy, effect, inject, input, signal } from '@angular/core';
import { CdkContextMenuTrigger } from '@angular/cdk/menu';
import { AppMenuComponent } from './menu.component';

const LONG_PRESS_MS = 550;
const MOVE_TOLERANCE_PX = 10;

/**
 * Menú contextual (click derecho, pulsación larga en táctil, tecla Menú o Shift+F10).
 *
 * <tr [appContextMenu]="menuFila" [appContextMenuData]="fila">…</tr>
 *
 * Los `command(data)` y `itemSelect.data` del menú reciben `appContextMenuData`.
 */
@Directive({
  selector: '[appContextMenu]',
  exportAs: 'appContextMenu',
  hostDirectives: [
    {
      directive: CdkContextMenuTrigger,
      outputs: ['cdkContextMenuOpened: appContextMenuOpened', 'cdkContextMenuClosed: appContextMenuClosed'],
    },
  ],
  host: {
    '[class.app-context-open]': 'isOpen()',
    '(keydown)': 'onKeydown($event)',
    '(touchstart)': 'touchStart($event)',
    '(touchmove)': 'touchMove($event)',
    '(touchend)': 'touchCancel()',
    '(touchcancel)': 'touchCancel()',
  },
})
export class AppContextMenuDirective implements OnDestroy {
  private cdk = inject(CdkContextMenuTrigger, { self: true });
  private el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  appContextMenu = input.required<AppMenuComponent>();
  appContextMenuData = input<unknown>(undefined);
  appContextMenuDisabled = input(false);

  readonly isOpen = signal(false);

  private pressTimer?: ReturnType<typeof setTimeout>;
  private pressStart?: { x: number; y: number };

  constructor() {
    effect(() => {
      this.cdk.menuTemplateRef = this.appContextMenu().template();
      this.cdk.menuData = { $implicit: this.appContextMenuData() }; // el contexto del template: let-data
      this.cdk.disabled = this.appContextMenuDisabled();
    });
    this.cdk.opened.subscribe(() => this.isOpen.set(true));
    this.cdk.closed.subscribe(() => this.isOpen.set(false));
  }

  /** Abre el menú en esas coordenadas de pantalla (cierra cualquier otro menú abierto). */
  open(x: number, y: number): void {
    if (this.appContextMenuDisabled()) return;
    // Pasa por el mismo camino que un click derecho real, así CDK cierra otros menús abiertos.
    this.el.dispatchEvent(
      new MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2, clientX: x, clientY: y })
    );
  }
  close(): void { this.cdk.close(); }

  // Teclado: tecla "Menú" o Shift+F10 abren en el elemento enfocado
  onKeydown(e: KeyboardEvent): void {
    if (e.key !== 'ContextMenu' && !(e.shiftKey && e.key === 'F10')) return;
    e.preventDefault();
    const target = (e.target as HTMLElement) ?? this.el;
    const r = target.getBoundingClientRect();
    this.open(r.left + Math.min(r.width / 2, 48), r.top + r.height / 2);
  }

  // Pulsación larga (iOS no dispara contextmenu)
  touchStart(e: TouchEvent): void {
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    this.pressStart = { x: t.clientX, y: t.clientY };
    this.pressTimer = setTimeout(() => {
      this.open(this.pressStart!.x, this.pressStart!.y);
      this.pressTimer = undefined;
    }, LONG_PRESS_MS);
  }

  touchMove(e: TouchEvent): void {
    if (!this.pressTimer || !this.pressStart) return;
    const t = e.touches[0];
    if (Math.hypot(t.clientX - this.pressStart.x, t.clientY - this.pressStart.y) > MOVE_TOLERANCE_PX) {
      this.touchCancel();
    }
  }

  touchCancel(): void {
    clearTimeout(this.pressTimer);
    this.pressTimer = undefined;
  }

  ngOnDestroy(): void {
    this.touchCancel();
  }
}
