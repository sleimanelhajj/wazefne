import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ClerkService } from 'ngx-clerk';
import { firstValueFrom, of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { guestGuard } from './guest.guard';

describe('guestGuard (unit test)', () => {
  const runGuard = () =>
    TestBed.runInInjectionContext(() => firstValueFrom(guestGuard({} as any, {} as any) as any));

  it('allows guests to visit guest-only routes', async () => {
    const router = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        { provide: ClerkService, useValue: { user$: of(null) } },
        { provide: Router, useValue: router },
      ],
    });

    await expect(runGuard()).resolves.toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('redirects signed-in users away from guest-only routes', async () => {
    const router = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        { provide: ClerkService, useValue: { user$: of({ id: 'user-1' }) } },
        { provide: Router, useValue: router },
      ],
    });

    await expect(runGuard()).resolves.toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/browse']);
  });
});
