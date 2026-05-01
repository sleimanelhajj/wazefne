# Backend Requirements

## 1. Purpose

This document describes the backend requirements for Wazefne as implemented in the current Express/TypeScript codebase. It includes deduced user requirements, system requirements, functional requirements, non-functional requirements, API behavior, data requirements, business rules, and observed implementation notes.

Wazefne is a service marketplace for Lebanon. It lets users create professional service profiles, browse available service providers, save favorites, chat, create booking offers, manage booking status, post jobs, receive bids, leave reviews, and analyze CVs with AI feedback.

## 2. Scope

The backend provides:

- A REST API under `/api`.
- Clerk-authenticated user synchronization into PostgreSQL.
- Profile, portfolio, image, skill, and language management.
- Browseable service provider listings.
- Favorite user management.
- Conversations and persistent messages.
- Offer and booking lifecycle management.
- Job posting and freelancer bidding.
- Review creation and rating aggregation.
- AI CV analysis through Google Gemini.
- Swagger/OpenAPI documentation at `/api-docs`.
- Health check endpoint at `/api/health`.

The backend does not currently implement:

- Admin dashboards or admin moderation APIs.
- Payment processing.
- Escrow, invoices, refunds, or payout workflows.
- Calendar scheduling APIs.
- Notification delivery by email, SMS, or push.
- A backend-owned WebSocket server. Real-time behavior is handled by Supabase Realtime in the frontend.

## 3. Main Actors

| Actor | Description |
| --- | --- |
| Guest | A visitor who has not signed in. Backend access is limited to public or accidentally public endpoints. Most app features require authentication. |
| Authenticated User | Any signed-in Clerk user who has a synchronized `users` row in PostgreSQL. |
| Client | A user who wants to hire a service provider directly or by posting a job. This is a behavioral role, not a separate database role. |
| Service Provider | A user who offers services, appears in browse results when available, accepts offers, and submits bids. This is also behavioral, not a separate database role. |
| Profile Owner | The authenticated user acting on their own profile, images, availability, portfolio, skills, and languages. |
| External Auth Provider | Clerk handles sessions, email/password flows, OAuth, second factor flows, and user identity. |
| External Storage Provider | Supabase Storage stores uploaded portfolio images. |
| External AI Provider | Gemini analyzes uploaded CV files and returns structured feedback. |

## 4. Technology Requirements

| Area | Requirement |
| --- | --- |
| Runtime | Node.js 18 or newer is expected by the repository README. |
| Language | TypeScript. |
| Web framework | Express 5. |
| Database | PostgreSQL, typically hosted on Supabase. |
| Auth | Clerk JWTs verified by `@clerk/express`. |
| Storage | Supabase Storage bucket named `user_uploads` for portfolio images. |
| AI | Google Gemini through `@google/generative-ai`. |
| File uploads | Multer memory storage. |
| API docs | Swagger generated from route annotations. |
| Deployment | Vercel serverless routing through `Backend/vercel.json`. |

## 5. Environment Configuration

The backend requires these environment variables:

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string used by `pg.Pool`. |
| `CLERK_SECRET_KEY` | Yes for auth | Clerk secret key used by Clerk middleware and Clerk client. |
| `CLERK_PUBLISHABLE_KEY` | Recommended | Clerk publishable key passed to Clerk middleware. |
| `ALLOWED_ORIGINS` | Recommended | Comma-separated frontend origins allowed by CORS and Clerk authorized parties. Defaults to `http://localhost:4200`. |
| `SUPABASE_URL` | Required for portfolio uploads | Supabase project URL. |
| `SUPABASE_SERVICE_ROLE_KEY` | Required for portfolio uploads | Backend Supabase key used by the service client. |
| `GEMINI_API_KEY` | Required for CV analysis | Gemini API key. |
| `GEMINI_MODEL` | Optional | Gemini model name. Defaults to `gemini-2.0-flash`. |
| `GEMINI_TIMEOUT_MS` | Optional | Gemini timeout. Defaults to 90000 ms. |
| `PORT` | Optional | Local backend port. Defaults to 3000. |
| `NODE_ENV` | Optional | Controls local server startup and development error stack output. |

## 6. Authentication And Authorization Requirements

### 6.1 Authentication

| ID | Requirement |
| --- | --- |
| BE-AUTH-001 | Protected endpoints must receive a valid Clerk session JWT in the `Authorization: Bearer <token>` header. |
| BE-AUTH-002 | The global Clerk middleware must parse Clerk auth data before protected routes execute. |
| BE-AUTH-003 | The custom `authenticate` middleware must reject unauthenticated requests with HTTP 401 and `{ success: false, message: "Not authenticated" }` or a similar unauthorized response. |
| BE-AUTH-004 | On authenticated requests, the backend must fetch the Clerk user and upsert a local PostgreSQL `users` row keyed by `clerk_id`. |
| BE-AUTH-005 | The local `req.user` object must include the PostgreSQL user `id`, Clerk `clerkId`, and email for downstream controller authorization checks. |

### 6.2 Authorization

| ID | Requirement |
| --- | --- |
| BE-AUTHZ-001 | Users must only update their own profile. |
| BE-AUTHZ-002 | Users must not create conversations with themselves. |
| BE-AUTHZ-003 | Users must only read messages for conversations where they are `user1_id` or `user2_id`. |
| BE-AUTHZ-004 | Users must only send messages into conversations where they are participants. |
| BE-AUTHZ-005 | Users must only create offers inside conversations where they are participants. |
| BE-AUTHZ-006 | Only an offer recipient can accept, decline, start, or complete an offer. |
| BE-AUTHZ-007 | Only an offer sender can cancel a pending offer. |
| BE-AUTHZ-008 | Users must not review themselves. |
| BE-AUTHZ-009 | Users must not favorite themselves. |
| BE-AUTHZ-010 | Users must not bid on their own jobs. |
| BE-AUTHZ-011 | Only a job owner can view bids for that job. |
| BE-AUTHZ-012 | Only a job owner can accept or reject bids for that job. |
| BE-AUTHZ-013 | CV analysis history must only return analyses for the authenticated user. |

### 6.3 Observed Route Note

`GET /api/profile/:id` is currently registered as `router.get("/:id", getProfileById, authenticate)`. Because `getProfileById` sends the response and does not call `next()`, the route behaves as public. If the intended requirement is authenticated public-profile viewing, `authenticate` should run before `getProfileById`.

## 7. Functional Requirements

### 7.1 Health And Documentation

| ID | Requirement |
| --- | --- |
| BE-GEN-001 | The API must expose `GET /api/health` returning `{ status: "ok", timestamp: "<ISO date>" }`. |
| BE-GEN-002 | The API root `/` must redirect to `/api-docs`. |
| BE-GEN-003 | Swagger UI must expose route documentation at `/api-docs`. |
| BE-GEN-004 | API responses should consistently include `success: true` for successful domain responses and `success: false` for controlled errors where implemented. |

### 7.2 User Synchronization

| ID | Requirement |
| --- | --- |
| BE-USR-001 | When a signed-in Clerk user calls any protected endpoint, the backend must create a `users` row if one does not already exist. |
| BE-USR-002 | The upsert must preserve locally edited first name, last name, and profile image when already present, while allowing missing values to be seeded from Clerk. |
| BE-USR-003 | A local user must have a unique email and optional unique `clerk_id`. |

### 7.3 Browse Users

| ID | Requirement |
| --- | --- |
| BE-BRW-001 | `GET /api/users` must return service providers who are marked `available_today = true`. |
| BE-BRW-002 | The authenticated user must be excluded from browse results. |
| BE-BRW-003 | Each browse result must include identity, title, profile image, rating, review count, hourly rate, verification status, category, availability, location, skills, and whether the current user has favorited them. |
| BE-BRW-004 | Skills for browse results must be loaded efficiently in a grouped query rather than one query per user. |

### 7.4 Profile Management

| ID | Requirement |
| --- | --- |
| BE-PRF-001 | `GET /api/profile/me` must return the authenticated user's full profile. |
| BE-PRF-002 | `GET /api/profile/:id` must return a full public profile for the requested user ID. |
| BE-PRF-003 | Full profile responses must include user core fields, computed `name`, skills, languages, portfolio images, and reviews. |
| BE-PRF-004 | `PUT /api/profile/update-profile` must update the authenticated user's editable profile fields. |
| BE-PRF-005 | Profile updates must support partial updates by preserving previous values when a field is omitted. |
| BE-PRF-006 | Profile updates must synchronize skills by replacing the user's existing skill links when a `skills` array is provided. |
| BE-PRF-007 | Profile updates must synchronize languages by replacing the user's existing language links when a `languages` array is provided. |
| BE-PRF-008 | Profile updates must synchronize portfolio images by replacing existing portfolio rows when a `portfolio` array is provided. |
| BE-PRF-009 | Profile update, skill update, language update, and portfolio synchronization must run in one database transaction. |
| BE-PRF-010 | `POST /api/profile/upload-profile-picture` must accept one image file named `image`, validate type and size, convert it to a base64 data URL, and store it in `users.profile_image`. |
| BE-PRF-011 | `POST /api/profile/upload-cover-image` must accept one image file named `image`, validate type and size, convert it to a base64 data URL, and store it in `users.cover_image`. |
| BE-PRF-012 | `POST /api/profile/upload-portfolio` must accept up to 10 image files named `images`, upload them to the Supabase `user_uploads` bucket, store public URLs in `portfolio_images`, and return inserted image metadata. |
| BE-PRF-013 | Image upload size must be limited to 5 MB per file. |
| BE-PRF-014 | Image upload types must be limited to jpeg, jpg, png, gif, and webp. |

### 7.5 Favorites

| ID | Requirement |
| --- | --- |
| BE-FAV-001 | `GET /api/favorites/users` must return the authenticated user's saved favorite service providers. |
| BE-FAV-002 | Favorite user results must include the same card-ready fields as browse results plus `favoritedAt`. |
| BE-FAV-003 | `POST /api/favorites/users/:favoriteUserId` must add a favorite if the target user exists and is not the authenticated user. |
| BE-FAV-004 | Adding an already favorited user must remain idempotent and return success. |
| BE-FAV-005 | `DELETE /api/favorites/users/:favoriteUserId` must remove the favorite if it exists and return whether a row was removed. |

### 7.6 Conversations And Messages

| ID | Requirement |
| --- | --- |
| BE-MSG-001 | `GET /api/messages/conversations` must return all conversations for the authenticated user. |
| BE-MSG-002 | Conversation results must include the other user's identity fields, the latest message preview, latest message time, and sender of the latest message. |
| BE-MSG-003 | `POST /api/messages/conversations` must create or return the existing conversation with another user. |
| BE-MSG-004 | Conversation creation must normalize `user1_id` and `user2_id` ordering so a pair is unique regardless of who initiates. |
| BE-MSG-005 | `GET /api/messages/conversations/:id` must verify membership before returning messages. |
| BE-MSG-006 | Message history must be ordered ascending by `created_at`. |
| BE-MSG-007 | Message history must include linked offer details when `messages.offer_id` references an offer. |
| BE-MSG-008 | `POST /api/messages/conversations/:id/messages` must reject blank content. |
| BE-MSG-009 | Sending a message must insert a `messages` row and update the parent conversation `updated_at`. |

### 7.7 Offers And Bookings

| ID | Requirement |
| --- | --- |
| BE-OFR-001 | `POST /api/offers` must create an offer within an existing conversation. |
| BE-OFR-002 | Offer creation must require `conversationId`, non-empty `title`, and positive `hourlyRate`. |
| BE-OFR-003 | Offer creation must verify the sender is a participant in the conversation. |
| BE-OFR-004 | Offer creation must set the recipient to the other conversation participant. |
| BE-OFR-005 | Offer creation must insert a linked message with `offer_id` so the frontend can render an offer card in chat. |
| BE-OFR-006 | `GET /api/offers/conversation/:conversationId` must return all offers for a conversation only to conversation participants. |
| BE-OFR-007 | `GET /api/offers/my-bookings` must return all offers where the authenticated user is sender or recipient. |
| BE-OFR-008 | Booking results must include sender and recipient identity fields and a `direction` of `i-booked` or `booked-me`. |
| BE-OFR-009 | `PATCH /api/offers/:id/status` must support only valid lifecycle transitions. |
| BE-OFR-010 | `PATCH /api/offers/:id/cancel` must cancel only pending offers and only by the offer sender. |
| BE-OFR-011 | Every offer state change must insert a system-like message into the conversation and update the conversation timestamp. |
| BE-OFR-012 | When a job-derived offer titled `Job: <job title>` reaches `in_progress` or `completed`, the matching job status must be reconciled when possible. |

Offer status transitions:

| From | To | Actor |
| --- | --- | --- |
| `pending` | `accepted` | Recipient |
| `pending` | `declined` | Recipient |
| `pending` | `cancelled` | Sender |
| `accepted` | `in_progress` | Recipient |
| `in_progress` | `completed` | Recipient |

### 7.8 Job Posting And Bidding

| ID | Requirement |
| --- | --- |
| BE-JOB-001 | `POST /api/jobs` must allow an authenticated user to create a job post. |
| BE-JOB-002 | Job creation must require title, description, category, and location. |
| BE-JOB-003 | Job budget must be optional. |
| BE-JOB-004 | `GET /api/jobs` must return open jobs and support optional `category` and `location` filters. |
| BE-JOB-005 | Job listing responses must include client identity fields and `is_owner` for the authenticated user. |
| BE-JOB-006 | `GET /api/jobs/my-posts` must return jobs posted by the authenticated user. |
| BE-JOB-007 | My posted jobs must include total bid count and pending bid count. |
| BE-JOB-008 | `GET /api/jobs/:id` must return a single job with client identity fields and `is_owner`. |
| BE-JOB-009 | `POST /api/jobs/:id/bids` must let a non-owner submit a bid on an open job. |
| BE-JOB-010 | Bid creation must require non-empty proposal and proposed rate. |
| BE-JOB-011 | A user must not bid on their own job. |
| BE-JOB-012 | A closed job must reject new bids. |
| BE-JOB-013 | `GET /api/jobs/:id/bids` must return bids only to the job owner. |
| BE-JOB-014 | `PATCH /api/jobs/:jobId/bids/:bidId/status` must let the job owner accept or reject a pending bid. |
| BE-JOB-015 | Accepting one bid must reject all other pending bids for the same job. |
| BE-JOB-016 | Accepting a bid must set the job to `in_progress`. |
| BE-JOB-017 | Accepting a bid must create or reuse a conversation between client and freelancer. |
| BE-JOB-018 | Accepting a bid must create an accepted offer titled `Job: <job title>` so the booking appears in booking history. |
| BE-JOB-019 | Accepting a bid must insert a conversation message telling the freelancer the proposal was accepted. |

### 7.9 Reviews And Ratings

| ID | Requirement |
| --- | --- |
| BE-REV-001 | `POST /api/reviews` must let an authenticated user review another existing user. |
| BE-REV-002 | Review creation must require `reviewed_user_id` and rating. |
| BE-REV-003 | Rating must be an integer from 1 to 5. |
| BE-REV-004 | A user must not review themselves. |
| BE-REV-005 | One reviewer may have only one review per reviewed user; submitting again updates the existing review. |
| BE-REV-006 | `GET /api/reviews/user/:userId` must return reviews for an existing user. |
| BE-REV-007 | Review responses must include reviewer identity fields. |
| BE-REV-008 | The database trigger must update the reviewed user's average rating and review count after insert, update, or delete. |

### 7.10 CV Analysis

| ID | Requirement |
| --- | --- |
| BE-CV-001 | `POST /api/cv/analyze` must accept one file field named `cv`. |
| BE-CV-002 | Supported CV formats must be PDF and DOCX only. |
| BE-CV-003 | CV upload size must be limited to 2 MB. |
| BE-CV-004 | Optional `targetRole` must be trimmed and limited to 180 characters. |
| BE-CV-005 | Optional `jobDescription` must be trimmed and limited to 5000 characters. |
| BE-CV-006 | Uploaded file contents must be SHA-256 hashed. |
| BE-CV-007 | If a user uploads an already analyzed file, the backend must return the cached analysis instead of re-calling Gemini. |
| BE-CV-008 | PDF files must be sent directly to Gemini as inline file data. |
| BE-CV-009 | DOCX files must be text-extracted with Mammoth before analysis. |
| BE-CV-010 | DOCX extracted text shorter than 80 characters must be rejected as unreadable. |
| BE-CV-011 | DOCX extracted text longer than 15000 characters must be truncated before analysis. |
| BE-CV-012 | Gemini output must be normalized into a strict structured analysis shape. |
| BE-CV-013 | CV analysis must persist filename, mime type, file hash, extracted text marker/text, overall score, JSON analysis, and timestamp. |
| BE-CV-014 | `GET /api/cv/my-analyses` must return recent analyses for the authenticated user. |
| BE-CV-015 | CV history `limit` must be clamped between 1 and 30, defaulting to 10. |

## 8. API Endpoint Summary

| Method | Endpoint | Auth | Main Success Output |
| --- | --- | --- | --- |
| GET | `/api/health` | No | `{ status, timestamp }` |
| GET | `/api/users` | Yes | `{ success, users }` |
| GET | `/api/profile/me` | Yes | `{ success, user }` |
| GET | `/api/profile/:id` | Currently public by route order | `{ success, user }` |
| PUT | `/api/profile/update-profile` | Yes | `{ success, user }` |
| POST | `/api/profile/upload-portfolio` | Yes | `{ success, images }` |
| POST | `/api/profile/upload-profile-picture` | Yes | `{ success, user }` |
| POST | `/api/profile/upload-cover-image` | Yes | `{ success, coverImage }` |
| GET | `/api/favorites/users` | Yes | `{ success, users }` |
| POST | `/api/favorites/users/:favoriteUserId` | Yes | `{ success, isFavorited, added }` |
| DELETE | `/api/favorites/users/:favoriteUserId` | Yes | `{ success, isFavorited, removed }` |
| GET | `/api/messages/conversations` | Yes | `{ success, conversations }` |
| POST | `/api/messages/conversations` | Yes | `{ success, conversation }` |
| GET | `/api/messages/conversations/:id` | Yes | `{ success, messages }` |
| POST | `/api/messages/conversations/:id/messages` | Yes | `{ success, message }` |
| POST | `/api/offers` | Yes | `{ success, offer }` |
| GET | `/api/offers/my-bookings` | Yes | `{ success, bookings }` |
| PATCH | `/api/offers/:id/status` | Yes | `{ success, status }` |
| PATCH | `/api/offers/:id/cancel` | Yes | `{ success, status }` |
| GET | `/api/offers/conversation/:conversationId` | Yes | `{ success, offers }` |
| POST | `/api/jobs` | Yes | `{ success, job }` |
| GET | `/api/jobs` | Yes | `{ success, jobs }` |
| GET | `/api/jobs/my-posts` | Yes | `{ success, jobs }` |
| GET | `/api/jobs/:id` | Yes | `{ success, job }` |
| POST | `/api/jobs/:id/bids` | Yes | `{ success, bid }` |
| GET | `/api/jobs/:id/bids` | Yes, owner only | `{ success, bids }` |
| PATCH | `/api/jobs/:jobId/bids/:bidId/status` | Yes, owner only | `{ success, status, conversationId }` |
| POST | `/api/reviews` | Yes | `{ success, review }` |
| GET | `/api/reviews/user/:userId` | No auth middleware | `{ success, reviews }` |
| POST | `/api/cv/analyze` | Yes | `{ success, cached, analysisId, overallScore, analysis }` |
| GET | `/api/cv/my-analyses` | Yes | `{ success, analyses }` |

## 9. Data Requirements

### 9.1 Core Entities

| Entity | Purpose | Important Fields |
| --- | --- | --- |
| `users` | Local user/profile record synchronized with Clerk. | `id`, `clerk_id`, `email`, `first_name`, `last_name`, `profile_image`, `cover_image`, `title`, `offer_description`, `location`, `about_me`, `hourly_rate`, `rating`, `review_count`, `verified`, `category`, `available_today`. |
| `skills` | Master list of skill names. | `id`, `name`. |
| `user_skills` | Many-to-many join between users and skills. | `user_id`, `skill_id`. |
| `languages` | Master list of language names. | `id`, `name`. |
| `user_languages` | Many-to-many join between users and languages. | `user_id`, `language_id`. |
| `portfolio_images` | Ordered profile portfolio images. | `id`, `user_id`, `image_url`, `caption`, `sort_order`. |
| `reviews` | One review from one user to another. | `id`, `reviewer_id`, `reviewed_user_id`, `rating`, `comment`. |
| `conversations` | Pairwise chat container. | `id`, `user1_id`, `user2_id`, `created_at`, `updated_at`. |
| `messages` | Chat messages and system messages. | `id`, `conversation_id`, `sender_id`, `content`, `offer_id`, `created_at`. |
| `offers` | Direct booking offers sent inside conversations. | `id`, `conversation_id`, `sender_id`, `recipient_id`, `title`, `hourly_rate`, `status`. |
| `jobs` | Reverse marketplace job posts. | `id`, `client_id`, `title`, `description`, `budget`, `category`, `location`, `status`. |
| `job_bids` | Freelancer proposals for jobs. | `id`, `job_id`, `freelancer_id`, `proposal`, `proposed_rate`, `status`. |
| `user_favorites` | Saved service providers for each user. | `user_id`, `favorite_user_id`, `created_at`. |
| `cv_analyses` | Stored AI CV analysis results. | `id`, `user_id`, `original_filename`, `mime_type`, `file_hash`, `extracted_text`, `overall_score`, `analysis_json`. |

### 9.2 Relationship Requirements

| Relationship | Requirement |
| --- | --- |
| User to skills | A user can have many skills; a skill can belong to many users. |
| User to languages | A user can have many languages; a language can belong to many users. |
| User to portfolio images | A user can have many portfolio images. Deleting a user deletes images. |
| User to reviews | A user can write reviews and receive reviews. One reviewer/reviewed pair must be unique. |
| User to conversations | A conversation contains exactly two distinct users. |
| Conversation to messages | A conversation can have many messages. Deleting a conversation deletes its messages. |
| Conversation to offers | A conversation can have many offers. Deleting a conversation deletes its offers. |
| Message to offer | A message may reference one offer; if the offer is deleted, `offer_id` is set null. |
| User to jobs | A user can create many jobs. Deleting a user deletes their jobs. |
| Job to bids | A job can receive many bids. Deleting a job deletes bids. |
| User to favorites | A user can favorite many other users and can be favorited by many users. |
| User to CV analyses | A user can have many stored CV analyses. Deleting a user deletes analyses. |

### 9.3 Data Integrity Requirements

| ID | Requirement |
| --- | --- |
| BE-DATA-001 | `users.email` must be unique. |
| BE-DATA-002 | `users.clerk_id` must be unique when present. |
| BE-DATA-003 | `reviews.rating` must be between 1 and 5. |
| BE-DATA-004 | `conversations` must prevent self-chat with a check constraint. |
| BE-DATA-005 | `conversations` must have a unique user pair. |
| BE-DATA-006 | `offers.status` must be constrained to known lifecycle states. |
| BE-DATA-007 | `jobs.status` must be constrained to `open`, `in_progress`, `completed`, or `cancelled`. |
| BE-DATA-008 | `job_bids.status` must be constrained to `pending`, `accepted`, or `rejected`. |
| BE-DATA-009 | `user_favorites` must prevent self-favorite with a check constraint. |
| BE-DATA-010 | CV analyses must be unique per `(user_id, file_hash)` to support caching. |
| BE-DATA-011 | Indexes must exist for common lookups: users by Clerk ID, messages by conversation, conversations by user, offers by conversation, jobs by client/status, bids by job/freelancer, favorites by user/target, and CV analyses by user/date. |

## 10. Business Rules

| Area | Rule |
| --- | --- |
| Availability | Only users with `available_today = true` are returned by browse endpoint. |
| Browse ownership | A signed-in user cannot browse themselves in the main provider list. |
| Favorites | Favoriting is idempotent; unfavoriting is safe if no favorite exists. |
| Reviews | A reviewer can update their previous review for the same reviewed user. |
| Ratings | Average rating and review count are maintained by a database trigger, not by application code. |
| Direct booking | An offer starts as `pending`; the receiver decides whether to accept or decline. |
| Offer cancellation | Only the sender can cancel, and only while `pending`. |
| Work progression | The receiver moves accepted work to `in_progress` and then to `completed`. |
| Job bid acceptance | A job owner can choose one winning bid; the chosen bid becomes accepted, other pending bids become rejected, and the job becomes in progress. |
| Job-derived booking | Accepted bids produce an accepted booking offer and a conversation message. |
| CV caching | Re-uploading the exact same file by the same user returns cached analysis. |

## 11. Non-Functional Requirements

### 11.1 Security

| ID | Requirement |
| --- | --- |
| BE-NFR-SEC-001 | Protected endpoints must rely on server-side authentication, not frontend-only checks. |
| BE-NFR-SEC-002 | CORS must restrict allowed origins to configured frontend domains. |
| BE-NFR-SEC-003 | File upload endpoints must validate file type and file size. |
| BE-NFR-SEC-004 | User-controlled text fields must be passed to PostgreSQL through parameterized queries. |
| BE-NFR-SEC-005 | Users must not be able to access conversations, offers, bookings, bids, CV analyses, or profile update operations owned by other users. |
| BE-NFR-SEC-006 | Secrets must come from environment variables and must not be committed into source files. |
| BE-NFR-SEC-007 | The Supabase service role key must be used only server-side. |
| BE-NFR-SEC-008 | Development stack traces must not be returned in production error responses. |

### 11.2 Performance

| ID | Requirement |
| --- | --- |
| BE-NFR-PERF-001 | Browse results should avoid N+1 queries for skills and favorites. |
| BE-NFR-PERF-002 | Conversation lists must use indexed lookups and order by latest activity. |
| BE-NFR-PERF-003 | Message history must use the `idx_messages_conversation` index for efficient ordered reads. |
| BE-NFR-PERF-004 | Job and bid queries must use job/client/status indexes where applicable. |
| BE-NFR-PERF-005 | CV analysis must cache duplicate files by hash to avoid repeated AI calls. |
| BE-NFR-PERF-006 | CV text sent to Gemini must be capped to reduce latency and token usage. |

### 11.3 Reliability

| ID | Requirement |
| --- | --- |
| BE-NFR-REL-001 | Multi-step profile updates must be transactional. |
| BE-NFR-REL-002 | Multi-step bid acceptance must be transactional. |
| BE-NFR-REL-003 | Gemini calls must have a timeout and return controlled errors or fallback normalized analysis where implemented. |
| BE-NFR-REL-004 | Controllers must pass unexpected errors to the shared error handler. |
| BE-NFR-REL-005 | Local startup must verify PostgreSQL connectivity before listening. |

### 11.4 Maintainability

| ID | Requirement |
| --- | --- |
| BE-NFR-MAIN-001 | Routes must remain grouped by feature under `src/routes`. |
| BE-NFR-MAIN-002 | Controllers must own request validation and orchestration. |
| BE-NFR-MAIN-003 | Reusable external integration logic must live in `src/services`. |
| BE-NFR-MAIN-004 | Database schema changes must be represented as ordered SQL migrations. |
| BE-NFR-MAIN-005 | Shared data shapes should use TypeScript interfaces where practical. |
| BE-NFR-MAIN-006 | Swagger annotations should be kept aligned with route behavior. |

### 11.5 Usability And API Consistency

| ID | Requirement |
| --- | --- |
| BE-NFR-API-001 | Validation failures should return 400 with actionable messages. |
| BE-NFR-API-002 | Unauthorized requests should return 401. |
| BE-NFR-API-003 | Authenticated users attempting forbidden operations should return 403. |
| BE-NFR-API-004 | Missing domain resources should return 404. |
| BE-NFR-API-005 | Success payloads should use frontend-friendly field names where existing services expect them. |

## 12. Deployment Requirements

| ID | Requirement |
| --- | --- |
| BE-DEP-001 | Local development must run with `npm run dev`, using `nodemon` and `ts-node`. |
| BE-DEP-002 | Production build must compile TypeScript with `npm run build`. |
| BE-DEP-003 | Production start must run `node dist/server.js` when not deployed through Vercel. |
| BE-DEP-004 | Vercel deployment must route all requests to `server.ts` according to `vercel.json`. |
| BE-DEP-005 | Required environment variables must be configured in the deployment platform. |
| BE-DEP-006 | Database migrations must be applied before the app handles production traffic. |

Observed note: `src/config/migrate.ts` contains a migration runner, but `server.ts` does not currently call it. Migrations must therefore be run separately or wired into startup if automatic migration is desired.

## 13. Acceptance Criteria

The backend can be considered acceptable for the current functional scope when:

- A signed-in Clerk user can call protected APIs and receive a local `users` row.
- Profile setup and profile editing persist all core fields, skills, languages, and portfolio data.
- Browse returns only available providers other than the current user.
- Favorites can be added, listed, removed, and reflected in browse results.
- Two users can create a conversation, exchange messages, and see persistent chat history.
- Direct offers can be created, accepted, declined, cancelled, moved to progress, and completed according to the lifecycle rules.
- Booking history returns all sent and received offers with correct direction.
- Users can post jobs, browse open jobs, submit bids, accept or reject bids, and open chat after bid acceptance.
- Reviews can be created or updated and profile ratings update automatically.
- CV uploads return structured analysis and duplicate uploads return cached analysis.
- Authorization checks prevent cross-user data access for protected resources.
- Swagger docs load at `/api-docs`.
- Health check returns status and timestamp.

## 14. Known Gaps And Recommendations

| Gap | Recommendation |
| --- | --- |
| No backend automated test script is configured in `package.json`. | Add a test runner such as Vitest, Jest, or Supertest-based integration tests. |
| Migration runner exists but is not invoked by startup. | Add an explicit migration command or call migrations during controlled deploy/startup. |
| `GET /api/profile/:id` has auth middleware after the handler. | Move `authenticate` before `getProfileById` if the route should require authentication. |
| README mentions Socket.IO, but current code uses Supabase Realtime on the frontend and no backend Socket.IO server is present. | Update README or reintroduce Socket.IO intentionally. |
| Profile and cover images are stored as base64 in PostgreSQL while portfolio images use Supabase Storage. | Prefer object storage for all large images to reduce database bloat. |
| No payment or scheduling subsystem exists. | Keep booking terminology clear until payment/calendar features are added. |
| Some Swagger docs are more detailed than others. | Expand Swagger docs for jobs, favorites, CV response schemas, and error responses. |
