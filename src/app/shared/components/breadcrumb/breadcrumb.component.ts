import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BreadcrumbService } from '../../services/breadcrumb.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

// Breadcrumb Navigation Component
@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule],
  template: `
    <nav class="breadcrumb-container" aria-label="Breadcrumb">
      <div class="breadcrumb-list">
        <!-- Home Icon/Link -->
        <a routerLink="/" class="breadcrumb-item home-icon">
          <mat-icon>home</mat-icon>
        </a>

        @for (crumb of breadcrumbService.breadcrumbs(); track crumb.url; let last = $last) {
          <mat-icon class="separator">chevron_right</mat-icon>
          
          @if (!last) {
            <a [routerLink]="crumb.url" class="breadcrumb-item">{{ crumb.label }}</a>
          } @else {
            <span class="breadcrumb-item active">{{ crumb.label }}</span>
          }
        }
      </div>
    </nav>
  `,
  styles: [`
    .breadcrumb-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 0.9em;
      color: inherit; /* Inherit from parent (toolbar) */
    }
    
    .breadcrumb-list {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
    }

    .breadcrumb-item {
      text-decoration: none;
      color: inherit; /* Inherit form container/parent */
      opacity: 0.8;
      display: flex;
      align-items: center;
      transition: opacity 0.2s;
    }

    /* Important state: Hovering a link (non-active) */
    .breadcrumb-item:hover:not(.active) {
      opacity: 1;
      text-decoration: underline;
    }

    /* Important state: The current active page (last item) */
    .breadcrumb-item.active {
      color: inherit;
      opacity: 1;
      font-weight: 700;
      cursor: default;
    }

    .separator {
      margin: 0 4px;
      font-size: 18px;
      width: 18px;
      height: 18px;
      opacity: 0.6;
    }

    .home-icon mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
  `]
})
export class BreadcrumbComponent {
  breadcrumbService = inject(BreadcrumbService);

  goBack() {
    this.breadcrumbService.navigateBack();
  }
}
