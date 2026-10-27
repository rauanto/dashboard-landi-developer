import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { USERS_API_PORT } from '../adapters/users-api.port';
import { User } from '../models/user.model';
import { UserUpdateDto, UserCreateDto } from '../models/auth-api.models';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly usersApi = inject(USERS_API_PORT);
  private readonly authService = inject(AuthService); // Si se necesita refrescar el usuario actual

  async getUser(id: string): Promise<User> {
    return firstValueFrom(this.usersApi.getUser(id));
  }

  async updateUser(id: string, userUpdate: UserUpdateDto): Promise<User> {
    return firstValueFrom(this.usersApi.patchUser(id, userUpdate));
  }

  async deleteUser(id: string): Promise<void> {
    return firstValueFrom(this.usersApi.deleteUser(id));
  }

  async createUser(user: UserCreateDto): Promise<User> {
    return firstValueFrom(this.usersApi.createUser(user));
  }

  async updateCurrentUser(userUpdate: UserUpdateDto): Promise<User> {
    const updatedUser = await firstValueFrom(this.usersApi.patchCurrentUser(userUpdate));
    // Podríamos recargar la sesión actual aquí usando authService.ensureSessionChecked
    await this.authService.ensureSessionChecked();
    return updatedUser;
  }
}
