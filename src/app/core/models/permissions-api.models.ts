export interface ActionResponseDto {
  id: string;
  name: string;
  description: string | null;
}

export interface ResourceResponseDto {
  id: string;
  name: string;
  description: string | null;
}

export interface PermissionGroupResponseDto {
  id: string;
  name: string;
  description: string | null;
}

export interface PermissionReadDto {
  id: string;
  name: string | null;
  description: string | null;
  action_id: string;
  resource_id: string;
  group_id: string | null;
  action: ActionResponseDto | null;
  resource: ResourceResponseDto | null;
  group: PermissionGroupResponseDto | null;
}

export interface PermissionCreateDto {
  action_id: string;
  resource_id: string;
  group_id?: string | null;
  description?: string | null;
}

export interface PermissionUpdateDto {
  action_id?: string | null;
  resource_id?: string | null;
  group_id?: string | null;
  description?: string | null;
}

export interface ApiResponse_PermissionResponseDto {
  success: boolean;
  data: PermissionReadDto | null;
  message: string | null;
  meta: any | null;
}

export interface ApiResponse_List_PermissionResponseDto {
  success: boolean;
  data: PermissionReadDto[] | null;
  message: string | null;
  meta: any | null;
}
