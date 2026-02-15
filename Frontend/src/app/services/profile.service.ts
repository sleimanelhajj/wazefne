import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UpdateProfileRequest, ProfileResponse } from '../models/profile.model';
import { User } from '../models/user-card.model';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api';

  /**
   * Get all users for browsing
   */
  getUsers(): Observable<{ success: boolean; users: User[] }> {
    return this.http.get<{ success: boolean; users: User[] }>(`${this.apiUrl}/users`);
  }

  /**
   * Get authenticated user's profile
   */
  getMyProfile(): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(`${this.apiUrl}/profile/me`);
  }

  /**
   * Get a user's public profile by ID
   */
  getProfileById(id: string): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(`${this.apiUrl}/profile/${id}`);
  }

  /**
   * Update authenticated user's profile
   */
  updateProfile(data: UpdateProfileRequest): Observable<ProfileResponse> {
    return this.http.put<ProfileResponse>(`${this.apiUrl}/profile/update-profile`, data);
  }

  /**
   * Upload portfolio images (multipart form data)
   */
  uploadPortfolio(formData: FormData): Observable<{ success: boolean; images?: any[] }> {
    return this.http.post<{ success: boolean; images?: any[] }>(
      `${this.apiUrl}/profile/upload-portfolio`,
      formData,
    );
  }

  /**
   * Create a review for a user
   */
  createReview(data: {
    reviewed_user_id: string;
    rating: number;
    comment?: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/reviews`, data);
  }

  /**
   * Get reviews for a specific user
   */
  getReviewsByUserId(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/reviews/user/${userId}`);
  }
}
