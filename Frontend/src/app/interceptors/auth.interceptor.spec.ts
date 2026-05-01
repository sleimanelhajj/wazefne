import { HttpHandlerFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { firstValueFrom, of } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor (unit test)', () => {
  afterEach(() => {
    delete (window as any).Clerk;
  });

  it('adds a bearer token when Clerk has an active session', async () => {
    (window as any).Clerk = {
      session: {
        getToken: vi.fn().mockResolvedValue('test-token'),
      },
    };

    let handledRequest: HttpRequest<unknown> | undefined;
    const next: HttpHandlerFn = (request) => {
      handledRequest = request;
      return of(new HttpResponse({ status: 200 }));
    };

    await firstValueFrom(authInterceptor(new HttpRequest('GET', '/api/profile/me'), next));

    expect(handledRequest?.headers.get('Authorization')).toBe('Bearer test-token');
  });

  it('leaves the request unchanged when Clerk has no token', async () => {
    (window as any).Clerk = {
      session: {
        getToken: vi.fn().mockResolvedValue(null),
      },
    };

    let handledRequest: HttpRequest<unknown> | undefined;
    const originalRequest = new HttpRequest('GET', '/api/profile/me');
    const next: HttpHandlerFn = (request) => {
      handledRequest = request;
      return of(new HttpResponse({ status: 200 }));
    };

    await firstValueFrom(authInterceptor(originalRequest, next));

    expect(handledRequest).toBe(originalRequest);
    expect(handledRequest?.headers.has('Authorization')).toBe(false);
  });
});
