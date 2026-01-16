import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  
  if (!auth.initialized()) {
    return false;
  }

  const user = auth.user();

  if (!user) {
    return router.createUrlTree(['/']);
  }

  const allowedRoles = route.data?.['roles'] as string[] | undefined;

  if (!allowedRoles) {
    return true;
  }

  if (allowedRoles.includes(user.role)) {
    return true;
  } else {
    return router.createUrlTree(['/unauthorized']);
  }
};