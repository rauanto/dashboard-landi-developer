import { PermissionReadDto } from './permissions-api.models';

export interface RoleReadDto {
  id: string;
  name: string;
  description: string | null;
  permissions: PermissionReadDto[];
}

export interface RoleCreateDto {
  name: string;
  description?: string | null;
}

export interface RoleUpdateDto {
  name?: string | null;
  description?: string | null;
}

export interface ApiResponse_RoleResponseDto {
  success: boolean;
  data: RoleReadDto | null;
  message: string | null;
  meta: any | null;
}

export interface ApiResponse_List_RoleResponseDto {
  success: boolean;
  data: RoleReadDto[] | null;
  message: string | null;
  meta: any | null;
}
