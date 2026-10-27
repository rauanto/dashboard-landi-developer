import { Injectable } from '@angular/core';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  MAT_NATIVE_DATE_FORMATS,
  NativeDateAdapter,
} from '@angular/material/core';

export type DatepickerVariant = 'outlined' | 'filled';
export type DatepickerColor = 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'info' | 'error';
export type DatepickerSize = 'xs' | 'sm' | 'md' | 'lg';
/** 'date' => Date | 'iso' => 'YYYY-MM-DD' (ideal para enviar al backend) */
export type DateValueFormat = 'date' | 'iso';

/** Adapter nativo que además entiende dd/mm/aaaa al escribir a mano. */
@Injectable()
export class AppDateAdapter extends NativeDateAdapter {
  override parse(value: unknown): Date | null {
    if (typeof value === 'string') {
      const text = value.trim();
      if (!text) return null;
      const m = text.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/);
      if (!m) return this.invalid();
      const [d, mo, y] = [+m[1], +m[2], +m[3]];
      const date = new Date(y, mo - 1, d);
      return date.getFullYear() === y && date.getMonth() === mo - 1 && date.getDate() === d
        ? date
        : this.invalid();
    }
    return super.parse(value);
  }
}

export const APP_DATE_PROVIDERS = [
  { provide: MAT_DATE_LOCALE, useValue: 'es-MX' },
  { provide: DateAdapter, useClass: AppDateAdapter },
  { provide: MAT_DATE_FORMATS, useValue: MAT_NATIVE_DATE_FORMATS },
];

export function toDate(value: unknown): Date | null {
  if (value === null || value === undefined || value === '') return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  if (typeof value === 'string') {
    const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    const d = iso ? new Date(+iso[1], +iso[2] - 1, +iso[3]) : new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

export function fromDate(date: Date | null, format: DateValueFormat): Date | string | null {
  if (!date) return null;
  if (format === 'date') return date;
  const p = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
}

export function formatDisplay(date: Date): string {
  return date.toLocaleDateString('es-MX');
}
