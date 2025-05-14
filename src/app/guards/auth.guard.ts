import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { map, switchMap } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isUserRestored().pipe(
    switchMap((restored) => {
      if (!restored) {
        return authService.restoreUser().then(() => authService.currentUser);
      }
      return authService.currentUser;
    }),
    map((user) => {
      if (!user) {
        router.navigate(['/home']);
        return false;
      }

      const allowedRoles = (route.data?.['roles'] as string[]) || [];
      if (allowedRoles.length === 0 || allowedRoles.includes(user.role)) {
        return true;
      }
      router.navigate(['/home']);
      return false;
    })
  );
};
