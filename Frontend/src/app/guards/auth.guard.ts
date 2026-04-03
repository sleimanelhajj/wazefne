import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ClerkService } from 'ngx-clerk';
import { map, filter, take, timeout, catchError } from 'rxjs';
import { of } from 'rxjs';

/**
 * Auth guard that waits for Clerk's user session to be established.
 * Uses `user$` which emits when the user state changes.
 * Redirects to /sign-in if not authenticated.
 *
 * NOTE: Do NOT use this guard on routes that Clerk navigates to via
 * routerPush during load() (e.g. /setup-profile after SSO signup),
 * as it creates a deadlock between the router and Clerk's initialization.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const clerk = inject(ClerkService);
  const router = inject(Router);

  return clerk.user$.pipe(
    filter((user) => user !== undefined),
    take(1),
    timeout(5000),
    map((user) => {
      if (user) {
        return true;
      }
      router.navigate(['/sign-in']);
      return false;
    }),
    catchError(() => {
      router.navigate(['/sign-in']);
      return of(false);
    }),
  );
};
