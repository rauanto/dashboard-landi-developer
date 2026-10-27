import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@env/environment';
import { UsersApiPort } from './users-api.port';
import { User } from '@/core/models/user.model';
import { UserReadDto, UserUpdateDto, UserCreateDto } from '@/core/models/auth-api.models';
import { toUser } from '../mappers/user.mapper';

@Injectable()
export class FastApiUsersAdapter implements UsersApiPort {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/users`;

  /**
   * Obtiene le usuario actual
   * @returns Observable<User>
   * @method GET
   * @route /users/me
   */
  getCurrentUser(): Observable<User> {
    return this.http.get<UserReadDto>(`${this.baseUrl}/me`).pipe(map(toUser));
  }

  /**
   * Actualiza el usuario actual
   * @param user UserUpdateDto
   * @returns Observable<User>
   * @method PATCH
   * @route /users/me
   */
  patchCurrentUser(user: UserUpdateDto): Observable<User> {
    return this.http.patch<UserReadDto>(`${this.baseUrl}/me`, user).pipe(map(toUser));
  }

  /**
   * Obtiene un usuario por su id
   * @param id string
   * @returns Observable<User>
   * @method GET
   * @route /users/:id
   */
  getUser(id: string): Observable<User> {
    return this.http.get<UserReadDto>(`${this.baseUrl}/${id}`).pipe(map(toUser));
  }

  /**
   * Actualiza un usuario por su id
   * @param id string
   * @param user UserUpdateDto
   * @returns Observable<User>
   * @method PATCH
   * @route /users/:id
   */
  patchUser(id: string, user: UserUpdateDto): Observable<User> {
    return this.http.patch<UserReadDto>(`${this.baseUrl}/${id}`, user).pipe(map(toUser));
  }

  /**
   * Elimina un usuario por su id
   * @param id string
   * @returns Observable<void>
   * @method DELETE
   * @route /users/:id
   */
  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * Crea un nuevo usuario
   * @param user UserCreateDto
   * @returns Observable<User>
   * @method POST
   * @route /auth/register
   */
  createUser(user: UserCreateDto): Observable<User> {
    return this.http
      .post<UserReadDto>(`${environment.apiUrl}/auth/register`, user)
      .pipe(map(toUser));
  }
}
