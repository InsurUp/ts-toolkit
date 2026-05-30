import { inject } from '@angular/core';
import type { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Awaits lazy hydration from storage and a transparent refresh when the
  // stored access token is expired but still renewable.
  const token = await authService.getAccessToken();
  if (token) {
    return true;
  }

  await router.navigate(['/']);
  return false;
};
