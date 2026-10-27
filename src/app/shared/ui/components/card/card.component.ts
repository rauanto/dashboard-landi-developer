import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';

export type CardVariant = 'elevated' | 'filled' | 'outlined';
export type CardColor =
  | 'surface'
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'success'
  | 'warning'
  | 'info'
  | 'error';

@Component({
  selector: 'app-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-card',
    '[class]': 'hostClasses()',
  },
  template: `
    <div class="app-card__container">
      <ng-content />
    </div>
  `,
  styleUrl: './card.component.scss',
})
export class AppCardComponent {
  variant = input<CardVariant>('outlined');
  color = input<CardColor>('surface');

  hostClasses = computed(() =>
    [
      `app-card--${this.variant()}`,
      `app-card--${this.color()}`,
    ]
      .filter(Boolean)
      .join(' ')
  );
}
