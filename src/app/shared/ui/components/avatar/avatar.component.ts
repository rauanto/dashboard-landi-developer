import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';
export type AvatarColor = 'primary' | 'secondary' | 'tertiary' | 'neutral';

/**
 * Avatar circular con iniciales derivadas de un nombre/correo, o una imagen
 * si se provee. Pensado para chips de usuario, listas y paneles de cuenta.
 *
 * Uso:
 *   <app-avatar label="Raul Antonio" />
 *   <app-avatar label="usuario@ejemplo.com" size="xl" color="tertiary" />
 *   <app-avatar label="Ana Ruiz" imageUrl="https://..." />
 */
@Component({
  selector: 'app-avatar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-avatar',
    '[class]': 'hostClasses()',
  },
  template: `
    @if (imageUrl()) {
      <img class="app-avatar__img" [src]="imageUrl()" [alt]="label()" />
    } @else {
      <span class="app-avatar__initials">{{ initials() }}</span>
    }
  `,
  styleUrl: './avatar.component.scss',
})
export class AppAvatarComponent {
  label = input('');
  imageUrl = input<string | null>(null);
  size = input<AvatarSize>('md');
  color = input<AvatarColor>('primary');

  initials = computed(() => {
    const parts = this.label().trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  });

  hostClasses = computed(() => [`app-avatar--${this.size()}`, `app-avatar--${this.color()}`].join(' '));
}
