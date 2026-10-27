import { Permission } from './permission.model';

export interface Role {
  id: string;
  name: string;
  description: string | null;
  permissions: Permission[];
}

export interface RoleCreate {
  name: string;
  description?: string | null;
}

export interface RoleUpdate {
  name?: string | null;
  description?: string | null;
}
