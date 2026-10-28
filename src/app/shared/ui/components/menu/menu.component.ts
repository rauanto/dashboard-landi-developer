import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, TemplateRef, input, output, signal, viewChild } from '@angular/core';
import {
  CdkMenu,
  CdkMenuGroup,
  CdkMenuItem,
  CdkMenuItemCheckbox,
  CdkMenuItemRadio,
  CdkMenuTrigger,
} from '@angular/cdk/menu';
import { MatIconModule } from '@angular/material/icon';
import { AppMenuKeepOpenDirective, AppMenuSubmenuDirective } from './menu-keep-open.directive';
import {
  MenuCheckbox,
  MenuFlag,
  MenuItem,
  MenuRadio,
  MenuSegment,
  MenuSelectEvent,
  MenuSize,
  buildMenuSegments,
} from './menu.types';

/**
 * Menú desplegable (equivalente a mat-menu) con submenús, checkbox, radios, atajos,
 * navegación por teclado y typeahead (CDK Menu). Se abre con [appMenuTriggerFor] o [appContextMenu].
 * Soporta hasta 4 niveles (raíz + 3 de submenús): CDK exige que cada nivel declare su lista dentro de su
 * propio cdkMenu, por eso la plantilla está desenrollada por nivel.
 *
 * <button appButton [appMenuTriggerFor]="acciones">Acciones</button>
 * <app-menu #acciones [items]="items" (itemSelect)="onSelect($event)" />
 */
@Component({
  selector: 'app-menu',
  exportAs: 'appMenu',
  imports: [
    NgTemplateOutlet,
    MatIconModule,
    CdkMenu,
    CdkMenuGroup,
    CdkMenuItem,
    CdkMenuItemCheckbox,
    CdkMenuItemRadio,
    CdkMenuTrigger,
    AppMenuKeepOpenDirective,
    AppMenuSubmenuDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-template #panel let-data>
      <div
        cdkMenu
        [class]="'app-menu app-menu--' + size()"
        role="menu"
        [attr.aria-label]="ariaLabel()"
        [style.min-width]="minWidth()"
        [style.max-width]="maxWidth()"
      >
        <!-- nivel 0: la lista se declara DENTRO de su cdkMenu para que los items se registren (teclado/foco) y reciban su MENU_STACK -->
        <ng-template #list0 let-segs let-data="data">
              @for (seg of segs; track $index) {
                @if (seg.kind === 'radios') {
                  <div cdkMenuGroup class="app-menu__group" role="group">
                    @for (r of seg.items; track r.value) {
                      @if (!flag(r.hidden, data)) {
                        <button
                          type="button"
                          cdkMenuItemRadio
                          [class]="itemClass(r)"
                          [cdkMenuItemChecked]="isChecked(r)"
                          [cdkMenuItemDisabled]="flag(r.disabled, data)"
                          [appMenuKeepOpen]="!!r.keepOpen"
                          (cdkMenuItemTriggered)="activate(r, data)"
                        >
                          <ng-container *ngTemplateOutlet="body; context: { $implicit: r, lead: hasLead(segs), mode: 'radio' }" />
                        </button>
                      }
                    }
                  </div>
                } @else {
                  @let it = $any(seg.item);
                  @if (!flag(it.hidden, data)) {
                    @switch (it.type) {
                      @case ('divider') {
                        <div class="app-menu__divider" role="separator"></div>
                      }
                      @case ('label') {
                        <div class="app-menu__label-group" role="presentation">{{ it.label }}</div>
                      }
                      @case ('checkbox') {
                        <button
                          type="button"
                          cdkMenuItemCheckbox
                          [class]="itemClass(it)"
                          [cdkMenuItemChecked]="isChecked(it)"
                          [cdkMenuItemDisabled]="flag(it.disabled, data)"
                          [appMenuKeepOpen]="!!it.keepOpen"
                          (cdkMenuItemTriggered)="activate(it, data)"
                        >
                          <ng-container *ngTemplateOutlet="body; context: { $implicit: it, lead: hasLead(segs), mode: 'checkbox' }" />
                        </button>
                      }
                      @case ('submenu') {
                        <button
                          type="button"
                          cdkMenuItem
                          [class]="itemClass(it)"
                          [cdkMenuTriggerFor]="sub0"
                          appMenuSubmenu
                          [cdkMenuItemDisabled]="flag(it.disabled, data)"
                        >
                          <ng-container *ngTemplateOutlet="body; context: { $implicit: it, lead: hasLead(segs), mode: 'submenu' }" />
                        </button>
                        <ng-template #sub0>
                          <div cdkMenu [class]="'app-menu app-menu--' + size()" role="menu" [attr.aria-label]="it.label">
                            <!-- nivel 1: la lista se declara DENTRO de su cdkMenu para que los items se registren (teclado/foco) y reciban su MENU_STACK -->
                            <ng-template #list1 let-segs let-data="data">
                                  @for (seg of segs; track $index) {
                                    @if (seg.kind === 'radios') {
                                      <div cdkMenuGroup class="app-menu__group" role="group">
                                        @for (r of seg.items; track r.value) {
                                          @if (!flag(r.hidden, data)) {
                                            <button
                                              type="button"
                                              cdkMenuItemRadio
                                              [class]="itemClass(r)"
                                              [cdkMenuItemChecked]="isChecked(r)"
                                              [cdkMenuItemDisabled]="flag(r.disabled, data)"
                                              [appMenuKeepOpen]="!!r.keepOpen"
                                              (cdkMenuItemTriggered)="activate(r, data)"
                                            >
                                              <ng-container *ngTemplateOutlet="body; context: { $implicit: r, lead: hasLead(segs), mode: 'radio' }" />
                                            </button>
                                          }
                                        }
                                      </div>
                                    } @else {
                                      @let it = $any(seg.item);
                                      @if (!flag(it.hidden, data)) {
                                        @switch (it.type) {
                                          @case ('divider') {
                                            <div class="app-menu__divider" role="separator"></div>
                                          }
                                          @case ('label') {
                                            <div class="app-menu__label-group" role="presentation">{{ it.label }}</div>
                                          }
                                          @case ('checkbox') {
                                            <button
                                              type="button"
                                              cdkMenuItemCheckbox
                                              [class]="itemClass(it)"
                                              [cdkMenuItemChecked]="isChecked(it)"
                                              [cdkMenuItemDisabled]="flag(it.disabled, data)"
                                              [appMenuKeepOpen]="!!it.keepOpen"
                                              (cdkMenuItemTriggered)="activate(it, data)"
                                            >
                                              <ng-container *ngTemplateOutlet="body; context: { $implicit: it, lead: hasLead(segs), mode: 'checkbox' }" />
                                            </button>
                                          }
                                          @case ('submenu') {
                                            <button
                                              type="button"
                                              cdkMenuItem
                                              [class]="itemClass(it)"
                                              [cdkMenuTriggerFor]="sub1"
                                              appMenuSubmenu
                                              [cdkMenuItemDisabled]="flag(it.disabled, data)"
                                            >
                                              <ng-container *ngTemplateOutlet="body; context: { $implicit: it, lead: hasLead(segs), mode: 'submenu' }" />
                                            </button>
                                            <ng-template #sub1>
                                              <div cdkMenu [class]="'app-menu app-menu--' + size()" role="menu" [attr.aria-label]="it.label">
                                                <!-- nivel 2: la lista se declara DENTRO de su cdkMenu para que los items se registren (teclado/foco) y reciban su MENU_STACK -->
                                                <ng-template #list2 let-segs let-data="data">
                                                      @for (seg of segs; track $index) {
                                                        @if (seg.kind === 'radios') {
                                                          <div cdkMenuGroup class="app-menu__group" role="group">
                                                            @for (r of seg.items; track r.value) {
                                                              @if (!flag(r.hidden, data)) {
                                                                <button
                                                                  type="button"
                                                                  cdkMenuItemRadio
                                                                  [class]="itemClass(r)"
                                                                  [cdkMenuItemChecked]="isChecked(r)"
                                                                  [cdkMenuItemDisabled]="flag(r.disabled, data)"
                                                                  [appMenuKeepOpen]="!!r.keepOpen"
                                                                  (cdkMenuItemTriggered)="activate(r, data)"
                                                                >
                                                                  <ng-container *ngTemplateOutlet="body; context: { $implicit: r, lead: hasLead(segs), mode: 'radio' }" />
                                                                </button>
                                                              }
                                                            }
                                                          </div>
                                                        } @else {
                                                          @let it = $any(seg.item);
                                                          @if (!flag(it.hidden, data)) {
                                                            @switch (it.type) {
                                                              @case ('divider') {
                                                                <div class="app-menu__divider" role="separator"></div>
                                                              }
                                                              @case ('label') {
                                                                <div class="app-menu__label-group" role="presentation">{{ it.label }}</div>
                                                              }
                                                              @case ('checkbox') {
                                                                <button
                                                                  type="button"
                                                                  cdkMenuItemCheckbox
                                                                  [class]="itemClass(it)"
                                                                  [cdkMenuItemChecked]="isChecked(it)"
                                                                  [cdkMenuItemDisabled]="flag(it.disabled, data)"
                                                                  [appMenuKeepOpen]="!!it.keepOpen"
                                                                  (cdkMenuItemTriggered)="activate(it, data)"
                                                                >
                                                                  <ng-container *ngTemplateOutlet="body; context: { $implicit: it, lead: hasLead(segs), mode: 'checkbox' }" />
                                                                </button>
                                                              }
                                                              @case ('submenu') {
                                                                <button
                                                                  type="button"
                                                                  cdkMenuItem
                                                                  [class]="itemClass(it)"
                                                                  [cdkMenuTriggerFor]="sub2"
                                                                  appMenuSubmenu
                                                                  [cdkMenuItemDisabled]="flag(it.disabled, data)"
                                                                >
                                                                  <ng-container *ngTemplateOutlet="body; context: { $implicit: it, lead: hasLead(segs), mode: 'submenu' }" />
                                                                </button>
                                                                <ng-template #sub2>
                                                                  <div cdkMenu [class]="'app-menu app-menu--' + size()" role="menu" [attr.aria-label]="it.label">
                                                                    <!-- nivel 3: la lista se declara DENTRO de su cdkMenu para que los items se registren (teclado/foco) y reciban su MENU_STACK -->
                                                                    <ng-template #list3 let-segs let-data="data">
                                                                          @for (seg of segs; track $index) {
                                                                            @if (seg.kind === 'radios') {
                                                                              <div cdkMenuGroup class="app-menu__group" role="group">
                                                                                @for (r of seg.items; track r.value) {
                                                                                  @if (!flag(r.hidden, data)) {
                                                                                    <button
                                                                                      type="button"
                                                                                      cdkMenuItemRadio
                                                                                      [class]="itemClass(r)"
                                                                                      [cdkMenuItemChecked]="isChecked(r)"
                                                                                      [cdkMenuItemDisabled]="flag(r.disabled, data)"
                                                                                      [appMenuKeepOpen]="!!r.keepOpen"
                                                                                      (cdkMenuItemTriggered)="activate(r, data)"
                                                                                    >
                                                                                      <ng-container *ngTemplateOutlet="body; context: { $implicit: r, lead: hasLead(segs), mode: 'radio' }" />
                                                                                    </button>
                                                                                  }
                                                                                }
                                                                              </div>
                                                                            } @else {
                                                                              @let it = $any(seg.item);
                                                                              @if (!flag(it.hidden, data)) {
                                                                                @switch (it.type) {
                                                                                  @case ('divider') {
                                                                                    <div class="app-menu__divider" role="separator"></div>
                                                                                  }
                                                                                  @case ('label') {
                                                                                    <div class="app-menu__label-group" role="presentation">{{ it.label }}</div>
                                                                                  }
                                                                                  @case ('checkbox') {
                                                                                    <button
                                                                                      type="button"
                                                                                      cdkMenuItemCheckbox
                                                                                      [class]="itemClass(it)"
                                                                                      [cdkMenuItemChecked]="isChecked(it)"
                                                                                      [cdkMenuItemDisabled]="flag(it.disabled, data)"
                                                                                      [appMenuKeepOpen]="!!it.keepOpen"
                                                                                      (cdkMenuItemTriggered)="activate(it, data)"
                                                                                    >
                                                                                      <ng-container *ngTemplateOutlet="body; context: { $implicit: it, lead: hasLead(segs), mode: 'checkbox' }" />
                                                                                    </button>
                                                                                  }
                                                                                  @default {
                                                                                    <button
                                                                                      type="button"
                                                                                      cdkMenuItem
                                                                                      [class]="itemClass(it)"
                                                                                      [cdkMenuItemDisabled]="flag(it.disabled, data)"
                                                                                      (cdkMenuItemTriggered)="activate(it, data)"
                                                                                    >
                                                                                      <ng-container *ngTemplateOutlet="body; context: { $implicit: it, lead: hasLead(segs), mode: 'item' }" />
                                                                                    </button>
                                                                                  }
                                                                                }
                                                                              }
                                                                            }
                                                                          }
                                                                        </ng-template>
                                                                    <ng-container *ngTemplateOutlet="list3; context: { $implicit: segments(it.children), data: data }" />
                                                                  </div>
                                                                </ng-template>
                                                              }
                                                              @default {
                                                                <button
                                                                  type="button"
                                                                  cdkMenuItem
                                                                  [class]="itemClass(it)"
                                                                  [cdkMenuItemDisabled]="flag(it.disabled, data)"
                                                                  (cdkMenuItemTriggered)="activate(it, data)"
                                                                >
                                                                  <ng-container *ngTemplateOutlet="body; context: { $implicit: it, lead: hasLead(segs), mode: 'item' }" />
                                                                </button>
                                                              }
                                                            }
                                                          }
                                                        }
                                                      }
                                                    </ng-template>
                                                <ng-container *ngTemplateOutlet="list2; context: { $implicit: segments(it.children), data: data }" />
                                              </div>
                                            </ng-template>
                                          }
                                          @default {
                                            <button
                                              type="button"
                                              cdkMenuItem
                                              [class]="itemClass(it)"
                                              [cdkMenuItemDisabled]="flag(it.disabled, data)"
                                              (cdkMenuItemTriggered)="activate(it, data)"
                                            >
                                              <ng-container *ngTemplateOutlet="body; context: { $implicit: it, lead: hasLead(segs), mode: 'item' }" />
                                            </button>
                                          }
                                        }
                                      }
                                    }
                                  }
                                </ng-template>
                            <ng-container *ngTemplateOutlet="list1; context: { $implicit: segments(it.children), data: data }" />
                          </div>
                        </ng-template>
                      }
                      @default {
                        <button
                          type="button"
                          cdkMenuItem
                          [class]="itemClass(it)"
                          [cdkMenuItemDisabled]="flag(it.disabled, data)"
                          (cdkMenuItemTriggered)="activate(it, data)"
                        >
                          <ng-container *ngTemplateOutlet="body; context: { $implicit: it, lead: hasLead(segs), mode: 'item' }" />
                        </button>
                      }
                    }
                  }
                }
              }
            </ng-template>
        <ng-container *ngTemplateOutlet="list0; context: { $implicit: segments(items()), data: data }" />
      </div>
    </ng-template>

    <!-- contenido de un item -->
    <ng-template #body let-it let-lead="lead" let-mode="mode">
      @if (lead) {
        <span class="app-menu__lead" aria-hidden="true">
          @if (mode === 'checkbox' || mode === 'radio') {
            @if (isChecked(it)) {
              <mat-icon>{{ mode === 'radio' ? 'radio_button_checked' : 'check' }}</mat-icon>
            } @else if (mode === 'radio') {
              <mat-icon class="app-menu__off">radio_button_unchecked</mat-icon>
            }
          } @else if (it.icon) {
            <mat-icon>{{ it.icon }}</mat-icon>
          }
        </span>
      }
      <span class="app-menu__text">
        <span class="app-menu__label">{{ it.label }}</span>
        @if (it.description) {
          <span class="app-menu__desc">{{ it.description }}</span>
        }
      </span>
      @if (it.badge !== undefined && it.badge !== null) {
        <span class="app-menu__badge">{{ it.badge }}</span>
      }
      @if (it.shortcut) {
        <kbd class="app-menu__shortcut">{{ it.shortcut }}</kbd>
      }
      @if (mode === 'submenu') {
        <mat-icon class="app-menu__chevron" aria-hidden="true">chevron_right</mat-icon>
      }
    </ng-template>
  `,
  styleUrl: './menu.component.scss',
})
export class AppMenuComponent {
  /** Plantilla del panel (la usan los triggers). */
  readonly template = viewChild.required<TemplateRef<unknown>>('panel');

  items = input<MenuItem[]>([]);
  size = input<MenuSize>('md');
  minWidth = input('12rem');
  maxWidth = input('22rem');
  ariaLabel = input<string | null>(null);

  /** Se emite al elegir cualquier acción, checkbox o radio. */
  itemSelect = output<MenuSelectEvent>();

  private checkState = signal(new Map<MenuCheckbox | MenuRadio, boolean>());
  private radioState = signal(new Map<string, unknown>());
  private segCache = new WeakMap<MenuItem[], MenuSegment[]>();

  segments(items: MenuItem[]): MenuSegment[] {
    let s = this.segCache.get(items);
    if (!s) this.segCache.set(items, (s = buildMenuSegments(items)));
    return s;
  }

  flag(f: MenuFlag | undefined, data: unknown): boolean {
    return typeof f === 'function' ? f(data) : !!f;
  }

  hasLead(segs: MenuSegment[]): boolean {
    return segs.some((s) =>
      s.kind === 'radios' ? true : !!(s.item as { icon?: string }).icon || s.item.type === 'checkbox'
    );
  }

  itemClass(it: { color?: string; type?: string }): string {
    return `app-menu__item app-menu__item--${it.color ?? 'default'}`;
  }

  isChecked(it: MenuCheckbox | MenuRadio): boolean {
    if (it.type === 'radio') {
      const sel = this.radioState();
      return sel.has(it.group) ? sel.get(it.group) === it.value : !!it.checked;
    }
    return this.checkState().get(it) ?? !!it.checked;
  }

  activate(it: MenuCheckbox | MenuRadio | MenuItem, data: unknown): void {
    if (it.type === 'divider' || it.type === 'label' || it.type === 'submenu') return;
    let checked: boolean | undefined;

    if (it.type === 'checkbox') {
      checked = !this.isChecked(it);
      this.checkState.update((m) => new Map(m).set(it, checked!));
    } else if (it.type === 'radio') {
      checked = true;
      this.radioState.update((m) => new Map(m).set(it.group, it.value));
    }

    it.command?.(data, it);
    this.itemSelect.emit({ item: it, data, checked });
  }
}
