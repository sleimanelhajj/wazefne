import { HttpInterceptorFn, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { from, switchMap } from 'rxjs';

/**
 * Auth HTTP interceptor.
 *
 * Retrieves the current Clerk session token and attaches it as a
 * Bearer token on every outgoing HTTP request. Clerk session tokens
 * are short-lived JWTs that the backend verifies via @clerk/express.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Get the Clerk session token asynchronously
  return from(getClerkToken()).pipe(
    switchMap((token) => {
      if (token) {
        const cloned = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
          },
        });
        return next(cloned);
      }
      return next(req);
    }),
  );
};

async function getClerkToken(): Promise<string | null> {
  try {
    const session = window.Clerk?.session;
    if (!session) return null;
    return await session.getToken();
  } catch {
    return null;
  }
}
