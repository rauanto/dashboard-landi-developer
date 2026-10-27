import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@env/environment';
import { PermissionsApiPort } from './permissions-api.port';
import { Permission, PermissionCreate, PermissionUpdate } from '../models/permission.model';
import {
  PermissionReadDto,
  PermissionCreateDto,
  PermissionUpdateDto,
  ApiResponse_PermissionResponseDto,
  ApiResponse_List_PermissionResponseDto
} from '../models/permissions-api.models';
import { toPermission } from '../mappers/permission.mapper';

@Injectable()
export class FastApiPermissionsAdapter implements PermissionsApiPort {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/permissions`;

  getPermissions(): Observable<Permission[]> {
    return this.http.get<ApiResponse_List_PermissionResponseDto>(`${this.baseUrl}/`).pipe(
      map(response => response.data ? response.data.map(toPermission) : [])
    );
  }

  getPermission(id: string): Observable<Permission> {
    return this.http.get<ApiResponse_PermissionResponseDto>(`${this.baseUrl}/${id}`).pipe(
      map(response => {
        if (!response.data) throw new Error('Permission not found');
        return toPermission(response.data);
      })
    );
  }

  createPermission(permission: PermissionCreate): Observable<Permission> {
    const payload: PermissionCreateDto = { 
      action_id: permission.action_id, 
      resource_id: permission.resource_id, 
      group_id: permission.group_id, 
      description: permission.description 
    };

    return this.http.post<ApiResponse_PermissionResponseDto>(`${this.baseUrl}/`, payload).pipe(
      map(response => {
        if (!response.data) throw new Error('Failed to create permission');
        return toPermission(response.data);
      })
    );
  }

  updatePermission(id: string, permission: PermissionUpdate): Observable<Permission> {
    const payload: PermissionUpdateDto = { 
      action_id: permission.action_id, 
      resource_id: permission.resource_id, 
      group_id: permission.group_id, 
      description: permission.description 
    };

    return this.http.put<ApiResponse_PermissionResponseDto>(`${this.baseUrl}/${id}`, payload).pipe(
      map(response => {
        if (!response.data) throw new Error('Failed to update permission');
        return toPermission(response.data);
      })
    );
  }

  deletePermission(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
