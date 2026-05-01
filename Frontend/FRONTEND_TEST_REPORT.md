# Frontend Automated Test Report

## Overview

This frontend test suite uses Angular's `ng test` command with Vitest through the Angular unit-test builder.

Run all frontend tests once:

```bash
cd Frontend
npm run test:ci
```

Run tests in watch mode while coding:

```bash
cd Frontend
npm test
```

Current verified result:

```text
Test Files  22 passed (22)
Tests       65 passed (65)
```

## What Kind Of Tests These Are

| Test type | Meaning in this project |
| --- | --- |
| Unit test | Tests one service, guard, or interceptor in isolation with fake inputs. |
| HTTP unit test | Tests that a service calls the correct backend URL/method/body without making a real network request. |
| Component test | Renders an Angular component in a test environment and checks inputs, outputs, clicks, validation, and visible state. |

These tests do not call the real backend, Clerk, Gemini, or Supabase. They use mocks so the output is stable and repeatable.

## Test Coverage Summary

| Script | Type | What was tested | Expected behavior |
| --- | --- | --- | --- |
| `src/app/services/filter.service.spec.ts` | Unit test | Browse filter defaults, partial filter updates, `filters$` emissions | Filters start empty/defaulted, updates merge without deleting old values, subscribers receive changes. |
| `src/app/services/location.service.spec.ts` | Unit test | Cached location, clearing location, geolocation mapping | Cached location restores, logout clearing removes it, coordinates map to nearest known location. |
| `src/app/services/auth.service.spec.ts` | Unit test | Auth state, username lookup, profile image cache, logout | Clerk user means authenticated, username is read correctly, image saves to session storage, logout clears UI state and navigates to sign-in. |
| `src/app/interceptors/auth.interceptor.spec.ts` | Unit test | Auth header attachment | Clerk token becomes `Authorization: Bearer <token>`; no token leaves request unchanged. |
| `src/app/guards/auth.guard.spec.ts` | Unit test | Protected route access | Signed-in users pass; signed-out users redirect to `/sign-in`. |
| `src/app/guards/guest.guard.spec.ts` | Unit test | Guest-only route access | Guests pass; signed-in users redirect to `/browse`. |
| `src/app/services/profile.service.spec.ts` | HTTP unit test | Profile API calls | Uses correct endpoints for browse users, profile update, and profile picture upload. |
| `src/app/services/favorites.service.spec.ts` | HTTP unit test | Favorites API calls | Uses correct GET/POST/DELETE endpoints for favorite users. |
| `src/app/services/job.service.spec.ts` | HTTP unit test | Jobs and bids API calls | Sends filters correctly, skips `location=all`, creates jobs, updates bid status. |
| `src/app/services/offer.service.spec.ts` | HTTP unit test | Offer API calls | Creates offers, patches offer status, cancels offers with correct payloads. |
| `src/app/services/chat.service.spec.ts` | HTTP unit test | Chat API calls | Loads conversations, sends messages, creates conversations. |
| `src/app/services/cv-analyzer.service.spec.ts` | HTTP unit test | CV analyzer API calls | Uploads CV as form data, trims optional fields, requests history with limit. |
| `src/app/components/browse/side-bar/side-bar.component.spec.ts` | Component test | Browse filter sidebar logic | Builds category counts, includes detected location, emits category/rating/price filters. |
| `src/app/components/browse/user-card/user-card.component.spec.ts` | Component test | Provider card behavior | Formats name, navigates to public/my profile, emits favorite toggle without card navigation. |
| `src/app/components/bookings-history/booking-card/booking-card.component.spec.ts` | Component test | Booking card action rules | Correct actions appear for sent/received bookings and events emit correct booking IDs. |
| `src/app/components/bookings-history/booking-tabs/booking-tabs.component.spec.ts` | Component test | Booking tab selection | Renders labels/counts and emits selected tab key. |
| `src/app/components/jobs/job-card/job-card.component.spec.ts` | Component test | Job card display and proposal click | Formats time ago and emits selected job on proposal click. |
| `src/app/components/jobs/bid-modal/bid-modal.component.spec.ts` | Component test | Bid modal validation and submit flow | Missing fields show error; valid bids are trimmed and submitted; backend errors surface. |
| `src/app/components/jobs/post-job-modal/post-job-modal.component.spec.ts` | Component test | Post-job modal validation and submit flow | Defaults are set; missing fields show error; valid job data is trimmed and submitted; backend errors surface. |
| `src/app/components/messages/chat-header/chat-header.component.spec.ts` | Component test | Chat header rendering | No header without contact; selected contact renders; back button emits. |
| `src/app/components/messages/conversation-list/conversation-list.component.spec.ts` | Component test | Conversation list rendering | Conversations render and emit on click; empty state appears when no conversations exist. |
| `src/app/components/messages/message-input/message-input.component.spec.ts` | Component test | Message input behavior | Blank messages do not emit; typed messages trim and emit; send/create-offer buttons emit. |

## Representative Code Snippets

### Auth Interceptor

This tests that the frontend automatically attaches the Clerk JWT to API requests.

```ts
(window as any).Clerk = {
  session: {
    getToken: vi.fn().mockResolvedValue('test-token'),
  },
};

await firstValueFrom(authInterceptor(new HttpRequest('GET', '/api/profile/me'), next));

expect(handledRequest?.headers.get('Authorization')).toBe('Bearer test-token');
```

Expected behavior:

```text
When Clerk has a token, every outgoing request gets Authorization: Bearer test-token.
```

### HTTP Service Test

This tests `ProfileService.updateProfile()` without calling the real backend.

```ts
service.updateProfile(payload).subscribe((response) => {
  expect(response.success).toBe(true);
});

const req = httpMock.expectOne(`${apiUrl}/profile/update-profile`);
expect(req.request.method).toBe('PUT');
expect(req.request.body).toEqual(payload);
req.flush({ success: true, user: { id: 'user-1' } });
```

Expected behavior:

```text
The service sends a PUT request to /api/profile/update-profile with the exact profile payload.
```

### Component Click Test

This tests the chat message input like a user clicking the send button.

```ts
const input = fixture.debugElement.query(By.css('.msg-input')).nativeElement;
const sendButton = fixture.debugElement.query(By.css('.send-btn')).nativeElement;

input.value = 'from the rendered input';
input.dispatchEvent(new Event('input'));
sendButton.click();

expect(sentMessages).toEqual(['from the rendered input']);
```

Expected behavior:

```text
The rendered component reads the typed text and emits it through messageSent.
```

### Guard Test

This tests route protection without real Clerk login.

```ts
TestBed.configureTestingModule({
  providers: [
    { provide: ClerkService, useValue: { user$: of(null) } },
    { provide: Router, useValue: router },
  ],
});

await expect(runGuard()).resolves.toBe(false);
expect(router.navigate).toHaveBeenCalledWith(['/sign-in']);
```

Expected behavior:

```text
A signed-out user cannot enter protected routes and gets redirected to /sign-in.
```

### Modal Validation Test

This tests the bid modal before any API call is allowed.

```ts
component.proposal = '   ';
component.proposed_rate = null;

component.submitBid();

expect(component.errorMsg).toBe('Please provide a proposal and an hourly rate.');
expect(jobService.createBid).not.toHaveBeenCalled();
```

Expected behavior:

```text
The modal blocks invalid input and does not call the API service.
```

## Final Console Output

This is the final successful test run:

```text
> wazefne@0.0.0 test:ci
> ng test --watch=false

> Building...
√ Building...

RUN  v4.0.18 C:/Users/Sleiman/Desktop/wazefne/Frontend

✓ src/app/services/filter.service.spec.ts (3 tests)
✓ src/app/services/location.service.spec.ts (3 tests)
✓ src/app/services/cv-analyzer.service.spec.ts (2 tests)
✓ src/app/services/job.service.spec.ts (4 tests)
✓ src/app/services/offer.service.spec.ts (3 tests)
✓ src/app/services/favorites.service.spec.ts (3 tests)
✓ src/app/services/profile.service.spec.ts (3 tests)
✓ src/app/components/messages/chat-header/chat-header.component.spec.ts (2 tests)
✓ src/app/interceptors/auth.interceptor.spec.ts (2 tests)
✓ src/app/components/bookings-history/booking-tabs/booking-tabs.component.spec.ts (1 test)
✓ src/app/services/auth.service.spec.ts (4 tests)
✓ src/app/guards/auth.guard.spec.ts (2 tests)
✓ src/app/services/chat.service.spec.ts (3 tests)
✓ src/app/guards/guest.guard.spec.ts (2 tests)
✓ src/app/components/jobs/job-card/job-card.component.spec.ts (3 tests)
✓ src/app/components/messages/conversation-list/conversation-list.component.spec.ts (2 tests)
✓ src/app/components/bookings-history/booking-card/booking-card.component.spec.ts (4 tests)
✓ src/app/components/browse/user-card/user-card.component.spec.ts (4 tests)
✓ src/app/components/jobs/bid-modal/bid-modal.component.spec.ts (3 tests)
✓ src/app/components/messages/message-input/message-input.component.spec.ts (4 tests)
✓ src/app/components/jobs/post-job-modal/post-job-modal.component.spec.ts (4 tests)
✓ src/app/components/browse/side-bar/side-bar.component.spec.ts (4 tests)

Test Files  22 passed (22)
Tests       65 passed (65)
Duration    4.35s
```

## Notes

- This is frontend-only.
- These tests check logic, request construction, route decisions, and component behavior.
- They do not prove that the backend, database, Clerk, Supabase, or Gemini are working in production.
- While adding the sidebar component test, TypeScript exposed that `CategoryOption` was referenced but not declared. I added the missing local interface in `side-bar.component.ts`.
