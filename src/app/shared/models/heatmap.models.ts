export interface HeatmapConfig {
  enabled: boolean;
  direction: 'asc' | 'desc';
  dataType: 'number' | 'date' | 'text';
  textRules?: { value: string; color: string }[];
}

export interface ColumnStats {
  min: number;
  max: number;
}
