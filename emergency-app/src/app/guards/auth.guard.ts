import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { getCurrentUser } from '@aws-amplify/auth';

export const authGuard: CanActivateFn = async () => {
  const router = inject(Router);

  if (localStorage.getItem('guestMode') === 'true') {
    return true;
  }

  try {
    await getCurrentUser();
    return true;
  } catch {
    return router.createUrlTree(['/login']);
  }
};
