import { UserReadDto } from '../models/auth-api.models';
import { User } from '../models/user.model';

/** 
 * Mapea un DTO crudo de la API (snake_case) al modelo de dominio User (camelCase). 
 * @param dto DTO crudo de la API
 * @returns Modelo de dominio User
 */
export function toUser(dto: UserReadDto): User {
  return {
    id: dto.id,
    email: dto.email,
    isActive: dto.is_active,
    isSuperuser: dto.is_superuser,
    isVerified: dto.is_verified,
  };
}
