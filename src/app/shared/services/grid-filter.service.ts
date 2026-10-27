import { Injectable, signal, computed } from '@angular/core';
import { GridFilter } from '../models/filter.models';
import { ApiColumnMetadata } from '../models/api.models';

@Injectable({
  providedIn: 'root' // or at the component level
})
export class GridFilterService {
  // Map of column name to its active filter
  readonly filters = signal<Map<string, GridFilter>>(new Map());

  setFilter(colName: string, filter: GridFilter | null) {
    const newFilters = new Map(this.filters());
    if (filter) {
      newFilters.set(colName, filter);
    } else {
      newFilters.delete(colName);
    }
    this.filters.set(newFilters);
  }

  clearFilters() {
    this.filters.set(new Map());
  }

  applyFilters(data: any[], metadata: ApiColumnMetadata[]): any[] {
    const activeFilters = this.filters();
    
    // Si no hay filtros, regresar todo
    if (activeFilters.size === 0) return data;

    // PRE-PROCESAR los metadatos para evitar buscar (O(N)) por CADA FILA de los datos.
    // Esto previene que la aplicación se congele con 100,000 filas.
    const filterConfigs: Array<{ colName: string; filter: GridFilter; isDate: boolean }> = [];
    
    for (const [colName, filter] of activeFilters.entries()) {
      const colMeta = metadata.find(m => m.name === colName);
      filterConfigs.push({
        colName,
        filter,
        isDate: !!colMeta?.is_date
      });
    }

    return data.filter(row => {
      // Un row debe cumplir TODOS los filtros
      for (const config of filterConfigs) {
        const val = row[config.colName];
        
        if (config.filter.type === 'text') {
          // Si el filtro de texto está vacío, permitimos todo
          if (config.filter.values.length === 0) continue;
          
          const strVal = val !== undefined && val !== null ? String(val) : '';
          if (!config.filter.values.includes(strVal)) {
            return false;
          }
        } else if (config.filter.type === 'range') {
          let numVal: number;
          
          if (config.isDate) {
            numVal = new Date(val).getTime();
          } else {
            numVal = Number(val);
          }

          if (isNaN(numVal)) {
            // Si el valor no es un número/fecha y hay filtro estricto, descartar
            if (config.filter.min !== null || config.filter.max !== null) return false;
            continue;
          }

          if (config.filter.min !== null && numVal < config.filter.min) return false;
          if (config.filter.max !== null && numVal > config.filter.max) return false;
        }
      }
      return true;
    });
  }
}
