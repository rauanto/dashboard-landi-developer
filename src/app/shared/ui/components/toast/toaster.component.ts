import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ToastService } from './toast.service';
import { ToastItem } from './toast.types';

const LONG_TEXT = 140;
const SWIPE_DISMISS_PX = 90;

/**
 * Contenedor de toasts. NO lo uses en tus templates: ToastService lo monta solo en <body>.
 */
@Component({
  selector: 'app-toaster',
  imports: [MatIconModule, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[style.--toast-z]': 'svc.config().zIndex' },
  template: `
    @for (g of svc.groups(); track g.position) {
      <section
        class="toaster"
        [class]="'toaster toaster--' + g.position"
        [class.toaster--expanded]="g.expanded"
        role="region"
        aria-label="Notificaciones"
      >
        @if (!g.isTop) {
          @if (g.hidden > 0 || (g.expanded && g.total > svc.config().maxVisible)) {
            <ng-container *ngTemplateOutlet="summary; context: { $implicit: g }" />
          }
        }

        @for (t of g.items; track t.id) {
          <div
            class="toast"
            [class]="'toast toast--' + t.type"
            [class.toast--leaving]="t.status === 'leaving'"
            [class.toast--top]="g.isTop"
            [attr.role]="t.type === 'error' || t.type === 'warning' ? 'alert' : 'status'"
            [attr.aria-live]="t.type === 'error' || t.type === 'warning' ? 'assertive' : 'polite'"
            [attr.aria-busy]="t.type === 'loading' ? true : null"
            (mouseenter)="t.pauseOnHover && svc.pause(t.id)"
            (mouseleave)="svc.resume(t.id)"
            (focusin)="t.pauseOnHover && svc.pause(t.id)"
            (focusout)="svc.resume(t.id)"
            (pointerdown)="dragStart($event, t)"
            (pointermove)="dragMove($event)"
            (pointerup)="dragEnd($event, t)"
            (pointercancel)="dragEnd($event, t)"
          >
            <div class="toast__lead" aria-hidden="true">
              @if (t.type === 'loading') {
                <span class="toast__spinner"></span>
              } @else if (t.icon) {
                <mat-icon>{{ t.icon }}</mat-icon>
              }
            </div>

            <div class="toast__content">
              <div class="toast__title" [class.toast__title--clamped]="isClamped(t, 'title')">
                {{ t.message }}
                @if (t.count > 1) {
                  <span class="toast__count" [attr.aria-label]="t.count + ' veces'">×{{ t.count }}</span>
                }
              </div>

              @if (t.description) {
                <div class="toast__desc" [class.toast__desc--clamped]="isClamped(t, 'desc')">{{ t.description }}</div>
              }

              @if (isLong(t)) {
                <button type="button" class="toast__more" (click)="toggleMore(t.id)">
                  {{ expandedText().has(t.id) ? 'Ver menos' : 'Ver más' }}
                </button>
              }

              @if (t.action; as a) {
                <button type="button" class="toast__action" (click)="svc.runAction(t.id)">{{ a.label }}</button>
              }
            </div>

            @if (t.dismissible) {
              <button type="button" class="toast__close" aria-label="Cerrar notificación" (click)="svc.dismiss(t.id, 'manual')">
                <mat-icon>close</mat-icon>
              </button>
            }

            @if (t.progress) {
              <div class="toast__progress" aria-hidden="true">
                @for (run of [t.runId]; track run) {
                  <span [style.animation-duration.ms]="t.duration" [style.animation-play-state]="t.paused ? 'paused' : 'running'"></span>
                }
              </div>
            }
          </div>
        }

        @if (g.isTop) {
          @if (g.hidden > 0 || (g.expanded && g.total > svc.config().maxVisible)) {
            <ng-container *ngTemplateOutlet="summary; context: { $implicit: g }" />
          }
        }
      </section>
    }

    <ng-template #summary let-g>
      <div class="toaster__summary">
        <span class="toaster__summary-text">
          @if (g.expanded) { {{ g.total }} notificaciones } @else { +{{ g.hidden }} más }
        </span>
        <button type="button" (click)="svc.toggleExpanded(g.position)">{{ g.expanded ? 'Colapsar' : 'Ver todas' }}</button>
        <button type="button" (click)="svc.dismissAll(g.position)">Cerrar todas</button>
      </div>
    </ng-template>
  `,
  styleUrl: './toaster.component.scss',
})
export class AppToasterComponent {
  svc = inject(ToastService);

  expandedText = signal<Set<string>>(new Set());

  isLong(t: ToastItem): boolean {
    return (t.description ?? t.message).length > LONG_TEXT;
  }

  isClamped(t: ToastItem, part: 'title' | 'desc'): boolean {
    if (!this.isLong(t) || this.expandedText().has(t.id)) return false;
    return part === 'desc' ? !!t.description : !t.description;
  }

  toggleMore(id: string): void {
    this.expandedText.update((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  // ---------- deslizar para descartar ----------
  private drag: { id: string; x: number; dx: number; active: boolean } | null = null;

  dragStart(e: PointerEvent, t: ToastItem): void {
    if (!t.dismissible || (e.target as HTMLElement).closest('button')) return;
    this.drag = { id: t.id, x: e.clientX, dx: 0, active: false };
  }

  dragMove(e: PointerEvent): void {
    if (!this.drag) return;
    const el = e.currentTarget as HTMLElement;
    this.drag.dx = e.clientX - this.drag.x;
    if (!this.drag.active && Math.abs(this.drag.dx) > 6) {
      this.drag.active = true;
      el.setPointerCapture(e.pointerId);
      el.style.transition = 'none';
    }
    if (this.drag.active) {
      el.style.transform = `translateX(${this.drag.dx}px)`;
      el.style.opacity = String(Math.max(0.3, 1 - Math.abs(this.drag.dx) / 260));
    }
  }

  dragEnd(e: PointerEvent, t: ToastItem): void {
    const d = this.drag;
    this.drag = null;
    if (!d?.active) return;
    const el = e.currentTarget as HTMLElement;
    el.style.transition = '';
    if (Math.abs(d.dx) > SWIPE_DISMISS_PX) {
      el.style.transform = `translateX(${d.dx > 0 ? 120 : -120}%)`;
      el.style.opacity = '0';
      this.svc.dismiss(t.id, 'swipe');
    } else {
      el.style.transform = '';
      el.style.opacity = '';
    }
  }
}
