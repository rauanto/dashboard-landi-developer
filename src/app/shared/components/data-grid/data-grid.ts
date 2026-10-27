import { Component, input, computed, inject, NgZone, OnDestroy, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { GridSelectionService } from '../../services/grid-selection.service';
import { GridHeatmapService } from '../../services/grid-heatmap.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CdkDragDrop, moveItemInArray, CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';



/**
 * @description Este componente es una tabla de datos con funcionalidades avanzadas como:
 * - Selección de celdas
 * - Selección de filas
 * - Arrastrar para seleccionar
 * - Teclas de navegación
 * - Menú de columnas
 * - Ordenamiento
 * - Heatmaps
 * 
 * @example
 * <app-data-grid
 *   [columns]="columns()"
 *   [data]="data()"
 *   (selectionChange)="onSelectionChange($event)"
 * ></app-data-grid>
 * 
 */
@Component({
  selector: 'app-data-grid',
  imports: [CommonModule, ScrollingModule, MatMenuModule, MatButtonModule, MatIconModule, MatCheckboxModule, CdkDropList, CdkDrag],
  providers: [GridSelectionService],
  templateUrl: './data-grid.html',
  styleUrls: ['./data-grid.scss']
})
export class DataGridComponent {
  
  columns = input.required<string[]>();
  data = input.required<any[]>();
  
  selectionService = inject(GridSelectionService);
  heatmapService = inject(GridHeatmapService);
  private ngZone = inject(NgZone);

  hiddenColumns = signal<Set<string>>(new Set());
  sortColumn = signal<string | null>(null);
  sortDirection = signal<'asc' | 'desc'>('asc');

  orderedColumns = signal<string[]>([]);

  constructor() {
    effect(() => {
      const inputCols = this.columns();
      const current = this.orderedColumns();
      if (current.length === 0 || current.length !== inputCols.length) {
         this.orderedColumns.set([...inputCols]);
      }
    }, { allowSignalWrites: true });
  }

  displayedColumns = computed(() => {
    const hidden = this.hiddenColumns();
    return this.orderedColumns().filter(col => !hidden.has(col));
  });

  onColumnDrop(event: CdkDragDrop<string[]>) {
    const cols = [...this.orderedColumns()];
    const displayed = this.displayedColumns();
    const prevCol = displayed[event.previousIndex];
    const currCol = displayed[event.currentIndex];
    
    const prevIndexInOrdered = cols.indexOf(prevCol);
    const currIndexInOrdered = cols.indexOf(currCol);
    
    moveItemInArray(cols, prevIndexInOrdered, currIndexInOrdered);
    this.orderedColumns.set(cols);
  }

  sortedData = computed(() => {
    const col = this.sortColumn();
    const dir = this.sortDirection();
    const dataCopy = [...this.data()];
    
    if (!col) return dataCopy;

    return dataCopy.sort((a, b) => {
      const valA = a[col];
      const valB = b[col];
      
      // Basic sorting logic handling numbers and strings
      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return dir === 'asc' ? -1 : 1;
      if (valB === null || valB === undefined) return dir === 'asc' ? 1 : -1;

      const numA = Number(valA);
      const numB = Number(valB);

      if (!isNaN(numA) && !isNaN(numB)) {
        return dir === 'asc' ? numA - numB : numB - numA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      
      if (strA < strB) return dir === 'asc' ? -1 : 1;
      if (strA > strB) return dir === 'asc' ? 1 : -1;
      return 0;
    });
  });

  private boundMouseMove = this.onWindowMouseMove.bind(this);
  private boundMouseUp = this.onMouseUp.bind(this);

  ngOnInit() {
    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('mousemove', this.boundMouseMove);
      window.addEventListener('mouseup', this.boundMouseUp);
    });
  }

  ngOnDestroy() {
    window.removeEventListener('mousemove', this.boundMouseMove);
    window.removeEventListener('mouseup', this.boundMouseUp);
  }

  gridColumns = computed(() => {
    return `60px repeat(${this.displayedColumns().length}, 180px)`;
  });

  isColumnVisible(col: string): boolean {
    return !this.hiddenColumns().has(col);
  }

  toggleColumn(col: string) {
    const hidden = new Set(this.hiddenColumns());
    if (hidden.has(col)) {
      hidden.delete(col);
    } else {
      hidden.add(col);
    }
    this.hiddenColumns.set(hidden);
  }

  sortBy(col: string) {
    if (this.sortColumn() === col) {
      if (this.sortDirection() === 'asc') {
        this.sortDirection.set('desc');
      } else {
        this.sortColumn.set(null);
        this.sortDirection.set('asc');
      }
    } else {
      this.sortColumn.set(col);
      this.sortDirection.set('asc');
    }
  }

  onMouseDown(rowIndex: number, colIndex: number, event: MouseEvent) {
    if (event.shiftKey) {
      this.selectionService.isDragging.set(true);
      this.selectionService.updateDrag(rowIndex, colIndex, this.displayedColumns().length);
      this.selectionService.isDragging.set(false);
    } else {
      this.selectionService.startDrag(rowIndex, colIndex);
    }
    event.preventDefault();
  }

  onMouseEnter(rowIndex: number, colIndex: number) {
    this.selectionService.updateDrag(rowIndex, colIndex, this.displayedColumns().length);
  }

  onMouseUp() {
    this.selectionService.endDrag();
    if (this.dragScrollAnimationFrame) {
      cancelAnimationFrame(this.dragScrollAnimationFrame);
      this.dragScrollAnimationFrame = null;
    }
  }

  startRowDrag(rowIndex: number, event: MouseEvent) {
    if (event.shiftKey) {
      this.selectionService.isRowSelectionMode.set(true);
      this.selectionService.isDragging.set(true);
      this.selectionService.updateDrag(rowIndex, 0, this.displayedColumns().length);
      this.selectionService.isDragging.set(false);
      this.selectionService.isRowSelectionMode.set(false);
    } else {
      this.selectionService.startRowDrag(rowIndex, this.displayedColumns().length);
    }
    event.preventDefault();
  }

  onRowMouseEnter(rowIndex: number) {
    if (this.selectionService.isRowSelectionMode()) {
       this.selectionService.updateDrag(rowIndex, 0, this.displayedColumns().length);
    }
  }

  private dragScrollAnimationFrame: number | null = null;
  private currentMouseX = 0;
  private currentMouseY = 0;
  private scrollContainer: HTMLElement | null = null;
  private viewportContainer: HTMLElement | null = null;

  onWindowMouseMove(event: MouseEvent) {
    if (this.selectionService.isDragging()) {
      this.currentMouseX = event.clientX;
      this.currentMouseY = event.clientY;
      if (!this.dragScrollAnimationFrame) {
        this.dragScrollAnimationFrame = requestAnimationFrame(() => this.autoScroll());
      }
    }
  }

  autoScroll() {
    if (!this.selectionService.isDragging()) {
      this.dragScrollAnimationFrame = null;
      return;
    }

    if (!this.scrollContainer) {
      this.scrollContainer = document.querySelector('.grid-container') as HTMLElement;
      this.viewportContainer = document.querySelector('.viewport') as HTMLElement;
    }

    if (this.scrollContainer && this.viewportContainer) {
      const rect = this.scrollContainer.getBoundingClientRect();
      const edgeSize = 50; 
      let dx = 0;
      let dy = 0;

      if (this.currentMouseX < rect.left + edgeSize) dx = -20;
      else if (this.currentMouseX > rect.right - edgeSize) dx = 20;

      if (this.currentMouseY < rect.top + edgeSize) dy = -20;
      else if (this.currentMouseY > rect.bottom - edgeSize) dy = 20;

      if (dx !== 0) this.scrollContainer.scrollBy(dx, 0);
      if (dy !== 0) this.viewportContainer.scrollBy(0, dy);
    }

    this.dragScrollAnimationFrame = requestAnimationFrame(() => this.autoScroll());
  }

  onKeyDown(event: KeyboardEvent) {
    const maxRow = this.data().length - 1;
    const maxCol = this.displayedColumns().length - 1;
    
    switch (event.key) {
      case 'ArrowUp':
        this.selectionService.navigate('UP', maxRow, maxCol, event.shiftKey);
        event.preventDefault();
        break;
      case 'ArrowDown':
        this.selectionService.navigate('DOWN', maxRow, maxCol, event.shiftKey);
        event.preventDefault();
        break;
      case 'ArrowLeft':
        this.selectionService.navigate('LEFT', maxRow, maxCol, event.shiftKey);
        event.preventDefault();
        break;
      case 'ArrowRight':
        this.selectionService.navigate('RIGHT', maxRow, maxCol, event.shiftKey);
        event.preventDefault();
        break;
      case 'Escape':
        this.selectionService.clearSelection();
        break;
    }
  }

  onCopy(event: ClipboardEvent) {
    const range = this.selectionService.selectionRange();
    const active = this.selectionService.activeCell();
    
    let minRow, maxRow, minCol, maxCol;
    
    if (range) {
      minRow = Math.min(range.startRow, range.endRow);
      maxRow = Math.max(range.startRow, range.endRow);
      minCol = Math.min(range.startCol, range.endCol);
      maxCol = Math.max(range.startCol, range.endCol);
    } else if (active) {
      minRow = active.rowIndex;
      maxRow = active.rowIndex;
      minCol = active.colIndex;
      maxCol = active.colIndex;
    } else {
      return;
    }

    const cols = this.displayedColumns();
    const currentData = this.sortedData();
    let textToCopy = '';

    for (let r = minRow; r <= maxRow; r++) {
      const row = currentData[r];
      const rowData = [];
      for (let c = minCol; c <= maxCol; c++) {
        rowData.push(row[cols[c]]);
      }
      textToCopy += rowData.join('\t') + '\n';
    }

    if (event.clipboardData) {
      event.clipboardData.setData('text/plain', textToCopy);
      event.preventDefault(); // Prevents the browser from copying the HTML DOM
    }
  }
}
