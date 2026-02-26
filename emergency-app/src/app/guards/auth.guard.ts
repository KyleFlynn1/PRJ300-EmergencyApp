import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { fetchAuthSession } from '@aws-amplify/auth';

export const authGuard: CanActivateFn = async () => {
  const router = inject(Router);

  if (localStorage.getItem('guestMode') === 'true') {
    return true;
  }

  try {
    const session = await fetchAuthSession();
    if (session.tokens?.accessToken) {
      return true;
    }
    return router.createUrlTree(['/login']);
  } catch {
    return router.createUrlTree(['/login']);
  }
};
