export type FilterType = 'text' | 'range';

export interface TextFilter {
  type: 'text';
  values: string[]; // Selected catalogue values
}

export interface RangeFilter {
  type: 'range';
  min: number | null;
  max: number | null;
}

export type GridFilter = TextFilter | RangeFilter;
