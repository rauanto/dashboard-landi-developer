export type MenuSize = 'sm' | 'md' | 'lg';
export type MenuItemColor = 'default' | 'primary' | 'success' | 'warning' | 'info' | 'error';

/** Dónde se abre el menú respecto al botón. Si no cabe, se voltea solo. */
export type MenuPlacement = 'below-start' | 'below-end' | 'above-start' | 'above-end' | 'right' | 'left';

/** `data` es lo que pasaste en [appMenuData] / [appContextMenuData] (p. ej. la fila). */
export type MenuFlag = boolean | ((data: any) => boolean);

interface MenuItemBase {
  id?: string;
  label: string;
  /** Nombre de mat-icon. */
  icon?: string;
  /** Segunda línea, más pequeña. */
  description?: string;
  /** Texto de atajo a la derecha, p. ej. 'Ctrl+C' (solo visual). */
  shortcut?: string;
  badge?: string | number;
  color?: MenuItemColor;
  disabled?: MenuFlag;
  hidden?: MenuFlag;
  /** Se ejecuta al elegir la opción. Recibe los datos del trigger. */
  command?: (data: any, item: MenuItem) => void;
}

export interface MenuAction extends MenuItemBase {
  type?: 'item';
}

export interface MenuCheckbox extends MenuItemBase {
  type: 'checkbox';
  checked?: boolean;
  /** No cierra el menú al marcar (útil en filtros). */
  keepOpen?: boolean;
}

export interface MenuRadio extends MenuItemBase {
  type: 'radio';
  /** Los radios consecutivos con el mismo `group` forman un grupo. */
  group: string;
  value: unknown;
  checked?: boolean;
  keepOpen?: boolean;
}

export interface MenuSubmenu extends MenuItemBase {
  type: 'submenu';
  children: MenuItem[];
}

export interface MenuDivider {
  type: 'divider';
  hidden?: MenuFlag;
}

/** Título de grupo (texto pequeño, no seleccionable). */
export interface MenuLabel {
  type: 'label';
  label: string;
  hidden?: MenuFlag;
}

export type MenuItem = MenuAction | MenuCheckbox | MenuRadio | MenuSubmenu | MenuDivider | MenuLabel;

export interface MenuSelectEvent {
  item: MenuAction | MenuCheckbox | MenuRadio;
  /** Datos del trigger (fila, registro, etc.). */
  data: any;
  /** Estado nuevo en checkbox/radio. */
  checked?: boolean;
}

/** @internal agrupa radios consecutivos para que CDK los trate como un grupo. */
export type MenuSegment =
  | { kind: 'item'; item: MenuItem }
  | { kind: 'radios'; group: string; items: MenuRadio[] };

export function buildMenuSegments(items: MenuItem[]): MenuSegment[] {
  const out: MenuSegment[] = [];
  for (const item of items) {
    if (item.type === 'radio') {
      const last = out[out.length - 1];
      if (last?.kind === 'radios' && last.group === item.group) {
        last.items.push(item);
      } else {
        out.push({ kind: 'radios', group: item.group, items: [item] });
      }
    } else {
      out.push({ kind: 'item', item });
    }
  }
  return out;
}
