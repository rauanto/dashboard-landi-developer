import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '@/core/models/user.model';
import { UserUpdateDto, UserCreateDto } from '@/core/models/auth-api.models';

export const USERS_API_PORT = new InjectionToken<UsersApiPort>('USERS_API_PORT');

export interface UsersApiPort {
  getCurrentUser(): Observable<User>;
  patchCurrentUser(user: UserUpdateDto): Observable<User>;
  getUser(id: string): Observable<User>;
  patchUser(id: string, user: UserUpdateDto): Observable<User>;
  createUser(user: UserCreateDto): Observable<User>;
  deleteUser(id: string): Observable<void>;
}
