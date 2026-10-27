import { Component, input, effect, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-dynamic-table',
  imports: [CommonModule, MatTableModule, MatPaginatorModule],
  template: `
    @if (data().length > 0 && columns().length > 0) {
      <div class="table-container" style="border: 1px solid var(--mat-sys-outline-variant); border-radius: 8px; overflow: auto; height: calc(100vh - 240px);">
        <table mat-table [dataSource]="dataSource" class="compact-table">
          @for (column of columns(); track column) {
            <ng-container [matColumnDef]="column">
              <th mat-header-cell *matHeaderCellDef style="color: var(--mat-sys-on-surface); background-color: var(--mat-sys-primary-container); font-weight: 600;"> 
                {{ column }} 
              </th>
              <td mat-cell *matCellDef="let element" style="color: var(--mat-sys-on-surface-variant);" [title]="element[column]"> 
                {{ element[column] }} 
              </td>
            </ng-container>
          }

          <tr mat-header-row *matHeaderRowDef="columns(); sticky: true" style="background-color: var(--mat-sys-surface-container-low);"></tr>
          <tr mat-row *matRowDef="let row; columns: columns();" class="minimal-row"></tr>
        </table>
        
        <mat-paginator 
          [pageSizeOptions]="[50, 100, 225, 300]" 
          aria-label="Select page of data"
          style="background-color: transparent; border-top: 1px solid var(--mat-sys-outline-variant);">
        </mat-paginator>
      </div>
    } @else {
      <div class="empty-state" style="background-color: var(--mat-sys-surface-container-lowest); color: var(--mat-sys-on-surface-variant); border: 1px dashed var(--mat-sys-outline-variant);">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mb-4 opacity-50"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/></svg>
        <p style="font-size: 1.125rem; font-weight: 500;">No hay datos para mostrar</p>
        <p style="font-size: 0.875rem;">Carga un archivo Excel o CSV para visualizar su contenido</p>
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }
    .table-container {
      width: 100%;
      background-color: var(--mat-sys-surface);
    }
    .compact-table {
      width: 100%;
      background-color: var(--mat-sys-surface);
    }
    /* Hacer la tabla más compacta y celdas truncadas */
    :host ::ng-deep .compact-table .mat-mdc-header-row {
      height: 40px !important;
    }
    :host ::ng-deep .compact-table .mat-mdc-row {
      height: 36px !important;
    }
    :host ::ng-deep .compact-table .mat-mdc-cell,
    :host ::ng-deep .compact-table .mat-mdc-header-cell {
      padding: 0 16px;
      font-size: 13px;
      border-bottom: 1px solid var(--mat-sys-surface-container-highest);
      
      /* Tamaños fijos para el scroll horizontal cómodo */
      min-width: 180px;
      max-width: 250px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    /* Efecto hover minimalista */
    .minimal-row:hover {
      background-color: var(--mat-sys-surface-container-highest);
      transition: background-color 0.2s ease;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      border-radius: 40px;
    }
  `
})
export class DynamicTable {
  columns = input.required<string[]>();
  data = input.required<any[]>();

  dataSource = new MatTableDataSource<any>([]);
  paginator = viewChild(MatPaginator);

  constructor() {
    effect(() => {
      this.dataSource.data = this.data();
      const pag = this.paginator();
      if (pag) {
        this.dataSource.paginator = pag;
      }
    });
  }
}
