import { PermissionReadDto } from '../models/permissions-api.models';
import { Permission } from '../models/permission.model';

/** Mapea un DTO crudo de la API al modelo de dominio Permission. */
export function toPermission(dto: PermissionReadDto): Permission {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description,
    action_id: dto.action_id,
    resource_id: dto.resource_id,
    group_id: dto.group_id,
    action: dto.action,
    resource: dto.resource,
    group: dto.group,
  };
}
