import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UpdateProfileRequest, ProfileResponse } from '../models/profile.model';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api';

  /**
   * Get authenticated user's profile
   */
  getMyProfile(): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(`${this.apiUrl}/profile/me`);
  }

  /**
   * Update authenticated user's profile
   */
  updateProfile(data: UpdateProfileRequest): Observable<ProfileResponse> {
    return this.http.put<ProfileResponse>(`${this.apiUrl}/profile/update-profile`, data);
  }
}
