import { Component, ChangeDetectionStrategy, TemplateRef, input, viewChild } from '@angular/core';
import { AbstractControl } from '@angular/forms';

/**
 * Paso de <app-stepper>. `control` (FormGroup/FormControl) se valida antes de avanzar.
 */
@Component({
  selector: 'app-step',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-template><ng-content /></ng-template>`,
})
export class AppStepComponent {
  readonly template = viewChild.required(TemplateRef);

  label = input.required<string>();
  icon = input<string | null>(null);
  optional = input(false);
  /** Control a validar antes de pasar al siguiente paso. */
  control = input<AbstractControl | null>(null);
}
