import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return new Promise((resolve) =>
    setTimeout(() => {
      const user = authService.currentUser.getValue();
      if (!user) {
        router.navigate(['/home']);
        resolve(false);
      } else if (
        ((route.data?.['roles'] as string[]) || []).includes(user.role)
      ) {
        resolve(true);
      } else {
        router.navigate(['/home']);
        resolve(false);
      }
    }, 1500)
  );
};
