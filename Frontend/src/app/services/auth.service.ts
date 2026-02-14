import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay, tap } from 'rxjs';
import { Router } from '@angular/router';
import { LoginRequest, SignupRequest, AuthResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = 'http://localhost:3000/api';
  private readonly TOKEN_KEY = 'auth_token';
  private readonly NAME_KEY = 'user_name';

  /**
   * Login user with email and password
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap((res) => {
        if (res.success && res.token) {
          this.saveToken(res.token);
          if (res.user?.name) {
            this.saveUserName(res.user.name);
          } else if (res.user?.email) {
            this.saveUserName(res.user.email);
          }
        }
      })
    );
  }

  /**
   * Register new user
   */
  signup(credentials: SignupRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/signup`, credentials).pipe(
      tap((res) => {
        if (res.success && res.token) {
          this.saveToken(res.token);
          if (res.user?.name) {
            this.saveUserName(res.user.name);
          } else if (res.user?.email) {
            this.saveUserName(res.user.email);
          }
        }
      })
    );
  }

  /**
   * Logout current user
   */
  logout(): void {
    this.removeToken();
    localStorage.removeItem(this.NAME_KEY);
    this.router.navigate(['/login']);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Get current user token from storage
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Save token to storage
   */
  saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Remove token from storage
   */
  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  /**
   * Save user display name to storage
   */
  saveUserName(name: string): void {
    localStorage.setItem(this.NAME_KEY, name);
  }

  /**
   * Get user display name from storage
   */
  getUserName(): string {
    return localStorage.getItem(this.NAME_KEY) || '';
  }
}
