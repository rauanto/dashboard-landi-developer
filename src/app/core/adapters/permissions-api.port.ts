import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { Permission, PermissionCreate, PermissionUpdate } from '@/core/models/permission.model';

export const PERMISSIONS_API_PORT = new InjectionToken<PermissionsApiPort>('PERMISSIONS_API_PORT');

export interface PermissionsApiPort {
  getPermissions(): Observable<Permission[]>;
  getPermission(id: string): Observable<Permission>;
  createPermission(permission: PermissionCreate): Observable<Permission>;
  updatePermission(id: string, permission: PermissionUpdate): Observable<Permission>;
  deletePermission(id: string): Observable<void>;
}
