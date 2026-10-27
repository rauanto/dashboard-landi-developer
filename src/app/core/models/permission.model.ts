export interface ActionResponse {
  id: string;
  name: string;
  description: string | null;
}

export interface ResourceResponse {
  id: string;
  name: string;
  description: string | null;
}

export interface PermissionGroupResponse {
  id: string;
  name: string;
  description: string | null;
}

export interface Permission {
  id: string;
  name: string | null;
  description: string | null;
  action_id: string;
  resource_id: string;
  group_id: string | null;
  action: ActionResponse | null;
  resource: ResourceResponse | null;
  group: PermissionGroupResponse | null;
}

export interface PermissionCreate {
  action_id: string;
  resource_id: string;
  group_id?: string | null;
  description?: string | null;
}

export interface PermissionUpdate {
  action_id?: string | null;
  resource_id?: string | null;
  group_id?: string | null;
  description?: string | null;
}
