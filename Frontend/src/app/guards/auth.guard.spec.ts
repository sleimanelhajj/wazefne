import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ClerkService } from 'ngx-clerk';
import { firstValueFrom, of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { authGuard } from './auth.guard';

describe('authGuard (unit test)', () => {
  const runGuard = () =>
    TestBed.runInInjectionContext(() =>
      firstValueFrom(authGuard({} as any, {} as any) as any),
    );

  it('allows navigation when Clerk has a signed-in user', async () => {
    const router = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        { provide: ClerkService, useValue: { user$: of({ id: 'user-1' }) } },
        { provide: Router, useValue: router },
      ],
    });

    await expect(runGuard()).resolves.toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('redirects to sign-in when Clerk has no user', async () => {
    const router = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        { provide: ClerkService, useValue: { user$: of(null) } },
        { provide: Router, useValue: router },
      ],
    });

    await expect(runGuard()).resolves.toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/sign-in']);
  });
});
