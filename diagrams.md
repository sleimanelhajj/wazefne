# Wazefne Diagrams

This file contains high-level and detailed diagrams for the Wazefne application. The diagrams are written in Mermaid syntax so they can be rendered by GitHub, many IDE Markdown previews, and Mermaid-compatible documentation tools.

## 1. System Summary

Wazefne is a marketplace for local services in Lebanon. A signed-in user can act as a client, a service provider, or both. The platform supports profile setup, provider browsing, favorites, reviews, chat, direct booking offers, job posting, job bidding, booking history, and AI CV analysis.

Core systems:

- Frontend: Angular application in `Frontend/`.
- Backend: Express/TypeScript REST API in `Backend/`.
- Database: PostgreSQL hosted on Supabase.
- Realtime: Supabase Realtime subscriptions from the Angular app.
- Auth: Clerk.
- AI: Gemini for CV analysis.
- Storage: Supabase Storage for portfolio uploads.

## 2. Use Case Model

### 2.1 Use Case Diagram

```mermaid
flowchart LR
    Guest[Guest]
    User[Authenticated User]
    Client[Client behavior]
    Provider[Service Provider behavior]
    ProfileOwner[Profile Owner]
    Clerk[Clerk Auth]
    Gemini[Gemini AI]

    Guest --> UC1[Sign up]
    Guest --> UC2[Sign in]
    Guest --> UC3[Use OAuth callback]
    Guest --> UC4[Reset password]
    Guest --> UC5[View home page]

    UC1 --> Clerk
    UC2 --> Clerk
    UC3 --> Clerk
    UC4 --> Clerk

    User --> UC6[Complete profile setup]
    User --> UC7[Browse available providers]
    User --> UC8[Filter and search providers]
    User --> UC9[Favorite provider]
    User --> UC10[View profile]
    User --> UC11[Leave review]
    User --> UC12[Open chat]
    User --> UC13[Send message]
    User --> UC14[Analyze CV]
    UC14 --> Gemini

    ProfileOwner --> UC15[Edit own profile]
    ProfileOwner --> UC16[Upload profile image]
    ProfileOwner --> UC17[Upload cover image]
    ProfileOwner --> UC18[Upload portfolio images]
    ProfileOwner --> UC19[Toggle availability]
    ProfileOwner --> UC20[View saved favorites]

    Client --> UC21[Create direct offer]
    Client --> UC22[Cancel pending offer]
    Client --> UC23[Post job]
    Client --> UC24[Review job bids]
    Client --> UC25[Accept or reject bid]

    Provider --> UC26[Accept or decline offer]
    Provider --> UC27[Start accepted booking]
    Provider --> UC28[Complete booking]
    Provider --> UC29[Submit job bid]

    User --> UC30[View booking history]
    UC30 --> UC22
    UC30 --> UC26
    UC30 --> UC27
    UC30 --> UC28
```


## 3. C4-Style Architecture

### 3.1 Level 1: System Context

```mermaid
flowchart TB
    User[User in browser]
    Wazefne[Wazefne System]
    Clerk[Clerk\nAuthentication and user identity]
    Supabase[(Supabase\nPostgreSQL, Storage, Realtime)]
    Gemini[Google Gemini\nCV analysis]
    Vercel[Vercel\nHosting/deployment]

    User -->|Uses web app| Wazefne
    Wazefne -->|Authenticates users| Clerk
    Wazefne -->|Reads/writes app data| Supabase
    Wazefne -->|Uploads portfolio images| Supabase
    Wazefne -->|Subscribes to realtime changes| Supabase
    Wazefne -->|Sends CV files/text for analysis| Gemini
    Vercel -->|Hosts frontend/backend deployments| Wazefne
```

### 3.2 Level 2: Container Diagram

```mermaid
flowchart TB
    Browser[Browser]
    Angular[Angular Frontend\nStandalone components, services, guards]
    API[Express Backend API\nRoutes, controllers, middleware]
    Clerk[Clerk]
    Postgres[(PostgreSQL)]
    Storage[(Supabase Storage)]
    Realtime[Supabase Realtime]
    Gemini[Gemini AI]

    Browser --> Angular
    Angular -->|REST over HTTPS with bearer token| API
    Angular -->|Clerk browser SDK| Clerk
    Angular -->|Realtime subscriptions| Realtime
    Realtime --> Postgres
    API -->|Clerk middleware and user lookup| Clerk
    API -->|Parameterized SQL| Postgres
    API -->|Portfolio upload/public URLs| Storage
    API -->|CV prompt/file analysis| Gemini
```

### 3.3 Level 3: Backend Components

```mermaid
flowchart TB
    Client[Angular HTTP client]
    Server[server.ts\nExpress app]
    ClerkMW[Clerk middleware]
    AuthMW[authenticate middleware\nsync Clerk user to DB]
    ErrorMW[errorHandler]

    Routes[src/routes]
    Profile[profile.controller]
    Users[users.controller]
    Favorites[favorites.controller]
    Messages[messages.controller]
    Offers[offers.controller]
    Jobs[jobs.controller]
    Reviews[reviews.controller]
    CV[cv.controller]

    DB[(PostgreSQL pool)]
    Supabase[Supabase client]
    CVExtraction[cv-extraction.service]
    CVAnalysis[cv-analysis.service]
    Gemini[Gemini]

    Client --> Server
    Server --> ClerkMW
    ClerkMW --> Routes
    Routes --> AuthMW
    Routes --> Profile
    Routes --> Users
    Routes --> Favorites
    Routes --> Messages
    Routes --> Offers
    Routes --> Jobs
    Routes --> Reviews
    Routes --> CV
    Profile --> DB
    Profile --> Supabase
    Users --> DB
    Favorites --> DB
    Messages --> DB
    Offers --> DB
    Jobs --> DB
    Reviews --> DB
    CV --> DB
    CV --> CVExtraction
    CV --> CVAnalysis
    CVAnalysis --> Gemini
    Server --> ErrorMW
```

### 3.4 Level 3: Frontend Components

```mermaid
flowchart TB
    App[App root]
    Routes[app.routes]
    Guards[auth.guard / guest.guard]
    Interceptor[auth.interceptor]

    Pages[Pages]
    Home[Home]
    Auth[Auth and SSO callback]
    Setup[Setup profile]
    Browse[Browse]
    Profile[Profile]
    Messages[Messages]
    Bookings[Bookings]
    Jobs[Jobs and job details]
    CVPage[CV analyzer]

    Services[Services]
    AuthService[AuthService]
    ProfileService[ProfileService]
    FilterService[FilterService]
    FavoritesService[FavoritesService]
    ChatService[ChatService]
    OfferService[OfferService]
    JobService[JobService]
    CVService[CvAnalyzerService]
    LocationService[LocationService]
    SupabaseService[SupabaseService]

    Backend[Backend API]
    Clerk[Clerk]
    Supabase[Supabase Realtime]

    App --> Routes
    Routes --> Guards
    Routes --> Pages
    Pages --> Home
    Pages --> Auth
    Pages --> Setup
    Pages --> Browse
    Pages --> Profile
    Pages --> Messages
    Pages --> Bookings
    Pages --> Jobs
    Pages --> CVPage
    Pages --> Services
    Services --> AuthService
    Services --> ProfileService
    Services --> FilterService
    Services --> FavoritesService
    Services --> ChatService
    Services --> OfferService
    Services --> JobService
    Services --> CVService
    Services --> LocationService
    Services --> SupabaseService
    Interceptor --> Backend
    ProfileService --> Backend
    FavoritesService --> Backend
    ChatService --> Backend
    OfferService --> Backend
    JobService --> Backend
    CVService --> Backend
    AuthService --> Clerk
    SupabaseService --> Supabase
    ChatService --> Supabase
```

## 4. Data Model

### 4.1 Entity Relationship Diagram

```mermaid
erDiagram
    USERS {
        uuid id PK
        string clerk_id UK
        string email UK
        string first_name
        string last_name
        text profile_image
        text cover_image
        string title
        text offer_description
        string location
        text about_me
        numeric hourly_rate
        numeric rating
        int review_count
        boolean verified
        string category
        boolean available_today
        timestamp created_at
        timestamp updated_at
    }

    SKILLS {
        int id PK
        string name UK
    }

    USER_SKILLS {
        uuid user_id FK
        int skill_id FK
    }

    LANGUAGES {
        int id PK
        string name UK
    }

    USER_LANGUAGES {
        uuid user_id FK
        int language_id FK
    }

    PORTFOLIO_IMAGES {
        int id PK
        uuid user_id FK
        text image_url
        string caption
        int sort_order
        timestamp created_at
    }

    REVIEWS {
        uuid id PK
        uuid reviewer_id FK
        uuid reviewed_user_id FK
        int rating
        text comment
        timestamp created_at
        timestamp updated_at
    }

    CONVERSATIONS {
        int id PK
        uuid user1_id FK
        uuid user2_id FK
        timestamptz created_at
        timestamptz updated_at
    }

    MESSAGES {
        int id PK
        int conversation_id FK
        uuid sender_id FK
        text content
        int offer_id FK
        timestamptz created_at
    }

    OFFERS {
        int id PK
        int conversation_id FK
        uuid sender_id FK
        uuid recipient_id FK
        string title
        numeric hourly_rate
        string status
        timestamptz created_at
    }

    JOBS {
        int id PK
        uuid client_id FK
        string title
        text description
        numeric budget
        string category
        string location
        string status
        timestamptz created_at
        timestamptz updated_at
    }

    JOB_BIDS {
        int id PK
        int job_id FK
        uuid freelancer_id FK
        text proposal
        numeric proposed_rate
        string status
        timestamptz created_at
    }

    USER_FAVORITES {
        uuid user_id FK
        uuid favorite_user_id FK
        timestamptz created_at
    }

    CV_ANALYSES {
        int id PK
        uuid user_id FK
        string original_filename
        string mime_type
        string file_hash
        text extracted_text
        int overall_score
        jsonb analysis_json
        timestamptz created_at
    }

    USERS ||--o{ USER_SKILLS : has
    SKILLS ||--o{ USER_SKILLS : assigned
    USERS ||--o{ USER_LANGUAGES : speaks
    LANGUAGES ||--o{ USER_LANGUAGES : assigned
    USERS ||--o{ PORTFOLIO_IMAGES : owns
    USERS ||--o{ REVIEWS : writes
    USERS ||--o{ REVIEWS : receives
    USERS ||--o{ CONVERSATIONS : user1
    USERS ||--o{ CONVERSATIONS : user2
    CONVERSATIONS ||--o{ MESSAGES : contains
    USERS ||--o{ MESSAGES : sends
    CONVERSATIONS ||--o{ OFFERS : contains
    OFFERS ||--o{ MESSAGES : linked_message
    USERS ||--o{ OFFERS : sends
    USERS ||--o{ OFFERS : receives
    USERS ||--o{ JOBS : posts
    JOBS ||--o{ JOB_BIDS : receives
    USERS ||--o{ JOB_BIDS : submits
    USERS ||--o{ USER_FAVORITES : owns
    USERS ||--o{ USER_FAVORITES : favorited
    USERS ||--o{ CV_ANALYSES : owns
```

## 5. State Models

### 5.1 Offer State Diagram

```mermaid
stateDiagram-v2
    [*] --> pending
    pending --> accepted: recipient accepts
    pending --> declined: recipient declines
    pending --> cancelled: sender cancels
    accepted --> in_progress: recipient starts progress
    in_progress --> completed: recipient marks done
    accepted --> [*]
    declined --> [*]
    cancelled --> [*]
    completed --> [*]
```

### 5.2 Job State Diagram

```mermaid
stateDiagram-v2
    [*] --> open
    open --> in_progress: owner accepts a bid
    in_progress --> completed: linked booking completed
    open --> cancelled: future cancellation/admin path
    in_progress --> cancelled: future cancellation/admin path
    completed --> [*]
    cancelled --> [*]
```

### 5.3 Bid State Diagram

```mermaid
stateDiagram-v2
    [*] --> pending
    pending --> accepted: job owner accepts
    pending --> rejected: job owner rejects
    pending --> rejected: another bid accepted
    accepted --> [*]
    rejected --> [*]
```

## 6. Activity Diagrams

### 6.1 Sign Up And Profile Setup

```mermaid
flowchart TD
    A[Open sign-up] --> B[Enter email and password or choose OAuth]
    B --> C{Clerk completes account?}
    C -->|Needs email verification| D[Enter email code]
    D --> C
    C -->|Missing username or required field| E[Enter missing field]
    E --> C
    C -->|Complete| F[Set active Clerk session]
    F --> G[Navigate to setup profile]
    G --> H[Wait for Clerk user]
    H --> I{User loaded?}
    I -->|No after timeout| J[Redirect to sign-in]
    I -->|Yes| K[Prefill name]
    K --> L[Enter profile details]
    L --> M{Required fields valid?}
    M -->|No| N[Show validation errors]
    N --> L
    M -->|Yes| O[Save profile fields]
    O --> P{Portfolio files selected?}
    P -->|Yes| Q[Upload portfolio images]
    P -->|No| R[Show success and navigate home]
    Q --> S{Upload success?}
    S -->|Yes| R
    S -->|No| T[Show partial success warning]
    T --> R
```

### 6.2 Browse, Favorite, And Contact Provider

```mermaid
flowchart TD
    A[Open browse] --> B[Frontend requests /api/users]
    B --> C[Backend returns available providers]
    C --> D[Render provider cards]
    D --> E[User changes search/filter]
    E --> F[Filter list client-side]
    F --> G{User action}
    G -->|Favorite| H[POST /api/favorites/users/:id]
    G -->|Unfavorite| I[DELETE /api/favorites/users/:id]
    G -->|View profile| J[Navigate to /profile/:id]
    H --> K[Patch card favorite state]
    I --> K
    J --> L[Load full profile]
    L --> M{Contact provider?}
    M -->|Yes| N[POST /api/messages/conversations]
    N --> O[Navigate to messages]
    M -->|No| P[Stay on profile]
```

### 6.3 Direct Booking Offer

```mermaid
flowchart TD
    A[Conversation participant opens chat] --> B[Load messages]
    B --> C[Subscribe to realtime messages and offers]
    C --> D[Client opens create offer modal]
    D --> E[Enter title and hourly rate]
    E --> F{Valid?}
    F -->|No| G[Disable or reject submit]
    F -->|Yes| H[POST /api/offers]
    H --> I[Backend inserts offer]
    I --> J[Backend inserts linked message]
    J --> K[Realtime delivers new message]
    K --> L[Recipient sees offer card]
    L --> M{Recipient decision}
    M -->|Accept| N[PATCH offer status accepted]
    M -->|Decline| O[PATCH offer status declined]
    N --> P[Booking becomes accepted]
    P --> Q[Recipient starts progress]
    Q --> R[PATCH offer status in_progress]
    R --> S[Recipient marks done]
    S --> T[PATCH offer status completed]
    O --> U[Booking becomes past declined]
```

### 6.4 Reverse Marketplace Job Flow

```mermaid
flowchart TD
    A[Client opens jobs] --> B[Post job modal]
    B --> C[Submit title, description, category, location, optional budget]
    C --> D[POST /api/jobs]
    D --> E[Job created as open]
    E --> F[Provider browses open jobs]
    F --> G[Provider submits proposal and rate]
    G --> H[POST /api/jobs/:id/bids]
    H --> I[Bid created as pending]
    I --> J[Client opens job details]
    J --> K[GET /api/jobs/:id/bids]
    K --> L{Decision}
    L -->|Reject| M[PATCH bid status rejected]
    L -->|Accept| N[PATCH bid status accepted]
    N --> O[Backend rejects other pending bids]
    O --> P[Backend sets job in_progress]
    P --> Q[Backend creates conversation]
    Q --> R[Backend creates accepted booking offer]
    R --> S[Backend inserts acceptance message]
    S --> T[Client navigates to messages with conversationId]
```

### 6.5 CV Analysis

```mermaid
flowchart TD
    A[User opens CV analyzer] --> B[GET /api/cv/my-analyses]
    B --> C[Display history]
    C --> D[User selects PDF or DOCX]
    D --> E[Optional target role and job description]
    E --> F[POST /api/cv/analyze]
    F --> G[Backend validates file]
    G --> H[Compute file hash]
    H --> I{Cached analysis exists?}
    I -->|Yes| J[Return cached result]
    I -->|No| K{PDF?}
    K -->|Yes| L[Send file to Gemini]
    K -->|No DOCX| M[Extract text with Mammoth]
    M --> N{Enough text?}
    N -->|No| O[Return 400 unreadable CV]
    N -->|Yes| P[Trim if needed]
    P --> Q[Send text to Gemini]
    L --> R[Normalize AI result]
    Q --> R
    R --> S[Save analysis]
    S --> T[Return score and feedback]
    J --> U[Frontend displays result]
    T --> U
    U --> V[Refresh history]
```

## 7. Sequence Diagrams

### 7.1 Authenticated API Call And User Sync

```mermaid
sequenceDiagram
    actor User
    participant FE as Angular Frontend
    participant Clerk as Clerk
    participant API as Express API
    participant DB as PostgreSQL

    User->>FE: Navigate to protected page
    FE->>Clerk: Wait for user/session
    Clerk-->>FE: Active user/session
    FE->>Clerk: session.getToken()
    Clerk-->>FE: JWT
    FE->>API: GET /api/profile/me with bearer token
    API->>Clerk: getAuth(req)
    API->>Clerk: clerkClient.users.getUser(clerkId)
    Clerk-->>API: Clerk user profile
    API->>DB: INSERT users ... ON CONFLICT(clerk_id) DO UPDATE
    DB-->>API: Local user id/email
    API-->>FE: { success: true, user }
    FE->>FE: Cache DB user id and profile image
```

### 7.2 Browse Providers

```mermaid
sequenceDiagram
    actor User
    participant FE as BrowseComponent
    participant Service as ProfileService
    participant API as Express API
    participant DB as PostgreSQL

    User->>FE: Open /browse
    FE->>Service: getUsers()
    Service->>API: GET /api/users
    API->>DB: Select available users excluding current user
    API->>DB: Select skills for returned users
    API->>DB: Select favorites for current user
    DB-->>API: User, skills, favorite rows
    API-->>Service: { success: true, users }
    Service-->>FE: users
    FE->>FE: Apply filters and render cards
```

### 7.3 Send Message With Realtime Update

```mermaid
sequenceDiagram
    actor Sender
    participant FE1 as Sender Angular
    participant API as Express API
    participant DB as PostgreSQL
    participant RT as Supabase Realtime
    participant FE2 as Recipient Angular

    Sender->>FE1: Type and send message
    FE1->>FE1: Add optimistic pending message
    FE1->>API: POST /api/messages/conversations/:id/messages
    API->>DB: Verify sender belongs to conversation
    API->>DB: Insert message
    API->>DB: Update conversation updated_at
    DB-->>RT: messages INSERT event
    API-->>FE1: { success: true, message }
    FE1->>FE1: Replace pending message with confirmed message
    RT-->>FE1: Realtime insert for active conversation
    RT-->>FE2: Realtime insert for inbox/active conversation
    FE2->>FE2: Update message list or conversation preview
```

### 7.4 Direct Offer Lifecycle

```mermaid
sequenceDiagram
    actor Client
    actor Provider
    participant ClientFE as Client Angular
    participant ProviderFE as Provider Angular
    participant API as Express API
    participant DB as PostgreSQL
    participant RT as Supabase Realtime

    Client->>ClientFE: Create offer in chat
    ClientFE->>API: POST /api/offers
    API->>DB: Verify conversation membership
    API->>DB: Insert offer pending
    API->>DB: Insert linked message with offer_id
    API-->>ClientFE: { success: true, offer }
    DB-->>RT: offers INSERT and messages INSERT
    RT-->>ProviderFE: New offer message

    Provider->>ProviderFE: Accept offer
    ProviderFE->>API: PATCH /api/offers/:id/status accepted
    API->>DB: Verify provider is recipient
    API->>DB: Verify pending -> accepted transition
    API->>DB: Update offer status
    API->>DB: Insert status message
    API-->>ProviderFE: { success: true, status: "accepted" }
    DB-->>RT: offers UPDATE and messages INSERT
    RT-->>ClientFE: Offer status update
```

### 7.5 Accept Job Bid

```mermaid
sequenceDiagram
    actor Client
    participant FE as JobDetailsComponent
    participant API as Express API
    participant DB as PostgreSQL

    Client->>FE: Click accept bid
    FE->>API: PATCH /api/jobs/:jobId/bids/:bidId/status accepted
    API->>DB: BEGIN
    API->>DB: Load bid and job
    DB-->>API: Bid/job data
    API->>API: Verify current user is job owner
    API->>API: Verify bid is pending
    API->>DB: Update selected bid accepted
    API->>DB: Reject other pending bids for job
    API->>DB: Set job status in_progress
    API->>DB: Create or reuse conversation
    API->>DB: Create accepted offer titled Job: <title>
    API->>DB: Insert acceptance message
    API->>DB: COMMIT
    API-->>FE: { success: true, status: "accepted", conversationId }
    FE->>FE: Update bid list locally
    FE->>FE: Navigate to /messages?conversationId=...
```

### 7.6 CV Analysis

```mermaid
sequenceDiagram
    actor User
    participant FE as CvAnalyzerPage
    participant API as Express API
    participant DB as PostgreSQL
    participant Extract as CV Extraction
    participant Gemini as Gemini

    User->>FE: Select file and click analyze
    FE->>API: POST /api/cv/analyze multipart form-data
    API->>API: Validate file type and size
    API->>API: Compute SHA-256 file hash
    API->>DB: Look for user/file hash cache
    alt Cached
        DB-->>API: Existing analysis
        API-->>FE: cached result
    else Not cached
        alt PDF
            API->>Gemini: Analyze inline file data
        else DOCX
            API->>Extract: Extract raw text with Mammoth
            Extract-->>API: Clean text
            API->>Gemini: Analyze text prompt
        end
        Gemini-->>API: JSON analysis
        API->>API: Normalize scores and arrays
        API->>DB: Insert cv_analyses row
        API-->>FE: new analysis result
    end
    FE->>FE: Display score, sections, suggestions, history
```

## 8. Data Flow Diagram

```mermaid
flowchart LR
    User[User]
    Angular[Angular UI]
    AuthInterceptor[Auth Interceptor]
    Express[Express API]
    Clerk[Clerk]
    Postgres[(PostgreSQL)]
    SupabaseStorage[(Supabase Storage)]
    SupabaseRealtime[Supabase Realtime]
    Gemini[Gemini]

    User -->|Forms, clicks, uploads| Angular
    Angular -->|Clerk SDK auth flows| Clerk
    Angular --> AuthInterceptor
    AuthInterceptor -->|Bearer token REST calls| Express
    Express -->|Verify auth and fetch user| Clerk
    Express -->|Profiles, jobs, offers, messages, reviews, favorites, CV history| Postgres
    Express -->|Portfolio file upload| SupabaseStorage
    Express -->|CV PDF/text prompt| Gemini
    Postgres -->|DB insert/update events| SupabaseRealtime
    SupabaseRealtime -->|Realtime messages/offers| Angular
    Express -->|JSON responses| Angular
    Angular -->|Rendered UI state| User
```
