# Frontend Requirements

## 1. Purpose

This document describes the frontend requirements for Wazefne as implemented in the current Angular codebase. It includes deduced user requirements, system requirements, route behavior, functional requirements, non-functional requirements, UI validation rules, service dependencies, and known implementation notes.

Wazefne is a service marketplace for Lebanon where users can authenticate, create service profiles, browse available providers, save favorites, chat, create booking offers, manage bookings, post jobs, bid on jobs, review providers, and analyze CVs.

## 2. Scope

The frontend provides:

- Angular standalone application pages and components.
- Clerk-based authentication and OAuth flows.
- Auth route guards for protected and guest-only pages.
- Automatic bearer token attachment for backend API calls.
- Home page and navigation.
- Profile setup and profile management.
- Browse UI with search, category, price, rating, and location filters.
- Favorite provider interactions.
- Public profile views and owner profile view.
- Chat UI with Supabase Realtime subscriptions.
- Offer cards and direct booking offer actions.
- Booking history UI with active/past and direction filters.
- Job posting, job browsing, bidding, and bid management UI.
- CV analyzer upload, history, and AI feedback display.
- Responsive layouts for desktop and mobile.

The frontend does not currently provide:

- Admin UI.
- Payment UI.
- Calendar scheduling UI beyond placeholder actions.
- Push/email notification UI.
- Automated E2E configuration.
- Role-based account setup. Client/provider behavior is implicit based on action.

## 3. Technology Requirements

| Area | Requirement |
| --- | --- |
| Framework | Angular 21 standalone components. |
| Language | TypeScript 5.9. |
| UI toolkit | Angular Material where used, plus custom CSS components. |
| State management | Angular services with RxJS `BehaviorSubject`, `Subject`, and observables. |
| Auth | `ngx-clerk` and Clerk browser global. |
| API communication | Angular `HttpClient`. |
| Realtime | Supabase Realtime through `@supabase/supabase-js`. |
| Emoji input | `emoji-picker-element`. |
| Unit testing command | `ng test` through Angular CLI unit-test builder. |
| Build command | `npm run build` / `ng build`. |
| Dev server command | `npm start` / `ng serve`. |

## 4. Environment Requirements

The frontend environment object must provide:

| Variable | Required | Purpose |
| --- | --- | --- |
| `production` | Yes | Enables environment-specific behavior. |
| `frontendUrl` | Yes | Used as OAuth redirect base URL. |
| `apiUrl` | Yes | Backend base URL used by all API services. |
| `supabaseUrl` | Yes | Supabase project URL for realtime subscriptions. |
| `supabaseAnonKey` | Yes | Supabase anonymous key for frontend realtime client. |

Observed note: `App` currently initializes Clerk with a hard-coded publishable key in `src/app/app.ts`. A stronger deployment requirement is to centralize the publishable key in environment files.

## 5. Users And Roles

| Actor | Description |
| --- | --- |
| Guest | Can access sign-in, sign-up, SSO callback, and home. Protected app pages redirect to sign-in. |
| Authenticated User | Can browse providers, manage profile, chat, book, post jobs, bid, review, favorite, and analyze CVs. |
| Client | A signed-in user who books a provider directly or posts jobs. This is a behavior, not a hard role. |
| Service Provider | A signed-in user who publishes a profile, appears in browse when available, accepts bookings, and bids on jobs. This is a behavior, not a hard role. |
| Profile Owner | A user viewing `/my-profile`; can edit profile, upload images, toggle availability, and view favorites. |
| Conversation Participant | A user who belongs to a chat conversation and can send messages or booking offers. |
| Job Owner | A user who created a job and can view, accept, or reject bids. |
| Job Bidder | A user who submits proposals to jobs they do not own. |

## 6. Route And Access Requirements

| Route | Component | Access | Purpose |
| --- | --- | --- | --- |
| `/` | Redirect | Public | Redirects to `/sign-in`. |
| `/sign-in` | `AuthComponent` | Guest only | Sign in by email/username, password, OTP, or OAuth. |
| `/sign-up` | `AuthComponent` | Guest only | Register by email/password or OAuth. |
| `/sso-callback` | `SsoCallbackComponent` | Public | Complete OAuth redirect flow. |
| `/home` | `HomeComponent` | Public | Marketing/home entry page and navigation. |
| `/setup-profile` | `SetupProfileComponent` | Public route, internally verifies Clerk user | First-time profile setup after signup. |
| `/browse` | `BrowseComponent` | Authenticated | Browse available providers. |
| `/profile/:id` | `ProfilePageComponent` | Authenticated | View another user's profile. |
| `/my-profile` | `ProfilePageComponent` | Authenticated | View and manage own profile. |
| `/bookings` | `BookingsHistoryComponent` | Authenticated | Manage sent and received booking offers. |
| `/messages` | `MessagesComponent` | Authenticated | Chat and direct offer flow. |
| `/jobs` | `JobsComponent` | Authenticated | Browse jobs, post jobs, view own jobs. |
| `/jobs/:id` | `JobDetailsComponent` | Authenticated | View job details and manage bids where allowed. |
| `/cv-analyzer` | `CvAnalyzerPageComponent` | Authenticated | Upload CV, see AI analysis and history. |
| `/test` | `HomeHeroComponent` | Public | Development/test route for hero component. |
| `**` | Redirect | Public | Redirects unknown routes to `/home`. |

## 7. Authentication Requirements

| ID | Requirement |
| --- | --- |
| FE-AUTH-001 | The frontend must initialize Clerk when the root app starts. |
| FE-AUTH-002 | Guest-only routes must redirect authenticated users to `/browse`. |
| FE-AUTH-003 | Protected routes must wait for Clerk user state and redirect unauthenticated users to `/sign-in`. |
| FE-AUTH-004 | Outgoing HTTP requests must include `Authorization: Bearer <Clerk token>` when a Clerk session exists. |
| FE-AUTH-005 | The app must support email/username sign-in using an identifier-first flow. |
| FE-AUTH-006 | The app must support password sign-in for accounts with password factors. |
| FE-AUTH-007 | The app must support email code sign-in for OAuth accounts without passwords. |
| FE-AUTH-008 | The app must support second-factor email code verification when Clerk requires it. |
| FE-AUTH-009 | The app must support email/password sign-up. |
| FE-AUTH-010 | The app must support email verification after sign-up. |
| FE-AUTH-011 | The app must support OAuth sign-in through Google, GitHub, and Microsoft. |
| FE-AUTH-012 | OAuth callback must transfer new OAuth users into sign-up when Clerk marks the attempt transferable. |
| FE-AUTH-013 | OAuth users missing required fields, such as username, must be routed to complete missing fields. |
| FE-AUTH-014 | The app must support password reset through Clerk reset email code when available. |
| FE-AUTH-015 | Logout must sign out from Clerk, clear cached location, clear cached profile image, clear local DB user ID, and navigate to `/sign-in`. |
| FE-AUTH-016 | AuthService must fetch `/api/profile/me` after authentication to cache the PostgreSQL user ID and profile image. |

## 8. Functional Requirements

### 8.1 Home And Navigation

| ID | Requirement |
| --- | --- |
| FE-HOME-001 | The home page must show the app entry experience using shared top navigation and home sections. |
| FE-HOME-002 | The home page must detect whether the user is signed in and route calls to action accordingly. |
| FE-HOME-003 | Top navigation must show search only when the hosting page enables it. |
| FE-HOME-004 | Top navigation must expose links to browse, bookings, messages, profile, and login/logout states. |
| FE-HOME-005 | Mobile navigation must be collapsible and must close when navigation actions are taken. |
| FE-HOME-006 | Search input must debounce changes before updating global browse filter state. |

### 8.2 Profile Setup

| ID | Requirement |
| --- | --- |
| FE-SETUP-001 | After sign-up, users should be able to complete a profile with first name, last name, title, category, location, optional service description, optional about text, optional hourly rate, availability, skills, languages, and portfolio images. |
| FE-SETUP-002 | The setup page must wait up to 5 seconds for Clerk user data before redirecting to sign-in. |
| FE-SETUP-003 | First and last name should be prefilled from Clerk when available. |
| FE-SETUP-004 | Required fields must be validated before submission. |
| FE-SETUP-005 | Hourly rate must not be negative. |
| FE-SETUP-006 | Skills and languages must be added as chip-like arrays and prevent duplicates. |
| FE-SETUP-007 | Selected portfolio image files must show local previews before upload. |
| FE-SETUP-008 | Profile text fields must be saved before portfolio image upload. |
| FE-SETUP-009 | If profile save succeeds but portfolio upload fails, the user must be informed and still allowed to continue. |
| FE-SETUP-010 | Users may skip setup and go to `/home`. |

### 8.3 Browse Providers

| ID | Requirement |
| --- | --- |
| FE-BRW-001 | Browse must request users from `/api/users` through `ProfileService`. |
| FE-BRW-002 | Browse must show loading state while users are being fetched. |
| FE-BRW-003 | Browse must support category filtering. |
| FE-BRW-004 | Browse must support price minimum and maximum filtering. |
| FE-BRW-005 | Browse must support minimum rating filtering. |
| FE-BRW-006 | Browse must support location filtering, including detected location when available. |
| FE-BRW-007 | Browse must support search by provider full name, title, category, or skill. |
| FE-BRW-008 | Browse filters must be shared between the top search and sidebar using `FilterService`. |
| FE-BRW-009 | Browse must clear search text when entering the page to avoid stale search from previous visits. |
| FE-BRW-010 | Mobile filters must open and close as an overlay and prevent body scroll while open. |
| FE-BRW-011 | User cards must navigate to `/my-profile` when the card belongs to the current user and `/profile/:id` otherwise. |
| FE-BRW-012 | User cards must emit favorite toggle events without navigating the card. |

### 8.4 Favorites

| ID | Requirement |
| --- | --- |
| FE-FAV-001 | Users must be able to favorite and unfavorite providers from browse results. |
| FE-FAV-002 | Favorite state must update locally after a successful API response. |
| FE-FAV-003 | Profile owners must be able to open a favorites dialog from their profile. |
| FE-FAV-004 | The favorites dialog must load favorite users, show loading and error states, and allow removing favorites. |

### 8.5 Profile Viewing And Editing

| ID | Requirement |
| --- | --- |
| FE-PRF-001 | `/profile/:id` must load another user's profile by ID. |
| FE-PRF-002 | `/my-profile` must load the authenticated user's own profile. |
| FE-PRF-003 | Profile view must compose banner, about, skills/languages, portfolio, reviews, and sidebar sections. |
| FE-PRF-004 | Profile owner state must enable owner-only controls such as edit profile, favorites dialog, profile image upload, cover image upload, portfolio upload, and availability toggle. |
| FE-PRF-005 | The profile banner must display a cover image or fallback image. |
| FE-PRF-006 | The owner profile avatar must prefer locally cached profile image for immediate updates. |
| FE-PRF-007 | Profile image upload must validate image type and 5 MB maximum file size before sending. |
| FE-PRF-008 | Cover image upload must validate image type and 5 MB maximum file size before sending. |
| FE-PRF-009 | Availability toggle must call profile update and refresh parent profile data after success. |
| FE-PRF-010 | Edit profile dialog must allow updating name, title, location, about text, service description, hourly rate, category, skills, and languages. |
| FE-PRF-011 | Portfolio owner controls must allow uploading multiple images and appending returned images to current portfolio. |
| FE-PRF-012 | Public profile sidebar must allow starting a chat with the viewed user. |

### 8.6 Reviews

| ID | Requirement |
| --- | --- |
| FE-REV-001 | Profiles must display existing reviews. |
| FE-REV-002 | Authenticated users must be able to open a review modal for non-owner profiles. |
| FE-REV-003 | A review must require a selected star rating. |
| FE-REV-004 | Review comment length must be limited to 500 characters. |
| FE-REV-005 | Submitting a review must call `POST /api/reviews`. |
| FE-REV-006 | After a successful review, the profile must refresh so the new review/rating is visible. |
| FE-REV-007 | Review dates must be displayed in a readable date format. |

### 8.7 Conversations And Chat

| ID | Requirement |
| --- | --- |
| FE-MSG-001 | Messages page must load the authenticated user's conversations. |
| FE-MSG-002 | Messages page must subscribe to Supabase Realtime inserts for inbox conversations. |
| FE-MSG-003 | Selecting a conversation must load historical messages and subscribe to realtime inserts and offer updates for that conversation. |
| FE-MSG-004 | Active conversation subscription must be removed when switching conversations or leaving the page. |
| FE-MSG-005 | Inbox subscription must exclude the active conversation to avoid duplicate event handling. |
| FE-MSG-006 | New realtime messages must update active chat and conversation previews. |
| FE-MSG-007 | Message sending must optimistically show a pending message and replace it with the confirmed message after API success. |
| FE-MSG-008 | Failed message sends must remove the optimistic message. |
| FE-MSG-009 | Blank messages must not be sent. |
| FE-MSG-010 | Message input must support emoji picker insertion. |
| FE-MSG-011 | The chat layout must adjust to mobile visual viewport changes to reduce keyboard overlap. |
| FE-MSG-012 | Deep-link query parameter `conversationId` must auto-select a conversation when it exists in the user's conversation list. |

### 8.8 Direct Offers And Booking From Chat

| ID | Requirement |
| --- | --- |
| FE-OFR-001 | The active chat must allow the user to open a create-offer modal. |
| FE-OFR-002 | The offer modal must prefill proposed rate from the recipient's profile hourly rate when available. |
| FE-OFR-003 | Creating an offer must require non-empty job title and positive hourly rate. |
| FE-OFR-004 | Offer submission must call `POST /api/offers`. |
| FE-OFR-005 | Chat messages with linked offers must render as offer messages. |
| FE-OFR-006 | Offer cards must display status labels: Pending, Accepted, Declined, In Progress, Completed, or Cancelled. |
| FE-OFR-007 | Offer recipient actions must support accept and decline from chat. |
| FE-OFR-008 | Realtime offer status updates must update the matching message offer status in the active chat. |

### 8.9 Booking History

| ID | Requirement |
| --- | --- |
| FE-BKG-001 | Booking history must load all booking offers for the authenticated user. |
| FE-BKG-002 | Bookings must be filterable by direction: `i-booked` and `booked-me`. |
| FE-BKG-003 | Bookings must be filterable by status grouping: active and past. |
| FE-BKG-004 | Active bookings must include pending, accepted, and in-progress offers. |
| FE-BKG-005 | Past bookings must include completed, cancelled, and declined offers. |
| FE-BKG-006 | Booking statistics must show active count, completed count, and total earned/spend as currently computed from completed bookings. |
| FE-BKG-007 | Users who sent a pending booking must be able to cancel it. |
| FE-BKG-008 | Users who received a pending booking must be able to accept or decline it. |
| FE-BKG-009 | Users who received an accepted booking must be able to start progress. |
| FE-BKG-010 | Users who received an in-progress booking must be able to mark it done after confirmation. |
| FE-BKG-011 | Booking actions must update local booking status after API success. |
| FE-BKG-012 | Booking cards must allow opening the related chat conversation. |

### 8.10 Jobs And Bids

| ID | Requirement |
| --- | --- |
| FE-JOB-001 | Jobs page must let users browse open jobs. |
| FE-JOB-002 | Jobs page must exclude the user's own jobs from the bid-able browse list. |
| FE-JOB-003 | Jobs page must support filtering by category and location. |
| FE-JOB-004 | Users must be able to open a post-job modal. |
| FE-JOB-005 | Posting a job must require title, description, category, and location. |
| FE-JOB-006 | Posting a job may include optional budget. |
| FE-JOB-007 | A newly posted job must appear in the user's posted jobs list and must not appear as bid-able to the owner. |
| FE-JOB-008 | Users must be able to open a bid modal for jobs they do not own. |
| FE-JOB-009 | Submitting a bid must require proposal and proposed hourly rate. |
| FE-JOB-010 | Users must be able to switch to an offers/my-posted-jobs section. |
| FE-JOB-011 | My posted jobs must show status and offer/bid counts returned by the backend. |
| FE-JOB-012 | Opening a posted job must navigate to `/jobs/:id`. |
| FE-JOB-013 | Job details must load a single job. |
| FE-JOB-014 | Job owners must be able to load and view bids. Non-owners must gracefully hide bid management if the bid API returns 403. |
| FE-JOB-015 | Job owners must be able to accept a pending bid. |
| FE-JOB-016 | Accepting a bid must update bid statuses locally and navigate to `/messages?conversationId=<id>` when the backend returns a conversation ID. |
| FE-JOB-017 | Job owners must be able to reject a pending bid. |
| FE-JOB-018 | Job owners must be able to message a bidder by creating/opening a conversation. |
| FE-JOB-019 | Non-owners must be able to submit a bid from job details. |

### 8.11 CV Analyzer

| ID | Requirement |
| --- | --- |
| FE-CV-001 | CV analyzer page must load recent analysis history on init. |
| FE-CV-002 | Users must select a file before analysis. |
| FE-CV-003 | CV analyzer must submit selected file as form field `cv`. |
| FE-CV-004 | Optional target role must be trimmed before submission. |
| FE-CV-005 | Optional job description must be trimmed before submission. |
| FE-CV-006 | The UI must show an analyzing/loading state while waiting for the backend. |
| FE-CV-007 | Analysis request must timeout after 120 seconds and show a timeout message. |
| FE-CV-008 | Successful analysis must display overall score, summary, section scores, strengths, issues, suggestions, and improved bullets. |
| FE-CV-009 | The latest successful upload must become the latest analysis shown in the UI. |
| FE-CV-010 | The analysis history must be refreshed after a successful analysis. |
| FE-CV-011 | Score styling must distinguish high, medium, and low scores. |
| FE-CV-012 | Backend error messages must be surfaced when available. |

### 8.12 Location Detection

| ID | Requirement |
| --- | --- |
| FE-LOC-001 | The frontend must be able to request browser geolocation. |
| FE-LOC-002 | Detected coordinates must be mapped to the nearest known Lebanese location from the static coordinate list. |
| FE-LOC-003 | Detected location must be stored in local storage. |
| FE-LOC-004 | Detected location must be emitted to subscribers through `LocationService.currentLocation$`. |
| FE-LOC-005 | Logout must clear stored detected location. |
| FE-LOC-006 | Browse filters must include a "Your Location" option when a detected location exists. |

## 9. Data And State Requirements

### 9.1 Frontend Models

| Model | Purpose |
| --- | --- |
| `User` | Browse/favorite card representation of a service provider. |
| `UserProfile` | Full profile representation with skills, languages, portfolio, and optional reviews. |
| `UpdateProfileRequest` | Editable profile payload sent to backend. |
| `Review` | Review display and API shape. |
| `Conversation` | Conversation list item with other user and last message metadata. |
| `ChatMessage` | Chat message and optional linked offer. |
| `Offer` | Direct booking offer lifecycle state. |
| `Booking` | Booking history view model. |
| `Job` | Reverse marketplace job post. |
| `JobBid` | Proposal submitted to a job. |
| `CvAnalysis` | Structured AI CV feedback. |
| `FilterCriteria` | Browse filter state shared across components. |

### 9.2 State Services

| Service | State Requirement |
| --- | --- |
| `AuthService` | Must expose signed-in state, current DB user ID, profile image state, token retrieval, username, and logout. |
| `FilterService` | Must hold current browse filters and notify subscribers. |
| `LocationService` | Must persist detected location and notify subscribers. |
| `ChatService` | Must maintain active/inbox realtime subscriptions and emit new messages and offer updates. |
| `SupabaseService` | Must expose a configured Supabase client. |

## 10. Validation Requirements

| Area | Validation |
| --- | --- |
| Sign in | Identifier required; password required when on password step; OTP code required by Clerk call. |
| Sign up | Email and password required; username required when Clerk reports missing username. |
| Password reset | Identifier required; reset code and new password required. |
| Setup profile | First name, last name, title, category, and location required; hourly rate must be non-negative. |
| Profile edit | First name and last name required; hourly rate must be non-negative. |
| Profile/cover image | Type must be jpeg, jpg, png, gif, or webp; size must be <= 5 MB. |
| Review | Rating required; comment max length 500. |
| Chat message | Trimmed text must be non-empty. |
| Create offer | Job title required; hourly rate required and positive. |
| Post job | Title, description, category, and location required. |
| Submit bid | Proposal and proposed rate required. |
| CV analysis | File required before submission. |

## 11. Non-Functional Requirements

### 11.1 Usability

| ID | Requirement |
| --- | --- |
| FE-NFR-USE-001 | Forms must show clear error messages when required input is missing or backend calls fail. |
| FE-NFR-USE-002 | Loading states must be shown for API-backed pages and actions. |
| FE-NFR-USE-003 | Successful profile setup should navigate users to home after confirmation. |
| FE-NFR-USE-004 | Chat must feel responsive through optimistic message rendering. |
| FE-NFR-USE-005 | Booking and bid actions must update the UI without requiring a full page reload. |
| FE-NFR-USE-006 | Mobile browse filters and chat must remain usable on small screens. |

### 11.2 Performance

| ID | Requirement |
| --- | --- |
| FE-NFR-PERF-001 | Search input must debounce changes by 250 ms. |
| FE-NFR-PERF-002 | Browse filtering must run client-side against already loaded users. |
| FE-NFR-PERF-003 | Chat should subscribe only to active and relevant inbox conversations. |
| FE-NFR-PERF-004 | Realtime messages must be de-duplicated by message ID before appending. |
| FE-NFR-PERF-005 | CV analysis UI must enforce a frontend timeout to avoid indefinite loading. |

### 11.3 Security

| ID | Requirement |
| --- | --- |
| FE-NFR-SEC-001 | Protected routes must use auth guards. |
| FE-NFR-SEC-002 | Backend authorization must not be replaced by frontend checks; frontend checks are only UX helpers. |
| FE-NFR-SEC-003 | Clerk session tokens must be requested from the active session and attached only as bearer headers. |
| FE-NFR-SEC-004 | Logout must clear session-scoped cached profile image. |
| FE-NFR-SEC-005 | Supabase anonymous key may be used frontend-side only for permitted realtime access policies. |

### 11.4 Reliability

| ID | Requirement |
| --- | --- |
| FE-NFR-REL-001 | API errors must stop loading/submitting states. |
| FE-NFR-REL-002 | Realtime subscriptions must be removed on component destroy. |
| FE-NFR-REL-003 | Missing or late Clerk user state must be handled with timeouts and redirects. |
| FE-NFR-REL-004 | If a user is not allowed to manage job bids, the job details page must continue working and hide owner actions. |
| FE-NFR-REL-005 | Failed optimistic chat sends must be rolled back locally. |

### 11.5 Maintainability

| ID | Requirement |
| --- | --- |
| FE-NFR-MAIN-001 | Route-level screens must remain in `src/app/pages`. |
| FE-NFR-MAIN-002 | Reusable UI must remain in feature-grouped folders under `src/app/components`. |
| FE-NFR-MAIN-003 | Backend communication must remain in injectable services. |
| FE-NFR-MAIN-004 | Shared data contracts must remain in `src/app/models`. |
| FE-NFR-MAIN-005 | Auth token attachment must remain centralized in an HTTP interceptor. |
| FE-NFR-MAIN-006 | Feature-specific state should be encapsulated in services instead of duplicated across components. |

### 11.6 Accessibility And Compatibility

| ID | Requirement |
| --- | --- |
| FE-NFR-A11Y-001 | Interactive controls must remain keyboard reachable. |
| FE-NFR-A11Y-002 | Loading and error states must be visible in page context. |
| FE-NFR-A11Y-003 | Form fields should use labels or visible context so users understand required inputs. |
| FE-NFR-COMP-001 | The app must support modern browsers with Angular 21 support. |
| FE-NFR-COMP-002 | Mobile layouts must account for browser visual viewport changes, especially chat keyboard overlap. |

## 12. External Integration Requirements

| Integration | Requirement |
| --- | --- |
| Clerk | Must handle sign-in, sign-up, SSO callbacks, missing requirements, OTP, password reset, active session, sign-out, and user state observable. |
| Backend API | Must be reachable at `environment.apiUrl`; all protected calls need bearer token. |
| Supabase Realtime | Must be reachable with `environment.supabaseUrl` and `environment.supabaseAnonKey`; database realtime must be enabled for `messages` and `offers`. |
| Browser geolocation | Optional; app must continue if unsupported or denied. |
| Session/local storage | Session storage caches profile image; local storage caches detected location. |

## 13. Acceptance Criteria

The frontend can be considered acceptable for the current scope when:

- Guests can sign in, sign up, use OAuth, verify email/OTP, reset password, and complete missing Clerk fields.
- Protected routes redirect guests to sign-in.
- Authenticated users can complete profile setup and later edit their profile.
- Browse loads provider cards and filters by category, price, rating, location, and search.
- Users can favorite/unfavorite providers and view favorite providers from their own profile.
- Users can view full profiles, upload profile/cover images as owner, upload portfolio images, toggle availability, and submit reviews for others.
- Users can create conversations, send messages, receive realtime messages, and create direct offers in chat.
- Users can manage booking lifecycle from booking history according to allowed actions.
- Users can post jobs, browse jobs, submit bids, view posted jobs, manage bids, and navigate to chat after accepting a bid.
- Users can upload a CV, receive analysis feedback, and view recent history.
- UI loading, error, and success states are clear enough for the user to recover from expected failures.

## 14. Known Gaps And Recommendations

| Gap | Recommendation |
| --- | --- |
| `userType = 'client'` exists in jobs page but is not connected to real roles. | Either remove it or implement explicit role/profile mode if the product needs role separation. |
| `/setup-profile` is not guarded by `authGuard`; it performs its own Clerk polling. | Consider a specialized guard that avoids the Clerk callback deadlock but still makes route intent clear. |
| Clerk publishable key is hard-coded in `app.ts`. | Move it to `environment.ts` and `environment.development.ts`. |
| No E2E framework is configured. | Add Playwright or Cypress for cross-page workflows. |
| No component spec files were found in the current tree. | Add unit tests for services, guards, filters, and high-risk components. |
| README mentions Socket.IO, but frontend currently uses Supabase Realtime. | Update documentation to say Supabase Realtime unless Socket.IO is reintroduced. |
| Booking stats label says "Total Earned" but uses all completed bookings regardless of direction. | Clarify calculation or split earned/spent by direction. |
| The chat `startChat` flow navigates to `/messages` without passing conversation ID. | Pass `conversationId` as a query parameter to auto-select the new conversation. |
