import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ClerkService } from 'ngx-clerk';
import { Observable, BehaviorSubject, map, filter, switchMap, tap } from 'rxjs';
import { LocationService } from './location.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly clerk = inject(ClerkService);
  private readonly router = inject(Router);
  private readonly locationService = inject(LocationService);
  private readonly http = inject(HttpClient);

  private readonly PROFILE_IMAGE_KEY = 'user_profile_image';
  readonly isSignedIn$: Observable<boolean> = this.clerk.user$.pipe(map((user) => !!user));

  // BehaviorSubject to allow components to reactively update when the image changes
  private profileImageSubject = new BehaviorSubject<string | null>(this.getInitialProfileImage());
  readonly profileImage$ = this.profileImageSubject.asObservable();

  private _dbUserId: string | null = null;

  constructor() {
    // Whenever Clerk authenticates a user, fetch their backend Database ID and Profile Image.
    // The auth interceptor will automatically attach the Clerk token.
    this.clerk.user$
      .pipe(
        filter((user) => !!user),
        switchMap(() => this.http.get<any>(`${environment.apiUrl}/api/profile/me`)),
      )
      .subscribe({
        next: (response) => {
          if (response.success && response.user) {
            this._dbUserId = response.user.id;
            // Prefer the synced database image if available, else fallback to Clerk image
            const dbImage = response.user.profile_image || window.Clerk?.user?.imageUrl;
            if (dbImage) {
              this.saveProfileImage(dbImage);
            }
          }
        },
        error: (err) => console.error('Failed to fetch DB user ID:', err),
      });
  }

  isAuthenticated(): boolean {
    return !!window.Clerk?.user;
  }

  async getToken(): Promise<string | null> {
    try {
      const session = window.Clerk?.session;
      if (!session) return null;
      return await session.getToken();
    } catch {
      return null;
    }
  }

  getUserName(): string {
    const user = window.Clerk?.user;
    if (!user) return '';

    // Attempt to return the Clerk username first using any cast to bypass type definitions
    if ((user as any).username) {
      return (user as any).username;
    }

    // Fallback to primary email address formatting or full name if username is missing
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');
    const emailPrefix = user.primaryEmailAddress?.emailAddress?.split('@')[0];

    return emailPrefix || fullName || 'User';
  }

  private getInitialProfileImage(): string | null {
    const storedImage = sessionStorage.getItem(this.PROFILE_IMAGE_KEY);
    if (storedImage) {
      return storedImage;
    }
    return window.Clerk?.user?.imageUrl || null;
  }

  getProfileImage(): string | null {
    return this.profileImageSubject.value || window.Clerk?.user?.imageUrl || null;
  }

  getUserId(): string | null {
    return this._dbUserId;
  }

  saveProfileImage(imageUrl: string): void {
    if (imageUrl) {
      sessionStorage.setItem(this.PROFILE_IMAGE_KEY, imageUrl);
      this.profileImageSubject.next(imageUrl);
    }
  }

  async logout(): Promise<void> {
    this._dbUserId = null;
    this.locationService.clearLocation();
    sessionStorage.removeItem(this.PROFILE_IMAGE_KEY);
    this.profileImageSubject.next(null);
    if (window.Clerk) {
      await window.Clerk.signOut();
    }
    this.router.navigate(['/sign-in']);
  }
}
