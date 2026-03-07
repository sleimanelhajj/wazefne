// guest.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const guestGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const clerk = (window as any).Clerk;

  if (clerk) {
    await clerk.load();
    const hasSession = clerk.client?.activeSessions?.length > 0;
    if (hasSession) {
      router.navigate(['/browse']);
      return false;
    }
  }

  return true;
};