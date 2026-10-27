import {
  Component, ChangeDetectionStrategy, TemplateRef, computed, contentChild, effect, input, signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { AbstractControl, FormArray } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AppButtonComponent } from '../button/button.component';

export interface RepeaterContext {
  $implicit: AbstractControl;
  index: number;
}

/**
 * Repetidor para FormArray (referencias, avales, beneficiarios...).
 * El primer <ng-template> hijo se usa como plantilla de cada fila.
 *
 * <app-repeater [array]="form.controls.referencias" [factory]="nuevaReferencia"
 *               label="Referencias" itemLabel="Referencia" addLabel="Agregar referencia" [min]="1" [max]="3">
 *   <ng-template let-group let-i="index">
 *     <app-input [formControl]="group.controls.nombre" label="Nombre" />
 *   </ng-template>
 * </app-repeater>
 */
@Component({
  selector: 'app-repeater',
  imports: [NgTemplateOutlet, MatIconModule, AppButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'app-repeater' },
  template: `
    @if (label(); as l) {
      <div class="app-repeater__title">{{ l }}</div>
    }

    @for (ctrl of controls(); track ctrl; let i = $index) {
      <div class="app-repeater__row">
        <div class="app-repeater__row-header">
          <span class="app-repeater__row-title">{{ itemLabel() }} {{ i + 1 }}</span>
          <button
            type="button"
            class="app-repeater__remove"
            [attr.aria-label]="'Quitar ' + itemLabel() + ' ' + (i + 1)"
            [disabled]="!canRemove()"
            (click)="remove(i)"
          >
            <mat-icon>delete_outline</mat-icon>
          </button>
        </div>
        <div class="app-repeater__row-body">
          @if (template(); as tpl) {
            <ng-container [ngTemplateOutlet]="tpl" [ngTemplateOutletContext]="ctx(ctrl, i)" />
          }
        </div>
      </div>
    } @empty {
      <div class="app-repeater__empty">{{ emptyText() }}</div>
    }

    @if (arrayError(); as err) {
      <span class="app-repeater__error" role="alert">{{ err }}</span>
    }

    <div class="app-repeater__footer">
      <button appButton variant="tonal" size="sm" icon="add" type="button" [disabled]="!canAdd()" (click)="add()">
        {{ addLabel() }}
      </button>
      @if (max(); as m) {
        <span class="app-repeater__counter">{{ controls().length }}/{{ m }}</span>
      }
    </div>
  `,
  styles: `
    :host { display: flex; flex-direction: column; gap: 0.75rem; font-family: inherit; }
    .app-repeater__title { font-size: 0.9375rem; font-weight: 600; color: var(--mat-sys-on-surface); }
    .app-repeater__row {
      border: 1.5px solid var(--mat-sys-outline-variant); border-radius: 1.25rem;
      padding: 0.75rem 1rem 1rem; display: flex; flex-direction: column; gap: 0.75rem;
    }
    .app-repeater__row-header { display: flex; align-items: center; justify-content: space-between; }
    .app-repeater__row-title { font-size: 0.8125rem; font-weight: 500; color: var(--mat-sys-on-surface-variant); }
    .app-repeater__row-body { display: flex; flex-direction: column; gap: 0.5rem; }
    .app-repeater__remove {
      display: inline-flex; border: none; background: transparent; cursor: pointer; padding: 0.25rem;
      border-radius: 50%; color: var(--app-error);
      &:hover:not(:disabled) { background: color-mix(in srgb, var(--app-error) 12%, transparent); }
      &:disabled { opacity: 0.35; cursor: not-allowed; }
    }
    .app-repeater__empty {
      padding: 1rem; text-align: center; font-size: 0.875rem; color: var(--mat-sys-on-surface-variant);
      border: 1.5px dashed var(--mat-sys-outline-variant); border-radius: 1.25rem;
    }
    .app-repeater__error { font-size: 0.75rem; color: var(--app-error); padding: 0 1rem; }
    .app-repeater__footer { display: flex; align-items: center; gap: 0.75rem; }
    .app-repeater__counter { font-size: 0.75rem; color: var(--mat-sys-on-surface-variant); }
  `,
})
export class AppRepeaterComponent {
  template = contentChild(TemplateRef);

  array = input.required<FormArray>();
  /** Crea el control (normalmente un FormGroup) de una fila nueva. */
  factory = input.required<() => AbstractControl>();
  label = input<string | null>(null);
  itemLabel = input('Elemento');
  addLabel = input('Agregar');
  emptyText = input('Aún no hay elementos');
  min = input(0);
  max = input<number | null>(null);
  /** Mensajes por clave de error del FormArray (p. ej. minlength). */
  errorMessages = input<Record<string, string>>({});

  controls = signal<AbstractControl[]>([]);
  private tick = signal(0);

  canAdd = computed(() => this.max() === null || this.controls().length < this.max()!);
  canRemove = computed(() => this.controls().length > this.min());

  arrayError = computed(() => {
    this.tick();
    const arr = this.array();
    if (!arr.errors || !(arr.touched || arr.dirty)) return null;
    const [key, val] = Object.entries(arr.errors)[0];
    return this.errorMessages()[key] ?? (typeof val?.message === 'string' ? val.message : 'Revisa esta sección');
  });

  constructor() {
    effect((onCleanup) => {
      const arr = this.array();
      this.controls.set([...arr.controls]);
      const sub = arr.events.subscribe(() => {
        this.controls.set([...arr.controls]);
        this.tick.update((v) => v + 1);
      });
      onCleanup(() => sub.unsubscribe());
    });
  }

  ctx(control: AbstractControl, index: number): RepeaterContext {
    return { $implicit: control, index };
  }

  add(): void {
    if (!this.canAdd()) return;
    this.array().push(this.factory()());
    this.array().markAsDirty();
  }

  remove(index: number): void {
    if (!this.canRemove()) return;
    this.array().removeAt(index);
    this.array().markAsDirty();
  }
}
