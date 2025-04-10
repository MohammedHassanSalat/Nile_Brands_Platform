import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { map, switchMap, take } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Wait for restoration to complete, then check currentUser
  return authService.isUserRestored().pipe(
    switchMap((restored) => {
      if (!restored) {
        return authService.restoreUser().then(() => authService.currentUser); // Trigger restore if not done
      }
      return authService.currentUser; // Use current value if restored
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

      if (user.role == 'owner' || user.role == 'admin') {
        router.navigate(['/dashboard/hero']);
      } else {
        router.navigate(['/home']);
      }
      return false;
    })
  );
};