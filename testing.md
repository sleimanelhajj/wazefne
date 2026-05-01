# Wazefne Testing Documentation

## 1. Purpose

This document defines testing requirements, manual test cases, API test cases, expected outputs, regression coverage, and recommended automated testing for the Wazefne application.

The current repository contains Angular and Express code, but no committed automated test specs were found during inspection. The frontend has an `ng test` script configured through Angular CLI. The backend currently has no `test` script in `Backend/package.json`.

## 2. Test Scope

Testing should cover:

- Authentication and Clerk session handling.
- Backend user synchronization.
- Route guards and guest/protected access.
- Profile setup, editing, image upload, portfolio, skills, and languages.
- Browse, search, filters, and favorites.
- Public profile viewing and review submission.
- Conversation creation and message sending.
- Supabase Realtime updates for messages and offers.
- Direct offer and booking lifecycle.
- Job posting, job bidding, bid management, and job-derived bookings.
- CV analysis upload, caching, validation, and history.
- API validation and authorization failures.
- Responsive frontend behavior on desktop and mobile.
- Non-functional checks: performance, reliability, error states, security controls.

Out of scope unless new features are added:

- Payment processing.
- Calendar scheduling.
- Admin moderation.
- Email/SMS/push notification delivery.

## 3. Test Environment

### 3.1 Local Environment

| Component | Requirement |
| --- | --- |
| Frontend | Run from `Frontend/` with `npm install` then `npm start` or `ng serve`. |
| Backend | Run from `Backend/` with `npm install` then `npm run dev`. |
| Database | PostgreSQL database with all migrations applied. |
| Auth | Clerk application configured with email/password and OAuth providers as needed. |
| Supabase | Project configured for PostgreSQL, Storage bucket `user_uploads`, and Realtime on `messages` and `offers`. |
| Gemini | `GEMINI_API_KEY` configured for CV analysis tests. |

### 3.2 Required Test Users

Use at least two real Clerk test accounts:

| User | Purpose | Required Local Data |
| --- | --- | --- |
| Client A | Posts jobs, creates offers, favorites providers, reviews providers. | Completed profile with location and category. |
| Provider B | Appears in browse, receives offers, submits bids. | Completed profile with `available_today = true`, category, hourly rate, skills. |
| Optional Provider C | Used to test multiple bids and automatic rejection after bid acceptance. | Completed profile. |

### 3.3 Required Test Files

| File | Purpose |
| --- | --- |
| Valid image under 5 MB | Profile picture, cover image, and portfolio upload tests. |
| Invalid image file type | Image validation failure tests. |
| Oversized image over 5 MB | Image size validation failure tests. |
| Valid PDF CV under 2 MB | CV PDF analysis test. |
| Valid DOCX CV under 2 MB | CV DOCX extraction/analysis test. |
| Unsupported CV file, such as TXT | CV file type rejection test. |
| Oversized CV over 2 MB | CV size rejection test. |

## 4. Automation Status And Recommended Commands

### 4.1 Current Commands

| Area | Command | Expected Result |
| --- | --- | --- |
| Frontend install | `cd Frontend && npm install` | Dependencies install successfully. |
| Frontend build | `cd Frontend && npm run build` | Angular production build succeeds. |
| Frontend tests | `cd Frontend && npm test` | Runs Angular unit-test builder. At present, no spec files were found in source inspection. |
| Backend install | `cd Backend && npm install` | Dependencies install successfully. |
| Backend build | `cd Backend && npm run build` | TypeScript build succeeds. |
| Backend dev | `cd Backend && npm run dev` | Server starts and connects to PostgreSQL. |

### 4.2 Recommended Automation Additions

| Priority | Recommendation |
| --- | --- |
| High | Add backend integration tests using Supertest against Express `app`. |
| High | Add backend unit tests for offer transitions, bid acceptance, CV validation, and auth ownership checks. |
| High | Add frontend unit tests for guards, auth interceptor, filter service, location service, and API services. |
| Medium | Add component tests for browse filters, booking actions, job forms, CV analyzer, and chat input. |
| Medium | Add Playwright E2E flows for signup, browse, chat, direct booking, job bidding, and CV analysis. |
| Medium | Add CI pipeline to run backend build, frontend build, frontend tests, and backend tests. |
| Low | Add visual regression tests for key responsive screens. |

## 5. Backend API Test Cases

For protected API tests, include a valid Clerk JWT:

```text
Authorization: Bearer <valid_clerk_session_token>
```

### 5.1 Health And Auth

| ID | Test | Preconditions | Steps | Expected Output |
| --- | --- | --- | --- | --- |
| BE-TC-001 | Health check | Backend running | `GET /api/health` | HTTP 200; body contains `status: "ok"` and ISO `timestamp`. |
| BE-TC-002 | Protected endpoint without token | No auth header | `GET /api/profile/me` | HTTP 401; JSON failure message. |
| BE-TC-003 | Protected endpoint with valid token | Signed-in Clerk user | `GET /api/profile/me` | HTTP 200; `{ success: true, user: { id, email, ... } }`; local `users` row exists. |
| BE-TC-004 | Invalid token | Invalid bearer token | `GET /api/profile/me` | HTTP 401; request rejected. |

Example expected success:

```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "skills": [],
    "languages": [],
    "portfolio": [],
    "reviews": []
  }
}
```

### 5.2 Profile

| ID | Test | Preconditions | Steps | Expected Output |
| --- | --- | --- | --- | --- |
| BE-TC-010 | Update profile core fields | Authenticated user | `PUT /api/profile/update-profile` with valid profile fields | HTTP 200; returned user contains updated fields. |
| BE-TC-011 | Update skills | Authenticated user | Send `skills: ["Cleaning", "Cooking"]` | HTTP 200; returned `skills` array contains both values sorted by query order/name. |
| BE-TC-012 | Replace skills | User already has skills | Send `skills: ["Photography"]` | HTTP 200; old skill links removed; response contains only Photography. |
| BE-TC-013 | Update languages | Authenticated user | Send `languages: ["Arabic", "English"]` | HTTP 200; response contains languages. |
| BE-TC-014 | Get profile by ID exists | Known user ID | `GET /api/profile/:id` | HTTP 200; full profile returned. |
| BE-TC-015 | Get profile by ID missing | Unknown UUID | `GET /api/profile/:id` | HTTP 404; `{ success: false, message: "User not found" }`. |
| BE-TC-016 | Upload profile picture valid | Valid image under 5 MB | Multipart `POST /api/profile/upload-profile-picture` field `image` | HTTP 200; `user.profileImage` is data URL. |
| BE-TC-017 | Upload profile picture missing file | Authenticated user | Multipart request with no file | HTTP 400; message `No file uploaded`. |
| BE-TC-018 | Upload portfolio valid | Valid images under 5 MB | Multipart `POST /api/profile/upload-portfolio` field `images` | HTTP 200; `images` array contains public URLs and sort order. |

Example profile update payload:

```json
{
  "first_name": "Client",
  "last_name": "A",
  "title": "Home Services Client",
  "category": "House Cleaning",
  "location": "Achrafieh, Beirut",
  "about_me": "Testing profile",
  "hourly_rate": 20,
  "available_today": true,
  "skills": ["Organization", "Deep Cleaning"],
  "languages": ["Arabic", "English"]
}
```

### 5.3 Browse And Favorites

| ID | Test | Preconditions | Steps | Expected Output |
| --- | --- | --- | --- | --- |
| BE-TC-030 | Browse users | Provider B has `available_today = true` | Client A calls `GET /api/users` | HTTP 200; Provider B appears; Client A does not appear. |
| BE-TC-031 | Browse excludes unavailable users | Provider C has `available_today = false` | Client A calls `GET /api/users` | Provider C does not appear. |
| BE-TC-032 | Add favorite | Provider B exists | Client A calls `POST /api/favorites/users/:providerBId` | HTTP 201 or 200; `{ success: true, isFavorited: true }`. |
| BE-TC-033 | Add duplicate favorite | Favorite already exists | Repeat add favorite | HTTP 200; `added: false`; no duplicate row. |
| BE-TC-034 | Cannot favorite self | Client A ID as target | `POST /api/favorites/users/:clientAId` | HTTP 400; message says cannot favorite yourself. |
| BE-TC-035 | List favorites | Favorite exists | `GET /api/favorites/users` | HTTP 200; Provider B returned with `isFavorited: true`. |
| BE-TC-036 | Remove favorite | Favorite exists | `DELETE /api/favorites/users/:providerBId` | HTTP 200; `{ removed: true, isFavorited: false }`. |

### 5.4 Reviews

| ID | Test | Preconditions | Steps | Expected Output |
| --- | --- | --- | --- | --- |
| BE-TC-040 | Create review | Client A and Provider B exist | Client A posts rating 5 for Provider B | HTTP 201; review returned; Provider B rating updates. |
| BE-TC-041 | Update existing review | Review already exists | Client A posts rating 4 for Provider B | HTTP 201; same reviewer/reviewed pair updated; no duplicate pair. |
| BE-TC-042 | Invalid rating low | Authenticated user | Post rating 0 | HTTP 400; rating validation message. |
| BE-TC-043 | Invalid rating high | Authenticated user | Post rating 6 | HTTP 400; rating validation message. |
| BE-TC-044 | Cannot review self | Client A target is Client A | Post review | HTTP 400; message says cannot review yourself. |
| BE-TC-045 | Get reviews | Provider B has reviews | `GET /api/reviews/user/:providerBId` | HTTP 200; reviews include reviewer name/image fields. |

Expected review success:

```json
{
  "success": true,
  "review": {
    "reviewerId": "client-a-uuid",
    "reviewedUserId": "provider-b-uuid",
    "rating": 5,
    "comment": "Great service."
  }
}
```

### 5.5 Conversations And Messages

| ID | Test | Preconditions | Steps | Expected Output |
| --- | --- | --- | --- | --- |
| BE-TC-050 | Create conversation | Client A and Provider B exist | Client A posts `{ "otherUserId": providerBId }` to `/api/messages/conversations` | HTTP 200; conversation ID returned. |
| BE-TC-051 | Create duplicate conversation | Conversation already exists | Repeat create conversation | HTTP 200; same pair reused, no duplicate conversation pair. |
| BE-TC-052 | Cannot create self conversation | Client A target is Client A | Post self ID | HTTP 400; invalid recipient. |
| BE-TC-053 | List conversations | Conversation exists | `GET /api/messages/conversations` | HTTP 200; conversation includes otherUser and last message fields. |
| BE-TC-054 | Send valid message | Client A belongs to conversation | Post `{ "content": "Hello" }` | HTTP 201; message returned with content and sender ID. |
| BE-TC-055 | Reject blank message | Conversation exists | Post whitespace content | HTTP 400; content required. |
| BE-TC-056 | Reject outsider message read | Third user not in conversation | Third user `GET /api/messages/conversations/:id` | HTTP 403; not part of conversation. |

Expected message success:

```json
{
  "success": true,
  "message": {
    "id": 1,
    "conversation_id": 1,
    "sender_id": "client-a-uuid",
    "content": "Hello",
    "created_at": "2026-05-01T00:00:00.000Z"
  }
}
```

### 5.6 Offers And Bookings

| ID | Test | Preconditions | Steps | Expected Output |
| --- | --- | --- | --- | --- |
| BE-TC-060 | Create offer | Conversation exists between Client A and Provider B | Client A posts offer with title and hourlyRate | HTTP 200; pending offer returned; linked message exists. |
| BE-TC-061 | Missing offer fields | Conversation exists | Omit title or hourlyRate | HTTP 400; missing required fields. |
| BE-TC-062 | Invalid hourly rate | Conversation exists | Send `hourlyRate: 0` or negative | HTTP 400; positive number message. |
| BE-TC-063 | Outsider cannot create offer | Third user not in conversation | Third user posts offer into conversation | HTTP 403. |
| BE-TC-064 | Recipient accepts offer | Pending offer exists | Provider B patches status `accepted` | HTTP 200; status accepted; status message inserted. |
| BE-TC-065 | Sender cannot accept own offer | Pending offer from Client A | Client A patches status `accepted` | HTTP 403; only recipient can update. |
| BE-TC-066 | Invalid transition | Accepted offer exists | Patch status `declined` | HTTP 400; cannot transition. |
| BE-TC-067 | Sender cancels pending offer | Pending offer exists | Client A patches `/cancel` | HTTP 200; status cancelled. |
| BE-TC-068 | Cannot cancel non-pending offer | Accepted offer exists | Sender patches `/cancel` | HTTP 400. |
| BE-TC-069 | Get bookings | Offers exist | `GET /api/offers/my-bookings` | HTTP 200; bookings include `direction`, sender, recipient. |

Expected offer creation output:

```json
{
  "success": true,
  "offer": {
    "id": 1,
    "conversationId": 1,
    "senderId": "client-a-uuid",
    "recipientId": "provider-b-uuid",
    "title": "Deep cleaning",
    "hourlyRate": 25,
    "status": "pending"
  }
}
```

### 5.7 Jobs And Bids

| ID | Test | Preconditions | Steps | Expected Output |
| --- | --- | --- | --- | --- |
| BE-TC-080 | Create job | Client A signed in | Post title, description, category, location, optional budget | HTTP 201; job returned with `is_owner: true`. |
| BE-TC-081 | Create job missing fields | Client A signed in | Omit description | HTTP 400; missing required fields. |
| BE-TC-082 | Browse jobs | Open job exists | Provider B calls `GET /api/jobs` | HTTP 200; open job returned. |
| BE-TC-083 | Filter jobs by category | Jobs in multiple categories | `GET /api/jobs?category=House Cleaning` | HTTP 200; only matching category returned. |
| BE-TC-084 | Submit bid | Provider B not owner; job open | Post proposal and proposed_rate | HTTP 201; pending bid returned. |
| BE-TC-085 | Owner cannot bid | Client A owns job | Client A posts bid | HTTP 400; cannot bid on own job. |
| BE-TC-086 | Missing bid fields | Provider B | Omit proposal or rate | HTTP 400. |
| BE-TC-087 | Owner views bids | Client A owns job | `GET /api/jobs/:id/bids` | HTTP 200; bid list includes freelancer fields. |
| BE-TC-088 | Non-owner cannot view bids | Provider B not owner | `GET /api/jobs/:id/bids` | HTTP 403. |
| BE-TC-089 | Owner accepts bid | Pending bids exist | Client A patches selected bid accepted | HTTP 200; selected accepted, other pending bids rejected, job in_progress, conversationId returned. |
| BE-TC-090 | Owner rejects bid | Pending bid exists | Client A patches selected bid rejected | HTTP 200; bid rejected. |
| BE-TC-091 | Cannot update already handled bid | Bid accepted/rejected | Patch again | HTTP 400; already status message. |

Expected accept-bid output:

```json
{
  "success": true,
  "status": "accepted",
  "conversationId": 1
}
```

### 5.8 CV Analysis

| ID | Test | Preconditions | Steps | Expected Output |
| --- | --- | --- | --- | --- |
| BE-TC-100 | Analyze valid PDF | Gemini key configured | Multipart `POST /api/cv/analyze` with PDF field `cv` | HTTP 201; structured analysis with score and sections. |
| BE-TC-101 | Analyze valid DOCX | Gemini key configured | Multipart DOCX field `cv` | HTTP 201; structured analysis saved. |
| BE-TC-102 | Duplicate file cache | Same file already analyzed by same user | Re-upload same file | HTTP 200; `cached: true`; same analysis ID or cached row ID returned. |
| BE-TC-103 | Missing CV file | Authenticated user | Multipart request with no `cv` field | HTTP 400; no CV uploaded message. |
| BE-TC-104 | Unsupported CV type | TXT file | Upload as `cv` | HTTP 400; unsupported file type. |
| BE-TC-105 | Oversized CV | File over 2 MB | Upload as `cv` | HTTP 400 or multer file-size error response. |
| BE-TC-106 | CV history default | User has analyses | `GET /api/cv/my-analyses` | HTTP 200; up to 10 analyses. |
| BE-TC-107 | CV history limit clamp | User has analyses | `GET /api/cv/my-analyses?limit=100` | HTTP 200; no more than 30 analyses. |

Expected CV analysis output shape:

```json
{
  "success": true,
  "cached": false,
  "analysisId": 1,
  "overallScore": 78,
  "analysis": {
    "overallScore": 78,
    "summary": "Clear summary text",
    "sectionScores": {
      "structure": 80,
      "impact": 70,
      "skillsAlignment": 75,
      "atsReadability": 85,
      "clarity": 80
    },
    "strengths": ["Strength"],
    "issues": ["Issue"],
    "suggestions": ["Suggestion"],
    "improvedBullets": ["Improved bullet"]
  }
}
```

## 6. Frontend Manual Test Cases

### 6.1 Auth And Routing

| ID | Test | Steps | Expected Result |
| --- | --- | --- | --- |
| FE-TC-001 | Guest redirected from protected route | In logged-out browser, open `/browse` | User is redirected to `/sign-in`. |
| FE-TC-002 | Signed-in user blocked from guest route | Sign in, open `/sign-in` | User is redirected to `/browse`. |
| FE-TC-003 | Email/password sign-up | Open `/sign-up`, enter valid email/password/name, verify email if prompted | User reaches `/setup-profile`. |
| FE-TC-004 | Email/password sign-in | Open `/sign-in`, enter identifier, then password | User reaches `/browse`. |
| FE-TC-005 | OAuth sign-in | Click Google/GitHub/Microsoft auth | SSO callback completes; existing users reach `/browse`, new users reach `/setup-profile`. |
| FE-TC-006 | Password reset | Open forgot password, request reset code, enter code/new password | User signs in and reaches `/browse`. |
| FE-TC-007 | Logout | Use top-bar logout | Clerk session ends; cached profile image/location cleared; user reaches `/sign-in`. |

### 6.2 Profile Setup And Profile Management

| ID | Test | Steps | Expected Result |
| --- | --- | --- | --- |
| FE-TC-010 | Required setup validation | Open setup profile and submit empty required fields | Required fields are marked; no API call succeeds. |
| FE-TC-011 | Complete setup without images | Fill valid fields, submit | Success snackbar appears; user navigates to `/home`; profile data persists. |
| FE-TC-012 | Complete setup with portfolio | Add valid image files, submit | Profile saves; portfolio uploads; profile portfolio shows images. |
| FE-TC-013 | Edit own profile | Open `/my-profile`, edit profile dialog, change title/skills | Dialog closes; profile reloads with updated values. |
| FE-TC-014 | Toggle availability | Open `/my-profile`, toggle availability | Availability changes after API success. |
| FE-TC-015 | Upload profile picture valid | Choose valid image under 5 MB | Avatar updates and persists after reload. |
| FE-TC-016 | Upload invalid profile picture type | Choose unsupported type | Error message shown; no upload occurs. |
| FE-TC-017 | Upload cover image valid | Choose valid cover image | Cover image updates after refresh. |
| FE-TC-018 | Upload portfolio from profile | Use owner portfolio upload | New portfolio images append to list. |

### 6.3 Browse And Favorites

| ID | Test | Steps | Expected Result |
| --- | --- | --- | --- |
| FE-TC-030 | Browse loads providers | Sign in and open `/browse` | Loading ends; available providers appear. |
| FE-TC-031 | Search providers | Type a provider name/title/skill in top search | List filters after debounce. |
| FE-TC-032 | Category filter | Select a category in sidebar | Only matching category cards remain. |
| FE-TC-033 | Price filter | Set min/max price | Only providers within hourly range remain. |
| FE-TC-034 | Rating filter | Select minimum star rating | Only providers at or above rating remain. |
| FE-TC-035 | Location filter | Select location | Only matching providers remain. |
| FE-TC-036 | Mobile filters | On mobile width, open filter drawer | Drawer opens; body scroll locks; close restores scroll. |
| FE-TC-037 | Favorite provider | Click heart/favorite on a card | Favorite state toggles after API success. |
| FE-TC-038 | Favorites dialog | Open own profile, open favorites | Dialog shows saved providers; removing a favorite removes card. |

### 6.4 Profile And Reviews

| ID | Test | Steps | Expected Result |
| --- | --- | --- | --- |
| FE-TC-040 | View provider profile | Click a browse user card | `/profile/:id` shows banner, about, skills, portfolio, reviews, sidebar. |
| FE-TC-041 | Start chat from profile | On another user's profile, click contact/get in touch | Conversation is created and user navigates to messages. |
| FE-TC-042 | Review requires rating | Open review modal and submit with no stars | Error message asks for rating. |
| FE-TC-043 | Submit review | Select rating, optional comment, submit | Modal closes; profile reloads; new review appears. |
| FE-TC-044 | Comment max length | Enter more than 500 characters | Form validation prevents submit or shows invalid input. |

### 6.5 Chat And Direct Offers

| ID | Test | Steps | Expected Result |
| --- | --- | --- | --- |
| FE-TC-050 | Load conversations | Open `/messages` | Conversation list loads or empty state appears. |
| FE-TC-051 | Select conversation | Click conversation | Messages load; active header shows other user. |
| FE-TC-052 | Send message | Enter text and press send | Message appears immediately, then persists after API success. |
| FE-TC-053 | Blank message blocked | Try sending spaces only | Nothing is sent. |
| FE-TC-054 | Realtime message | Open Client A and Provider B in two browsers; send message from one | Other browser receives message without reload. |
| FE-TC-055 | Emoji insertion | Open emoji picker and choose emoji | Emoji is inserted into input. |
| FE-TC-056 | Create offer validation | Open offer modal with blank title or zero rate | Submit blocked. |
| FE-TC-057 | Create offer success | Submit valid offer | Modal closes; offer message appears in chat. |
| FE-TC-058 | Accept offer in chat | Recipient clicks accept | Offer status becomes Accepted for both users. |
| FE-TC-059 | Decline offer in chat | Recipient clicks decline | Offer status becomes Declined for both users. |

### 6.6 Booking History

| ID | Test | Steps | Expected Result |
| --- | --- | --- | --- |
| FE-TC-060 | Load bookings | Open `/bookings` | Active bookings display with stats. |
| FE-TC-061 | Direction filter | Toggle `i-booked` and `booked-me` | Bookings list and counts update. |
| FE-TC-062 | Status tabs | Switch active/past tabs | Active shows pending/accepted/in_progress; past shows completed/cancelled/declined. |
| FE-TC-063 | Cancel pending sent booking | As sender, cancel pending offer | Booking moves to cancelled/past. |
| FE-TC-064 | Accept received booking | As recipient, accept pending offer | Booking becomes accepted. |
| FE-TC-065 | Start progress | As recipient of accepted offer, click start progress | Booking becomes in_progress. |
| FE-TC-066 | Mark done | As recipient of in-progress offer, confirm done | Booking becomes completed. |
| FE-TC-067 | Open chat from booking | Click message/open chat action | `/messages?conversationId=<id>` opens and auto-selects conversation if loaded. |

### 6.7 Jobs And Bids

| ID | Test | Steps | Expected Result |
| --- | --- | --- | --- |
| FE-TC-080 | Browse jobs | Open `/jobs` | Open jobs not owned by current user appear. |
| FE-TC-081 | Job filters | Select category/location filters | Job list reloads with matching jobs. |
| FE-TC-082 | Post job validation | Open post modal and submit missing fields | Error message shown. |
| FE-TC-083 | Post job success | Submit valid job | Modal closes; job appears in posted jobs area and not as bid-able to owner. |
| FE-TC-084 | Submit bid validation | Open bid modal and submit missing proposal/rate | Error message shown. |
| FE-TC-085 | Submit bid success | Provider submits valid bid | Modal closes; bid stored. |
| FE-TC-086 | Owner views bids | Owner opens job details | Bids list appears with freelancer details. |
| FE-TC-087 | Non-owner job details | Non-owner opens job details | Job details show; bid management hidden. |
| FE-TC-088 | Reject bid | Owner rejects pending bid | Bid status changes to Rejected. |
| FE-TC-089 | Accept bid | Owner accepts pending bid | Selected bid Accepted; other pending bids Rejected; user navigates to chat. |
| FE-TC-090 | Message bidder | Owner clicks message bidder | Conversation opens in messages. |

### 6.8 CV Analyzer

| ID | Test | Steps | Expected Result |
| --- | --- | --- | --- |
| FE-TC-100 | Load CV history | Open `/cv-analyzer` | History tab/list loads previous analyses or empty state. |
| FE-TC-101 | Analyze without file | Click analyze with no file | Error message says choose PDF or DOCX first. |
| FE-TC-102 | Analyze valid PDF | Select valid PDF, optional target role/job description, click analyze | Loading state appears; result displays score and feedback. |
| FE-TC-103 | Analyze valid DOCX | Select valid DOCX, click analyze | Result displays score and feedback. |
| FE-TC-104 | Backend validation error | Upload unsupported file type | Error message from backend displayed. |
| FE-TC-105 | Frontend timeout | Simulate backend taking over 120 seconds | Timeout message shown and loading stops. |
| FE-TC-106 | Cached result | Upload same file twice | Second result shows success and should be returned faster with cached backend response. |

## 7. End-To-End Workflow Tests

### E2E-TC-001: Direct Booking Flow

Preconditions:

- Client A and Provider B can sign in.
- Provider B profile has hourly rate and `available_today = true`.

Steps:

1. Client A signs in.
2. Client A opens `/browse`.
3. Client A filters or searches for Provider B.
4. Client A opens Provider B profile.
5. Client A starts chat.
6. Client A sends a text message.
7. Client A creates an offer.
8. Provider B signs in in another browser.
9. Provider B opens messages or bookings.
10. Provider B accepts the offer.
11. Provider B starts progress.
12. Provider B marks done.

Expected result:

- Conversation exists for both users.
- Messages are visible for both users.
- Offer appears in chat and booking history.
- Booking transitions `pending -> accepted -> in_progress -> completed`.
- Completed booking appears under past bookings.

### E2E-TC-002: Job Posting And Bid Acceptance Flow

Preconditions:

- Client A and Provider B can sign in.
- Provider B does not own Client A's job.

Steps:

1. Client A signs in.
2. Client A opens `/jobs`.
3. Client A posts a job.
4. Provider B signs in.
5. Provider B opens `/jobs`.
6. Provider B submits a bid.
7. Client A opens the posted job details.
8. Client A accepts Provider B's bid.

Expected result:

- Job is created as `open`.
- Bid is created as `pending`.
- Accepting bid sets bid to `accepted`.
- Job becomes `in_progress`.
- Other pending bids are rejected if present.
- Conversation is created or reused.
- Accepted booking offer appears in booking history.
- Client A is navigated to messages with the returned conversation ID.

### E2E-TC-003: Review And Rating Flow

Preconditions:

- Client A and Provider B exist.
- Client A is not Provider B.

Steps:

1. Client A signs in.
2. Client A opens Provider B profile.
3. Client A submits a 5-star review with a comment.
4. Client A changes review to 4 stars.

Expected result:

- Review appears on Provider B profile.
- Second submission updates the existing review rather than creating a duplicate.
- Provider B rating and review count reflect database trigger calculations.

### E2E-TC-004: CV Analysis Flow

Preconditions:

- Gemini API key configured.
- Signed-in user has a valid PDF or DOCX CV.

Steps:

1. User opens `/cv-analyzer`.
2. User uploads CV with target role.
3. User waits for analysis.
4. User opens history.
5. User uploads same CV again.

Expected result:

- First upload returns new analysis with structured feedback.
- Analysis appears in history.
- Second upload returns cached result.

## 8. Non-Functional Test Cases

| ID | Test | Steps | Expected Result |
| --- | --- | --- | --- |
| NFR-TC-001 | Frontend build budget | Run `npm run build` in `Frontend/` | Build succeeds or fails clearly if Angular budget exceeded. |
| NFR-TC-002 | Backend TypeScript build | Run `npm run build` in `Backend/` | `tsc` completes without type errors. |
| NFR-TC-003 | API unauthorized access | Try protected APIs without token | All protected resources return 401. |
| NFR-TC-004 | Conversation authorization | Third user tries to read conversation | HTTP 403. |
| NFR-TC-005 | File size validation | Upload files over configured max sizes | Request rejected, no data stored. |
| NFR-TC-006 | CV timeout handling | Simulate slow Gemini response | Backend returns timeout or frontend shows timeout; no endless spinner. |
| NFR-TC-007 | Mobile browse | Test `/browse` at 375px width | No horizontal overflow; filters usable. |
| NFR-TC-008 | Mobile chat keyboard | Test messages on mobile browser | Input remains reachable when keyboard opens. |
| NFR-TC-009 | Realtime subscription cleanup | Navigate between conversations and away from messages | No duplicate message rendering; no growing subscriptions. |
| NFR-TC-010 | CORS | Call backend from unlisted origin | Browser blocks or backend rejects according to CORS config. |

## 9. Regression Checklist

Run this checklist before release:

- Authentication works for email/password and configured OAuth providers.
- New users can complete or skip profile setup.
- Existing users can fetch `/api/profile/me`.
- Browse list excludes current user and unavailable providers.
- Browse filters work together.
- Favorites persist after reload.
- Profile owner can edit profile, upload avatar, upload cover, upload portfolio, and toggle availability.
- Non-owner can start chat and submit review.
- Conversations can be created and reused.
- Messages persist and appear through realtime events.
- Direct offers create linked chat messages.
- Offer statuses obey allowed transitions.
- Booking history separates sent/received and active/past.
- Jobs can be posted, filtered, and opened.
- Providers can bid on jobs they do not own.
- Owners can view, accept, and reject bids.
- Accepting a bid creates/reuses conversation and creates a booking.
- CV analyzer supports PDF and DOCX and rejects invalid files.
- CV history loads and duplicate upload returns cached result.
- Frontend production build succeeds.
- Backend TypeScript build succeeds.

## 10. Suggested Automated Test Structure

### 10.1 Backend

Recommended directories:

```text
Backend/
  src/
  tests/
    setup.ts
    auth.test.ts
    profile.test.ts
    favorites.test.ts
    messages.test.ts
    offers.test.ts
    jobs.test.ts
    reviews.test.ts
    cv.test.ts
```

Recommended backend test categories:

- Unit test pure helpers: CV normalization, status transition helpers, file type checks.
- Integration test Express routes with Supertest.
- Use a test database or transaction rollback per test.
- Mock Clerk user lookup for repeatable auth tests.
- Mock Gemini calls for CV tests.
- Mock Supabase Storage for portfolio upload tests.

### 10.2 Frontend

Recommended directories:

```text
Frontend/src/app/
  services/*.spec.ts
  guards/*.spec.ts
  interceptors/*.spec.ts
  pages/**/*.spec.ts
  components/**/*.spec.ts
```

Recommended frontend test categories:

- Guards redirect correctly for signed-in and signed-out states.
- Interceptor attaches bearer tokens when available.
- FilterService combines filters correctly.
- LocationService maps coordinates and clears location on logout.
- BrowseComponent filters loaded users correctly.
- BookingCardComponent exposes correct actions per direction/status.
- Job modals validate required fields before API calls.
- CvAnalyzerPageComponent handles success, timeout, and backend errors.
- ChatService manages active/inbox subscriptions and emits messages.

### 10.3 E2E

Recommended Playwright specs:

```text
e2e/
  auth.spec.ts
  profile.spec.ts
  browse-favorites.spec.ts
  chat-offers.spec.ts
  jobs-bids.spec.ts
  cv-analyzer.spec.ts
```

Use seeded test users and stable test data. Avoid depending on real Gemini in E2E; prefer a staging backend with mockable AI responses or a test flag.

## 11. Defect Reporting Template

Use this format when a test fails:

```text
Title:
Environment:
Build/commit:
User account:
Preconditions:
Steps to reproduce:
Expected result:
Actual result:
Screenshots/logs:
API request/response:
Severity:
Suspected area:
```

Severity guide:

| Severity | Meaning |
| --- | --- |
| Critical | Data leak, auth bypass, app unusable, production-blocking crash. |
| High | Core workflow blocked, wrong booking/job status, failed payment-like flow if added later. |
| Medium | Important feature degraded with workaround. |
| Low | Minor UI issue, copy issue, non-blocking visual defect. |

## 12. Angular Frontend Testing

The frontend is built with **Angular 21** using standalone components. The default test runner is **Karma + Jasmine**, configured via `angular.json`. Tests live alongside source files as `*.spec.ts` files and are run with:

```bash
cd Frontend && npm test
```

### 12.1 Framework and Setup

Each spec file bootstraps an Angular `TestBed` to compile the component or service under test. Standalone components must declare their own imports inside `TestBed.configureTestingModule`.

```typescript
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        AuthGuard,
      ],
    });
  });
});
```

### 12.2 Auth Guard

The `AuthGuard` waits for `window.Clerk` to report a session and redirects unauthenticated users to `/sign-in`.

```typescript
// auth.guard.spec.ts
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), AuthGuard],
    });
    guard = TestBed.inject(AuthGuard);
    router = TestBed.inject(Router);
  });

  it('allows navigation when Clerk session exists', async () => {
    (window as any).Clerk = { user: { id: 'user_123' } };
    const result = await TestBed.runInInjectionContext(() => guard.canActivate());
    expect(result).toBeTrue();
  });

  it('redirects to /sign-in when no session', async () => {
    (window as any).Clerk = { user: null };
    const spy = spyOn(router, 'navigate');
    const result = await TestBed.runInInjectionContext(() => guard.canActivate());
    expect(result).toBeFalse();
    expect(spy).toHaveBeenCalledWith(['/sign-in']);
  });
});
```

### 12.3 Guest Guard

The `GuestGuard` prevents authenticated users from visiting `/sign-in` or `/sign-up`.

```typescript
// guest.guard.spec.ts
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { GuestGuard } from './guest.guard';

describe('GuestGuard', () => {
  let guard: GuestGuard;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), GuestGuard],
    });
    guard = TestBed.inject(GuestGuard);
    router = TestBed.inject(Router);
  });

  it('blocks signed-in user and redirects to /browse', async () => {
    (window as any).Clerk = { user: { id: 'user_123' } };
    const spy = spyOn(router, 'navigate');
    const result = await TestBed.runInInjectionContext(() => guard.canActivate());
    expect(result).toBeFalse();
    expect(spy).toHaveBeenCalledWith(['/browse']);
  });

  it('allows access when no session', async () => {
    (window as any).Clerk = { user: null };
    const result = await TestBed.runInInjectionContext(() => guard.canActivate());
    expect(result).toBeTrue();
  });
});
```

### 12.4 Auth HTTP Interceptor

The `AuthInterceptor` attaches a Clerk Bearer token to every outgoing request.

```typescript
// auth.interceptor.spec.ts
import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { authInterceptor } from './auth.interceptor';

describe('AuthInterceptor', () => {
  let http: HttpClient;
  let controller: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => controller.verify());

  it('attaches Bearer token when Clerk session exists', async () => {
    (window as any).Clerk = {
      session: { getToken: async () => 'test-token-abc' },
    };

    http.get('/api/profile/me').subscribe();

    const req = controller.expectOne('/api/profile/me');
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-token-abc');
    req.flush({});
  });

  it('sends request without Authorization when no session', async () => {
    (window as any).Clerk = { session: null };

    http.get('/api/profile/me').subscribe();

    const req = controller.expectOne('/api/profile/me');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });
});
```

### 12.5 Auth Component

The `AuthComponent` runs a step-based state machine. Key states to cover: `signin-identifier`, `signin-password`, `second-factor`, `otp`, `email-verify`, and `missing-fields`.

```typescript
// auth.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AuthComponent } from './auth';

describe('AuthComponent', () => {
  let fixture: ComponentFixture<AuthComponent>;
  let component: AuthComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthComponent, NoopAnimationsModule],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthComponent);
    component = fixture.componentInstance;
  });

  it('starts on signin-identifier step for /sign-in route', async () => {
    await component.ngOnInit();
    expect(component['step']).toBe('signin-identifier');
  });

  it('verifySignInOtp calls attemptFirstFactor on otp step', async () => {
    const mockResult = { status: 'complete', createdSessionId: 'sess_1' };
    const mockClerk = {
      client: {
        signIn: { attemptFirstFactor: jasmine.createSpy().and.resolveTo(mockResult) },
      },
      setActive: jasmine.createSpy().and.resolveTo(undefined),
    };
    (window as any).Clerk = mockClerk;
    component['step'] = 'otp';
    component['otpCode'] = '123456';

    await component.verifySignInOtp();

    expect(mockClerk.client.signIn.attemptFirstFactor).toHaveBeenCalledWith({
      strategy: 'email_code',
      code: '123456',
    });
    expect(mockClerk.setActive).toHaveBeenCalledWith({ session: 'sess_1' });
  });

  it('verifySignInOtp calls attemptSecondFactor on second-factor step', async () => {
    const mockResult = { status: 'complete', createdSessionId: 'sess_2' };
    const mockClerk = {
      client: {
        signIn: { attemptSecondFactor: jasmine.createSpy().and.resolveTo(mockResult) },
      },
      setActive: jasmine.createSpy().and.resolveTo(undefined),
    };
    (window as any).Clerk = mockClerk;
    component['step'] = 'second-factor';
    component['otpCode'] = '654321';

    await component.verifySignInOtp();

    expect(mockClerk.client.signIn.attemptSecondFactor).toHaveBeenCalledWith({
      strategy: 'email_code',
      code: '654321',
    });
  });

  it('sets error message on invalid OTP code', async () => {
    (window as any).Clerk = {
      client: {
        signIn: {
          attemptFirstFactor: jasmine.createSpy().and.rejectWith(new Error('bad code')),
        },
      },
    };
    component['step'] = 'otp';
    component['otpCode'] = '000000';

    await component.verifySignInOtp();

    expect(component['error']).toBe('Invalid code. Please try again.');
  });
});
```

### 12.6 SSO Callback Component

```typescript
// sso-callback.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { SsoCallbackComponent } from './sso-callback';

describe('SsoCallbackComponent', () => {
  let fixture: ComponentFixture<SsoCallbackComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SsoCallbackComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(SsoCallbackComponent);
    router = TestBed.inject(Router);
  });

  it('navigates to /browse on successful existing-user OAuth', async () => {
    const spy = spyOn(router, 'navigate');
    (window as any).Clerk = {
      handleRedirectCallback: jasmine
        .createSpy()
        .and.resolveTo({ status: 'complete', createdSessionId: 'sess_1' }),
      setActive: jasmine.createSpy().and.resolveTo(undefined),
      client: { signUp: null },
    };

    fixture.componentInstance.ngOnInit();
    await fixture.whenStable();

    expect(spy).toHaveBeenCalledWith(['/browse']);
  });

  it('navigates to /setup-profile for new OAuth users', async () => {
    const spy = spyOn(router, 'navigate');
    (window as any).Clerk = {
      handleRedirectCallback: jasmine.createSpy().and.resolveTo({
        status: 'complete',
        createdSessionId: 'sess_new',
      }),
      setActive: jasmine.createSpy().and.resolveTo(undefined),
      client: {
        signUp: {
          create: jasmine.createSpy().and.resolveTo({
            status: 'complete',
            createdSessionId: 'sess_new',
          }),
        },
      },
    };

    fixture.componentInstance.ngOnInit();
    await fixture.whenStable();

    expect(spy).toHaveBeenCalledWith(['/setup-profile']);
  });
});
```

### 12.7 Running a Single Spec File

To run only one spec file during development without building the full test suite:

```bash
cd Frontend && npx ng test --include="**/auth.spec.ts" --watch=false
```

---

## 13. Current Testing Gaps

| Gap | Risk |
| --- | --- |
| No backend test script exists. | API regressions may be missed. |
| No frontend spec files were found. | Guard, service, and component regressions may be missed. |
| No E2E framework is configured. | Cross-page workflows such as booking and bid acceptance require manual testing. |
| External services are used directly in development. | Tests may be slow, flaky, or require real credentials without mocks. |
| Realtime behavior has no automated coverage. | Duplicate subscriptions or missed events may regress. |
| CV analysis depends on Gemini responses. | Output shape and timeout behavior should be mocked in automated tests. |
