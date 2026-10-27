import { Injectable, signal, computed } from '@angular/core';
import { CellCoordinates, GridSelectionRange } from '../models/grid.models';

@Injectable()
export class GridSelectionService {
  readonly activeCell = signal<CellCoordinates | null>(null);
  readonly selectionRange = signal<GridSelectionRange | null>(null);
  readonly isDragging = signal<boolean>(false);
  readonly isRowSelectionMode = signal<boolean>(false);

  isSelected(rowIndex: number, colIndex: number): boolean {
    const range = this.selectionRange();
    if (range) {
      const minRow = Math.min(range.startRow, range.endRow);
      const maxRow = Math.max(range.startRow, range.endRow);
      const minCol = Math.min(range.startCol, range.endCol);
      const maxCol = Math.max(range.startCol, range.endCol);
      return rowIndex >= minRow && rowIndex <= maxRow && colIndex >= minCol && colIndex <= maxCol;
    }
    const active = this.activeCell();
    return active?.rowIndex === rowIndex && active?.colIndex === colIndex;
  }

  isActive(rowIndex: number, colIndex: number): boolean {
    const active = this.activeCell();
    return active?.rowIndex === rowIndex && active?.colIndex === colIndex;
  }

  startDrag(rowIndex: number, colIndex: number) {
    this.activeCell.set({ rowIndex, colIndex });
    this.selectionRange.set({
      startRow: rowIndex,
      startCol: colIndex,
      endRow: rowIndex,
      endCol: colIndex
    });
    this.isDragging.set(true);
  }

  updateDrag(rowIndex: number, colIndex: number, totalCols: number) {
    if (!this.isDragging()) return;
    
    this.selectionRange.update(range => {
      if (!range) return null;
      return {
        ...range,
        endRow: rowIndex,
        endCol: this.isRowSelectionMode() ? totalCols - 1 : colIndex
      };
    });
  }

  endDrag() {
    this.isDragging.set(false);
    this.isRowSelectionMode.set(false);
  }

  selectCell(rowIndex: number, colIndex: number, keepRange = false) {
    this.activeCell.set({ rowIndex, colIndex });
    if (!keepRange) {
      this.selectionRange.set(null);
    }
  }

  clearSelection() {
    this.activeCell.set(null);
    this.selectionRange.set(null);
    this.isDragging.set(false);
  }

  navigate(direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT', maxRow: number, maxCol: number, shiftKey = false) {
    const current = this.activeCell();
    if (!current) {
        // If no active cell, default to 0,0
        this.selectCell(0, 0);
        return;
    }

    let { rowIndex, colIndex } = current;

    // Use current selection end as navigation pivot if shifting
    const range = this.selectionRange();
    let pivotRow = shiftKey && range ? range.endRow : rowIndex;
    let pivotCol = shiftKey && range ? range.endCol : colIndex;

    if (direction === 'UP' && pivotRow > 0) pivotRow--;
    if (direction === 'DOWN' && pivotRow < maxRow) pivotRow++;
    if (direction === 'LEFT' && pivotCol > 0) pivotCol--;
    if (direction === 'RIGHT' && pivotCol < maxCol) pivotCol++;

    if (shiftKey) {
       const startRow = range ? range.startRow : rowIndex;
       const startCol = range ? range.startCol : colIndex;
       this.selectionRange.set({
         startRow,
         startCol,
         endRow: pivotRow,
         endCol: pivotCol
       });
    } else {
       this.selectCell(pivotRow, pivotCol);
    }
  }

  selectRow(rowIndex: number, totalCols: number) {
    this.startRowDrag(rowIndex, totalCols);
    this.endDrag();
  }

  startRowDrag(rowIndex: number, totalCols: number) {
    this.activeCell.set({ rowIndex, colIndex: 0 });
    this.selectionRange.set({
      startRow: rowIndex,
      startCol: 0,
      endRow: rowIndex,
      endCol: totalCols - 1
    });
    this.isRowSelectionMode.set(true);
    this.isDragging.set(true);
  }
}
