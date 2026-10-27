import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@env/environment';
import { RolesApiPort } from './roles-api.port';
import { Role, RoleCreate, RoleUpdate } from '../models/role.model';
import {
  RoleReadDto,
  RoleCreateDto,
  RoleUpdateDto,
  ApiResponse_RoleResponseDto,
  ApiResponse_List_RoleResponseDto
} from '../models/roles-api.models';
import { toRole } from '../mappers/role.mapper';

@Injectable()
export class FastApiRolesAdapter implements RolesApiPort {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/roles`;

  getRoles(): Observable<Role[]> {
    return this.http.get<ApiResponse_List_RoleResponseDto>(`${this.baseUrl}/`).pipe(
      map(response => response.data ? response.data.map(toRole) : [])
    );
  }

  getRole(id: string): Observable<Role> {
    return this.http.get<ApiResponse_RoleResponseDto>(`${this.baseUrl}/${id}`).pipe(
      map(response => {
        if (!response.data) throw new Error('Role not found');
        return toRole(response.data);
      })
    );
  }

  createRole(role: RoleCreate): Observable<Role> {
    const payload: RoleCreateDto = { name: role.name, description: role.description };
    return this.http.post<ApiResponse_RoleResponseDto>(`${this.baseUrl}/`, payload).pipe(
      map(response => {
        if (!response.data) throw new Error('Failed to create role');
        return toRole(response.data);
      })
    );
  }

  updateRole(id: string, role: RoleUpdate): Observable<Role> {
    const payload: RoleUpdateDto = { name: role.name, description: role.description };
    return this.http.put<ApiResponse_RoleResponseDto>(`${this.baseUrl}/${id}`, payload).pipe(
      map(response => {
        if (!response.data) throw new Error('Failed to update role');
        return toRole(response.data);
      })
    );
  }

  deleteRole(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  assignPermissionToRole(roleId: string, permissionId: string): Observable<Role> {
    return this.http.post<ApiResponse_RoleResponseDto>(`${this.baseUrl}/${roleId}/permissions/${permissionId}`, {}).pipe(
      map(response => {
        if (!response.data) throw new Error('Failed to assign permission');
        return toRole(response.data);
      })
    );
  }

  removePermissionFromRole(roleId: string, permissionId: string): Observable<Role> {
    return this.http.delete<ApiResponse_RoleResponseDto>(`${this.baseUrl}/${roleId}/permissions/${permissionId}`).pipe(
      map(response => {
        if (!response.data) throw new Error('Failed to remove permission');
        return toRole(response.data);
      })
    );
  }
}
