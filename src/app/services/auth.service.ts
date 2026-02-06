import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { LoginRequest, SignupRequest, AuthResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api'; // Replace with your API URL

  /**
   * Login user with email and password
   * TODO: Connect to real API endpoint
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    // Dummy implementation - replace with actual API call
    // return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials);

    return of({
      success: true,
      token: 'dummy-jwt-token-12345',
      message: 'Login successful',
      user: {
        id: '1',
        email: credentials.email,
        name: 'John Doe',
      },
    }).pipe(delay(1000)); // Simulate network delay
  }

  /**
   * Register new user
   * TODO: Connect to real API endpoint
   */
  signup(credentials: SignupRequest): Observable<AuthResponse> {
    // Dummy implementation - replace with actual API call
    // return this.http.post<AuthResponse>(`${this.apiUrl}/auth/signup`, credentials);

    return of({
      success: true,
      token: 'dummy-jwt-token-67890',
      message: 'Account created successfully',
      user: {
        id: '2',
        email: credentials.email,
        name: 'New User',
      },
    }).pipe(delay(1000)); // Simulate network delay
  }

  /**
   * Logout current user
   * TODO: Connect to real API endpoint
   */
  logout(): Observable<{ success: boolean }> {
    // Dummy implementation - replace with actual API call
    // return this.http.post<{ success: boolean }>(`${this.apiUrl}/auth/logout`, {});

    return of({ success: true }).pipe(delay(500));
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    // TODO: Implement proper authentication check (e.g., check for valid token)
    return false;
  }

  /**
   * Get current user token from storage
   */
  getToken(): string | null {
    // TODO: Implement token retrieval from localStorage/sessionStorage
    return null;
  }

  /**
   * Save token to storage
   */
  saveToken(token: string): void {
    // TODO: Implement token storage
    localStorage.setItem('auth_token', token);
  }

  /**
   * Remove token from storage
   */
  removeToken(): void {
    // TODO: Implement token removal
    localStorage.removeItem('auth_token');
  }
}
