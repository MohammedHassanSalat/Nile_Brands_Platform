import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { map, switchMap } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isUserRestored().pipe(
    switchMap(restored => {
      if (!restored) {
        return authService.restoreUser().then(() => authService.currentUser);
      }
      return authService.currentUser;
    }),
    map(user => {
      const allowedRoles = (route.data?.['roles'] as string[]) || [];
      if (allowedRoles.length === 0) {
        if (user?.role === 'owner') {
          router.navigate(['/dashboard/hero'], { replaceUrl: true });
          return false;
        }
        return true;
      }
      if (!user) {
        router.navigate(['/home'], { replaceUrl: true });
        return false;
      }
      if (allowedRoles.includes(user.role)) {
        return true;
      }
      if (user.role === 'owner' || user.role === 'admin') {
        router.navigate(['/dashboard/hero'], { replaceUrl: true });
      } else {
        router.navigate(['/home'], { replaceUrl: true });
      }
      return false;
    })
  );
};
