import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { PERMISSIONS_API_PORT } from '../adapters/permissions-api.port';
import { Permission, PermissionCreate, PermissionUpdate } from '../models/permission.model';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private readonly permissionsApi = inject(PERMISSIONS_API_PORT);

  private readonly _permissions = signal<Permission[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  public readonly permissions = this._permissions.asReadonly();
  public readonly loading = this._loading.asReadonly();
  public readonly error = this._error.asReadonly();

  async loadPermissions(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const perms = await firstValueFrom(this.permissionsApi.getPermissions());
      this._permissions.set(perms);
    } catch (e: any) {
      this._error.set(e.message || 'Error loading permissions');
    } finally {
      this._loading.set(false);
    }
  }

  async getPermission(id: string): Promise<Permission> {
    return firstValueFrom(this.permissionsApi.getPermission(id));
  }

  async createPermission(permissionCreate: PermissionCreate): Promise<Permission> {
    this._loading.set(true);
    try {
      const newPerm = await firstValueFrom(this.permissionsApi.createPermission(permissionCreate));
      this._permissions.update(perms => [...perms, newPerm]);
      return newPerm;
    } finally {
      this._loading.set(false);
    }
  }

  async updatePermission(id: string, permissionUpdate: PermissionUpdate): Promise<Permission> {
    this._loading.set(true);
    try {
      const updatedPerm = await firstValueFrom(this.permissionsApi.updatePermission(id, permissionUpdate));
      this._permissions.update(perms => perms.map(p => p.id === id ? updatedPerm : p));
      return updatedPerm;
    } finally {
      this._loading.set(false);
    }
  }

  async deletePermission(id: string): Promise<void> {
    this._loading.set(true);
    try {
      await firstValueFrom(this.permissionsApi.deletePermission(id));
      this._permissions.update(perms => perms.filter(p => p.id !== id));
    } finally {
      this._loading.set(false);
    }
  }
}
