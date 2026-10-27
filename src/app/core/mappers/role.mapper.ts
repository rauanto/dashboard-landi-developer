import { RoleReadDto } from '../models/roles-api.models';
import { Role } from '../models/role.model';
import { toPermission } from './permission.mapper';

/** Mapea un DTO crudo de la API al modelo de dominio Role. */
export function toRole(dto: RoleReadDto): Role {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description,
    permissions: dto.permissions ? dto.permissions.map(toPermission) : [],
  };
}
