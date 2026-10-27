import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <ng-container *ngIf="data.messageList && data.messageList.length > 0; else simpleMessage">
        <ul class="observation-list">
          <ng-container *ngFor="let item of data.messageList">
            <li *ngIf="!isSection(item)" class="observation-item">
              {{ item }}
            </li>
            <li *ngIf="isSection(item)" class="observation-section">
              {{ cleanSection(item) }}
            </li>
          </ng-container>
        </ul>
      </ng-container>
      <ng-template #simpleMessage>
        <p>{{ data.message }}</p>
      </ng-template>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onNoClick()" *ngIf="data.cancelText !== ''">{{ data.cancelText || 'Cancelar' }}</button>
      <button mat-flat-button [color]="data.color || 'warn'" [mat-dialog-close]="true" cdkFocusInitial>
        {{ data.confirmText || 'Sí, salir' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .observation-list {
      margin: 0;
      padding-left: 0;
      list-style-type: none;
    }
    .observation-item {
      margin-bottom: 8px;
      padding-left: 20px;
      line-height: 1.5;
      position: relative;
      color: var(--mat-sys-on-surface, inherit);
    }
    .observation-item::before {
      content: '•';
      position: absolute;
      left: 6px;
      color: var(--mat-sys-primary, #1976d2);
    }
    .observation-item:last-child {
      margin-bottom: 0;
    }
    .observation-section {
      font-weight: 600;
      margin-top: 12px;
      margin-bottom: 8px;
      color: var(--mat-sys-on-surface, inherit);
      list-style: none;
      padding-left: 0;
      border-bottom: 1px solid var(--mat-sys-outline-variant, #e0e0e0);
      padding-bottom: 4px;
    }
    .observation-section:first-child {
      margin-top: 0;
    }
  `]
})
export class ConfirmationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      title: string;
      message: string;
      messageList?: string[];
      confirmText?: string;
      cancelText?: string;
      color?: string;
    }
  ) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

  isSection(item: string): boolean {
    return item.startsWith('**') && item.endsWith('**');
  }

  cleanSection(item: string): string {
    return item.replace(/^\*\*/, '').replace(/\*\*$/, '');
  }
}
