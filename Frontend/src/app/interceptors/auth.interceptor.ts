import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
/**
 * Auth HTTP interceptor.
 *
 * This interceptor runs on every outgoing HttpClient request. It retrieves the current access token
 * from AuthService and, when available, clones the request to automatically attach an
 * `Authorization: Bearer <token>` header before forwarding it. This centralizes authentication
 * header handling so individual API calls don’t need to manually set auth headers.
 */

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(cloned);
  }

  return next(req);
};
