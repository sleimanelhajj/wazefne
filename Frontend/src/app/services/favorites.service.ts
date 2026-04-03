import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../models/user-card.model';

@Injectable({
  providedIn: 'root',
})
export class FavoritesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/favorites`;

  getFavoriteUsers(): Observable<{ success: boolean; users: User[] }> {
    return this.http.get<{ success: boolean; users: User[] }>(`${this.apiUrl}/users`);
  }

  addFavoriteUser(
    favoriteUserId: string,
  ): Observable<{ success: boolean; isFavorited: boolean; added: boolean }> {
    return this.http.post<{ success: boolean; isFavorited: boolean; added: boolean }>(
      `${this.apiUrl}/users/${favoriteUserId}`,
      {},
    );
  }

  removeFavoriteUser(
    favoriteUserId: string,
  ): Observable<{ success: boolean; isFavorited: boolean; removed: boolean }> {
    return this.http.delete<{ success: boolean; isFavorited: boolean; removed: boolean }>(
      `${this.apiUrl}/users/${favoriteUserId}`,
    );
  }
}
