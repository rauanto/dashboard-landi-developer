import { Injectable, inject, signal, computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ROLES_API_PORT } from '../adapters/roles-api.port';
import { Role, RoleCreate, RoleUpdate } from '../models/role.model';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private readonly rolesApi = inject(ROLES_API_PORT);

  private readonly _roles = signal<Role[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  public readonly roles = this._roles.asReadonly();
  public readonly loading = this._loading.asReadonly();
  public readonly error = this._error.asReadonly();

  async loadRoles(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const roles = await firstValueFrom(this.rolesApi.getRoles());
      this._roles.set(roles);
    } catch (e: any) {
      this._error.set(e.message || 'Error loading roles');
    } finally {
      this._loading.set(false);
    }
  }

  async getRole(id: string): Promise<Role> {
    return firstValueFrom(this.rolesApi.getRole(id));
  }

  async createRole(roleCreate: RoleCreate): Promise<Role> {
    this._loading.set(true);
    try {
      const newRole = await firstValueFrom(this.rolesApi.createRole(roleCreate));
      this._roles.update(roles => [...roles, newRole]);
      return newRole;
    } finally {
      this._loading.set(false);
    }
  }

  async updateRole(id: string, roleUpdate: RoleUpdate): Promise<Role> {
    this._loading.set(true);
    try {
      const updatedRole = await firstValueFrom(this.rolesApi.updateRole(id, roleUpdate));
      this._roles.update(roles => roles.map(r => r.id === id ? updatedRole : r));
      return updatedRole;
    } finally {
      this._loading.set(false);
    }
  }

  async deleteRole(id: string): Promise<void> {
    this._loading.set(true);
    try {
      await firstValueFrom(this.rolesApi.deleteRole(id));
      this._roles.update(roles => roles.filter(r => r.id !== id));
    } finally {
      this._loading.set(false);
    }
  }

  async assignPermission(roleId: string, permissionId: string): Promise<Role> {
    this._loading.set(true);
    try {
      const updatedRole = await firstValueFrom(this.rolesApi.assignPermissionToRole(roleId, permissionId));
      this._roles.update(roles => roles.map(r => r.id === roleId ? updatedRole : r));
      return updatedRole;
    } finally {
      this._loading.set(false);
    }
  }

  async removePermission(roleId: string, permissionId: string): Promise<Role> {
    this._loading.set(true);
    try {
      const updatedRole = await firstValueFrom(this.rolesApi.removePermissionFromRole(roleId, permissionId));
      this._roles.update(roles => roles.map(r => r.id === roleId ? updatedRole : r));
      return updatedRole;
    } finally {
      this._loading.set(false);
    }
  }
}
