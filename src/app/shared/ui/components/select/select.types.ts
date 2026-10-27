export type SelectVariant = 'outlined' | 'filled';

export type SelectColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'success'
  | 'warning'
  | 'info'
  | 'error';

export type SelectSize = 'xs' | 'sm' | 'md' | 'lg';

export interface SelectOption<T = unknown> {
  label: string;
  value: T;
  disabled?: boolean;
  icon?: string;
  description?: string;
}
