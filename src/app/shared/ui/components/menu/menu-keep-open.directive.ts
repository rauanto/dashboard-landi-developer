import { Directive, ElementRef, inject, input } from '@angular/core';
import { CdkMenuItem, CdkMenuTrigger } from '@angular/cdk/menu';

/**
 * @internal Hace que un item de CDK Menu (checkbox/radio) no cierre el menú al elegirse.
 * Intercepta click y Enter/Espacio en fase de captura y dispara trigger({ keepOpen: true }).
 */
@Directive({ selector: '[appMenuKeepOpen]' })
export class AppMenuKeepOpenDirective {
  appMenuKeepOpen = input(false);

  constructor() {
    const el = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
    const item = inject(CdkMenuItem, { self: true });

    el.addEventListener(
      'click',
      (e) => {
        if (!this.appMenuKeepOpen()) return;
        e.stopImmediatePropagation();
        item.trigger({ keepOpen: true });
      },
      true
    );
    el.addEventListener(
      'keydown',
      (e) => {
        if (!this.appMenuKeepOpen() || (e.key !== 'Enter' && e.key !== ' ')) return;
        e.stopImmediatePropagation();
        e.preventDefault();
        item.trigger({ keepOpen: true });
      },
      true
    );
  }
}

/**
 * @internal En items que abren un submenú: si el submenú ya se abrió al pasar el mouse,
 * el click no lo cierra (comportamiento de mat-menu).
 */
@Directive({ selector: '[appMenuSubmenu]' })
export class AppMenuSubmenuDirective {
  constructor() {
    const el = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
    const trigger = inject(CdkMenuTrigger, { self: true });
    el.addEventListener(
      'click',
      (e) => {
        if (trigger.isOpen()) e.stopImmediatePropagation();
      },
      true
    );
  }
}
