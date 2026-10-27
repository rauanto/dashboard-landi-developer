import { Component, input, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatExpansionModule } from '@angular/material/expansion';
import { FormsModule } from '@angular/forms';
import { ApiColumnMetadata } from '../../models/api.models';
import { GridFilterService } from '../../services/grid-filter.service';
import { RangeFilter, TextFilter } from '../../models/filter.models';

@Component({
  selector: 'app-grid-filters',
  imports: [CommonModule, MatSelectModule, MatInputModule, MatFormFieldModule, MatExpansionModule, FormsModule],
  templateUrl: './grid-filters.html',
  styleUrl: './grid-filters.scss'
})
export class GridFiltersComponent {
  metadata = input.required<ApiColumnMetadata[]>();
  filterService = inject(GridFilterService);

  private emptyRangeFilter: RangeFilter = { type: 'range', min: null, max: null };
  private emptyTextFilter: TextFilter = { type: 'text', values: [] };

  safeUniqueValues = computed(() => {
    const map = new Map<string, string[]>();
    for (const col of this.metadata()) {
      if (!col.unique_values) {
        map.set(col.name, []);
      } else if (col.unique_values.length > 500) {
        map.set(col.name, col.unique_values.slice(0, 500));
      } else {
        map.set(col.name, col.unique_values);
      }
    }
    return map;
  });

  getRangeFilter(colName: string): RangeFilter {
    const f = this.filterService.filters().get(colName);
    if (f && f.type === 'range') return f;
    return this.emptyRangeFilter;
  }

  getTextFilter(colName: string): TextFilter {
    const f = this.filterService.filters().get(colName);
    if (f && f.type === 'text') return f;
    return this.emptyTextFilter;
  }

  updateRange(colName: string, prop: 'min' | 'max', value: string) {
    const filter = this.getRangeFilter(colName);
    
    let numVal: number | null = null;
    if (value) {
       const col = this.metadata().find(m => m.name === colName);
       if (col?.is_date) {
         // Asegurar que convierta 'yyyy-mm-dd' o la fecha a timestamp
         const parsedDate = new Date(value);
         // Al usar un input type="date", el valor llega como un string 'yyyy-mm-dd' y siempre usa medianoche UTC.
         // Ajustamos para obtener el timestamp real si es fecha.
         numVal = parsedDate.getTime() + parsedDate.getTimezoneOffset() * 60000;
       } else {
         numVal = Number(value);
       }
    }

    const updated = { ...filter, [prop]: numVal !== null && !isNaN(numVal) ? numVal : null };
    
    if (updated.min === null && updated.max === null) {
      this.filterService.setFilter(colName, null);
    } else {
      this.filterService.setFilter(colName, updated);
    }
  }

  updateText(colName: string, values: string[]) {
    if (!values || values.length === 0) {
      this.filterService.setFilter(colName, null);
    } else {
      this.filterService.setFilter(colName, { type: 'text', values });
    }
  }

  // Eliminamos getSafeUniqueValues porque ahora usamos el computed safeUniqueValues
}
