# Backend Structure

This Express backend is organized by API layer: routes define URLs, controllers handle request logic, middleware handles cross-cutting request behavior, services hold reusable business integrations, config holds infrastructure setup, and migrations define the database schema.

## Folder Overview

| Folder | Purpose |
| --- | --- |
| `src/config/` | Database, Supabase, migration, and Swagger configuration. |
| `src/controllers/` | Express request handlers for each API domain. |
| `src/middleware/` | Shared Express middleware for auth and error handling. |
| `src/migrations/sql/` | SQL schema and data migration files. |
| `src/models/` | Backend TypeScript data models. |
| `src/routes/` | Express route definitions grouped by feature. |
| `src/services/` | Reusable service logic for CV extraction and analysis. |

## Root Files

| File | What it has and does |
| --- | --- |
| `server.ts` | Creates and starts the Express app, mounts middleware, routes, docs, and error handling. |
| `package.json` | Backend dependencies, npm scripts, and project metadata. |
| `package-lock.json` | Locked dependency versions for reproducible installs. |
| `tsconfig.json` | TypeScript compiler configuration for the backend. |
| `nodemon.json` | Nodemon configuration for local backend development. |
| `vercel.json` | Vercel deployment routing and build configuration. |

## Config

| File | What it has and does |
| --- | --- |
| `src/config/db.ts` | Creates and exports the PostgreSQL connection pool. |
| `src/config/migrate.ts` | Runs SQL migration files against the database. |
| `src/config/supabase.ts` | Creates and exports the Supabase client for backend storage/API use. |
| `src/config/swagger.ts` | Configures Swagger/OpenAPI documentation for backend routes. |

## Middleware

| File | What it has and does |
| --- | --- |
| `src/middleware/auth.ts` | Verifies authentication, syncs Clerk users with the database, and attaches the DB user to requests. |
| `src/middleware/errorHandler.ts` | Formats thrown backend errors into consistent HTTP responses. |

## Routes

| File | What it has and does |
| --- | --- |
| `src/routes/index.ts` | Combines all feature routers under the main API router. |
| `src/routes/cv.routes.ts` | Defines CV upload and analysis endpoints. |
| `src/routes/favorites.routes.ts` | Defines endpoints for favorite users. |
| `src/routes/jobs.routes.ts` | Defines job, bid, and bid status endpoints. |
| `src/routes/messages.routes.ts` | Defines conversation and message endpoints. |
| `src/routes/offers.routes.ts` | Defines chat offer creation, update, cancel, and lookup endpoints. |
| `src/routes/profile.routes.ts` | Defines profile, portfolio, skills, image, and user profile endpoints. |
| `src/routes/reviews.routes.ts` | Defines review creation and review lookup endpoints. |
| `src/routes/users.routes.ts` | Defines user browsing and lookup endpoints. |

## Controllers

| File | What it has and does |
| --- | --- |
| `src/controllers/cv.controller.ts` | Handles CV uploads, extraction, analysis storage, and retrieval. |
| `src/controllers/favorites.controller.ts` | Handles listing, adding, and removing favorite users. |
| `src/controllers/jobs.controller.ts` | Handles job posting, job listing, bid creation, bid status updates, and opening conversations after accepted bids. |
| `src/controllers/messages.controller.ts` | Handles conversation listing, message history, sending messages, and creating conversations. |
| `src/controllers/offers.controller.ts` | Handles job offers inside conversations and creates system messages for offer state changes. |
| `src/controllers/profile.controller.ts` | Handles profile reads, updates, images, portfolio, skills, and profile-related user data. |
| `src/controllers/reviews.controller.ts` | Handles review creation and review retrieval for users. |
| `src/controllers/users.controller.ts` | Handles public user discovery and user profile lookup helpers. |

## Services

| File | What it has and does |
| --- | --- |
| `src/services/cv-analysis.service.ts` | Sends extracted CV text to the analysis provider and normalizes the returned analysis. |
| `src/services/cv-extraction.service.ts` | Extracts text from uploaded CV files before analysis. |

## Models

| File | What it has and does |
| --- | --- |
| `src/models/job.model.ts` | TypeScript interfaces for backend job and bid data. |

## SQL Migrations

| File | What it has and does |
| --- | --- |
| `src/migrations/sql/001_create_users.sql` | Creates the core `users` table. |
| `src/migrations/sql/002_seed_dummy_users.sql` | Inserts sample users for local/demo data. |
| `src/migrations/sql/003_create_reviews.sql` | Creates review tables and relationships. |
| `src/migrations/sql/004_add_cover_image.sql` | Adds cover image support to user profiles. |
| `src/migrations/sql/005_create_messages.sql` | Creates conversations and messages tables plus indexes. |
| `src/migrations/sql/006_create_offers.sql` | Creates offers linked to conversations. |
| `src/migrations/sql/007_add_offer_id_to_messages.sql` | Links messages to offers with an `offer_id` column. |
| `src/migrations/sql/008_update_offer_statuses.sql` | Updates the allowed offer statuses. |
| `src/migrations/sql/009_add_clerk_id.sql` | Adds Clerk identity mapping to users. |
| `src/migrations/sql/010_create_jobs.sql` | Creates jobs and bids tables. |
| `src/migrations/sql/011_create_cv_analyses.sql` | Creates storage for saved CV analyses. |
| `src/migrations/sql/012_create_user_favorites.sql` | Creates the user favorites table. |
