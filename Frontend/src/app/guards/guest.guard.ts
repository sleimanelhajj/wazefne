import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ClerkService } from 'ngx-clerk';
import { map, filter, take, timeout, catchError } from 'rxjs';
import { of } from 'rxjs';

export const guestGuard: CanActivateFn = () => {
  const clerk = inject(ClerkService);
  const router = inject(Router);

  return clerk.user$.pipe(
    filter((user) => user !== undefined),
    take(1),
    timeout(5000),
    map((user) => {
      if (user) {
        router.navigate(['/browse']);
        return false;
      }
      return true;
    }),
    catchError(() => {
      return of(true);
    }),
  );
};
