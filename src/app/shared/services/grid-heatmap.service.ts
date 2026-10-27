import { Injectable, signal, computed } from '@angular/core';
import { HeatmapConfig, ColumnStats } from '../models/heatmap.models';

@Injectable()
export class GridHeatmapService {
  readonly configs = signal<Map<string, HeatmapConfig>>(new Map());
  readonly data = signal<any[]>([]);

  readonly columnStats = computed(() => {
    const data = this.data();
    const configs = this.configs();
    const stats = new Map<string, ColumnStats>();

    if (data.length === 0) return stats;

    configs.forEach((config, colName) => {
      if (!config.enabled) return;

      let min = Infinity;
      let max = -Infinity;

      for (const row of data) {
        const rawValue = row[colName];
        if (rawValue === undefined || rawValue === null || rawValue === '') continue;

        let numValue: number;
        if (config.dataType === 'date') {
          numValue = new Date(rawValue).getTime();
        } else {
          numValue = Number(rawValue);
        }

        if (!isNaN(numValue)) {
          if (numValue < min) min = numValue;
          if (numValue > max) max = numValue;
        }
      }

      if (min !== Infinity && max !== -Infinity) {
        stats.set(colName, { min, max });
      }
    });

    return stats;
  });

  setConfig(colName: string, config: HeatmapConfig) {
    const map = new Map(this.configs());
    map.set(colName, config);
    this.configs.set(map);
  }

  toggleConfig(colName: string, defaultType: 'number' | 'date' | 'text' = 'number') {
    const map = new Map(this.configs());
    const existing = map.get(colName);
    if (existing) {
      map.set(colName, { ...existing, enabled: !existing.enabled });
    } else {
      map.set(colName, { 
        enabled: true, 
        direction: 'asc', 
        dataType: defaultType,
        textRules: defaultType === 'text' ? [] : undefined
      });
    }
    this.configs.set(map);
  }

  getColor(colName: string, rawValue: any): string {
    const config = this.configs().get(colName);
    if (!config || !config.enabled) return '';
    
    if (rawValue === undefined || rawValue === null || rawValue === '') return '';

    if (config.dataType === 'text') {
      if (!config.textRules || config.textRules.length === 0) return '';
      const textVal = String(rawValue).trim().toLowerCase();
      const rule = config.textRules.find(r => (r.value || '').trim().toLowerCase() === textVal);
      return rule ? rule.color : '';
    }

    const stats = this.columnStats().get(colName);
    if (!stats || stats.min === stats.max) return '';

    let numValue: number;
    if (config.dataType === 'date') {
      numValue = new Date(rawValue).getTime();
    } else {
      numValue = Number(rawValue);
    }

    if (isNaN(numValue)) return '';

    const ratio = (numValue - stats.min) / (stats.max - stats.min);
    const normalizedRatio = config.direction === 'asc' ? ratio : (1 - ratio);

    // Hue ranges from 0 (Red) to 120 (Green)
    const hue = normalizedRatio * 120; 
    
    // Using a soft pastel color with high lightness and saturation 
    // so it doesn't clash with black text
    return `hsl(${hue}, 80%, 85%)`;
  }
}
