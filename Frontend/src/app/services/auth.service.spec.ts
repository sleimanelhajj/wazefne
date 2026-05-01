import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ClerkService } from 'ngx-clerk';
import { of } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LocationService } from './location.service';
import { AuthService } from './auth.service';

describe('AuthService (unit test)', () => {
  let httpMock: HttpTestingController;

  const setup = () => {
    const router = { navigate: vi.fn() };
    const locationService = { clearLocation: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ClerkService, useValue: { user$: of(null) } },
        { provide: Router, useValue: router },
        { provide: LocationService, useValue: locationService },
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);

    return {
      service: TestBed.inject(AuthService),
      router,
      locationService,
    };
  };

  afterEach(() => {
    httpMock?.verify();
    sessionStorage.clear();
    delete (window as any).Clerk;
    TestBed.resetTestingModule();
  });

  it('reports authentication from the Clerk browser user', () => {
    (window as any).Clerk = { user: { id: 'user-1' } };
    const { service } = setup();

    expect(service.isAuthenticated()).toBe(true);
  });

  it('returns the username when Clerk provides one', () => {
    (window as any).Clerk = {
      user: {
        username: 'maya',
        firstName: 'Maya',
        lastName: 'Haddad',
      },
    };
    const { service } = setup();

    expect(service.getUserName()).toBe('maya');
  });

  it('saves and returns the profile image from session storage', () => {
    const { service } = setup();

    service.saveProfileImage('avatar.png');

    expect(service.getProfileImage()).toBe('avatar.png');
    expect(sessionStorage.getItem('user_profile_image')).toBe('avatar.png');
  });

  it('logs out through Clerk, clears local UI state, and navigates to sign-in', async () => {
    const signOut = vi.fn().mockResolvedValue(undefined);
    (window as any).Clerk = { signOut };
    const { service, router, locationService } = setup();
    service.saveProfileImage('avatar.png');

    await service.logout();

    expect(locationService.clearLocation).toHaveBeenCalled();
    expect(sessionStorage.getItem('user_profile_image')).toBeNull();
    expect(signOut).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/sign-in']);
  });
});
