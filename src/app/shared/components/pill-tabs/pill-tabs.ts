import { Component, input, model, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface TabItem {
  id: string;
  label: string;
  icon?: string;
}

@Component({
  selector: 'app-pill-tabs',
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div
      class="inline-flex items-center gap-1 rounded-full w-full h-auto "
      [class]="alignmentClass()"
      style="background-color: var(--mat-sys-surface);"
    >
      @for (tab of tabs(); track tab.id) {
        @if (activeTabId() === tab.id) {
          <button mat-flat-button extended class="btn-tabs" (click)="activeTabId.set(tab.id)">
            <div class="flex items-center gap-2">
              @if (tab.icon) {
                <mat-icon style="">{{
                  tab.icon
                }}</mat-icon>
              }
              {{ tab.label }}
            </div>
          </button>
        } @else {
          <button mat-button extended class="btn-tabs" (click)="activeTabId.set(tab.id)">
            <div class="flex items-center gap-2">
              @if (tab.icon) {
                <mat-icon style="">{{
                  tab.icon
                }}</mat-icon>
              }
              {{ tab.label }}
            </div>
          </button>
        }
      }
    </div>
  `,
  styles: `
  .btn-tabs{
    height: 48px; border-radius: 9999px; padding: 0 24px; font-size: 1.05rem;
  }
  `,
})
export class PillTabs {
  tabs = input.required<TabItem[]>();
  activeTabId = model.required<string>();
  align = input<'start' | 'center' | 'end'>('center');

  alignmentClass = computed(() => {
    switch (this.align()) {
      case 'start': return 'justify-start';
      case 'end': return 'justify-end';
      default: return 'justify-center';
    }
  });
}
