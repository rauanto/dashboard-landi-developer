import { Component, ChangeDetectionStrategy, computed, contentChildren, input, output, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AppButtonComponent } from '../button/button.component';
import { AppStepComponent } from './step.component';

export type StepperColor = 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'info' | 'error';

/**
 * Wizard para formularios por pasos. Al avanzar valida el `control` del paso actual
 * (marca todos sus campos como touched y bloquea si es inválido).
 *
 * <app-stepper [linear]="true" submitLabel="Enviar solicitud" [loading]="guardando()" (finished)="enviar()">
 *   <app-step label="Datos personales" [control]="form.controls.personales"> ... </app-step>
 *   <app-step label="Domicilio" [control]="form.controls.domicilio"> ... </app-step>
 * </app-stepper>
 */
@Component({
  selector: 'app-stepper',
  imports: [NgTemplateOutlet, MatIconModule, AppButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'app-stepper', '[class]': 'hostClass()' },
  template: `
    <ol class="app-stepper__header">
      @for (s of steps(); track s; let i = $index; let last = $last) {
        <li class="app-stepper__item" [class.app-stepper__item--active]="i === index()" [class.app-stepper__item--done]="isDone(i)">
          <button
            type="button"
            class="app-stepper__head"
            [disabled]="!reachable(i)"
            [attr.aria-current]="i === index() ? 'step' : null"
            (click)="goTo(i)"
          >
            <span class="app-stepper__circle">
              @if (isDone(i)) {
                <mat-icon>check</mat-icon>
              } @else if (s.icon()) {
                <mat-icon>{{ s.icon() }}</mat-icon>
              } @else {
                {{ i + 1 }}
              }
            </span>
            <span class="app-stepper__text">
              <span class="app-stepper__label">{{ s.label() }}</span>
              @if (s.optional()) {
                <span class="app-stepper__optional">Opcional</span>
              }
            </span>
          </button>
          @if (!last) {
            <span class="app-stepper__line"></span>
          }
        </li>
      }
    </ol>

    <div class="app-stepper__body">
      @if (active(); as a) {
        <ng-container [ngTemplateOutlet]="a.template()" />
      }
    </div>

    <div class="app-stepper__actions">
      <button appButton variant="text" [color]="color()" type="button" [disabled]="index() === 0 || loading()" (click)="back()">
        {{ backLabel() }}
      </button>
      <span class="app-stepper__progress">Paso {{ index() + 1 }} de {{ steps().length }}</span>
      @if (isLast()) {
        <button appButton variant="filled" [color]="color()" type="button" [loading]="loading()" (click)="next()">
          {{ submitLabel() }}
        </button>
      } @else {
        <button appButton variant="filled" [color]="color()" type="button" (click)="next()">
          {{ nextLabel() }}
        </button>
      }
    </div>
  `,
  styleUrl: './stepper.component.scss',
})
export class AppStepperComponent {
  steps = contentChildren(AppStepComponent);

  color = input<StepperColor>('primary');
  /** Si es true, solo se puede avanzar paso a paso (validando). Si es false, se puede saltar libremente. */
  linear = input(true);
  nextLabel = input('Siguiente');
  backLabel = input('Atrás');
  submitLabel = input('Finalizar');
  loading = input(false);

  /** Se emite al terminar el último paso con su control válido. */
  finished = output<void>();
  stepChange = output<number>();

  index = signal(0);
  private doneSteps = signal<number[]>([]);

  active = computed(() => this.steps()[this.index()] ?? null);
  isLast = computed(() => this.index() === this.steps().length - 1);
  hostClass = computed(() => `app-stepper--${this.color()}`);

  isDone(i: number): boolean {
    return this.doneSteps().includes(i) && i !== this.index();
  }

  reachable(i: number): boolean {
    if (!this.linear()) return true;
    return i <= this.index() || this.doneSteps().includes(i - 1) || this.doneSteps().includes(i);
  }

  private validateCurrent(): boolean {
    const control = this.active()?.control();
    if (!control) return true;
    control.markAllAsTouched();
    control.updateValueAndValidity({ emitEvent: false });
    return control.valid || control.disabled;
  }

  next(): void {
    if (!this.validateCurrent()) return;
    this.doneSteps.update((d) => (d.includes(this.index()) ? d : [...d, this.index()]));
    if (this.isLast()) {
      this.finished.emit();
      return;
    }
    this.setIndex(this.index() + 1);
  }

  back(): void {
    if (this.index() > 0) this.setIndex(this.index() - 1);
  }

  goTo(i: number): void {
    if (i === this.index() || !this.reachable(i)) return;
    if (i > this.index() && this.linear() && !this.validateCurrent()) return;
    if (i > this.index()) this.doneSteps.update((d) => (d.includes(this.index()) ? d : [...d, this.index()]));
    this.setIndex(i);
  }

  reset(): void {
    this.doneSteps.set([]);
    this.setIndex(0);
  }

  private setIndex(i: number): void {
    this.index.set(i);
    this.stepChange.emit(i);
  }
}
