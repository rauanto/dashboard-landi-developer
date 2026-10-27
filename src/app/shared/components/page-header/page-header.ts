import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, BreadcrumbComponent],
  templateUrl: './page-header.html',
  styles: [
    `
      .page-header-wrapper {
        background-color: var(--mat-sys-primary);
        color: var(--mat-sys-on-primary);
        position: relative;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 330px;

        width: calc(100% + 64px);
        margin: -32px -32px 0 -32px;
        padding: 0 48px;
        box-sizing: border-box;
      }

      .page-header-content {
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 8px;
      }

      .page-title {
        font-size: 2rem;
        font-weight: 700;
        margin: 0;
        line-height: 1.2;
      }

      /* Using ::ng-deep to override breadcrumb color strictly in this primary context */
      ::ng-deep .page-header-wrapper app-breadcrumb .breadcrumb-container {
        color: var(--mat-sys-on-primary);
      }
    `,
  ],
})
export class PageHeader {
  title = input<string>('');
}
