import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { Role, RoleCreate, RoleUpdate } from '@/core/models/role.model';

export const ROLES_API_PORT = new InjectionToken<RolesApiPort>('ROLES_API_PORT');

export interface RolesApiPort {
  getRoles(): Observable<Role[]>;
  getRole(id: string): Observable<Role>;
  createRole(role: RoleCreate): Observable<Role>;
  updateRole(id: string, role: RoleUpdate): Observable<Role>;
  deleteRole(id: string): Observable<void>;
  assignPermissionToRole(roleId: string, permissionId: string): Observable<Role>;
  removePermissionFromRole(roleId: string, permissionId: string): Observable<Role>;
}
