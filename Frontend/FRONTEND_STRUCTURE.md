# Frontend Structure

This Angular app is organized by feature: route pages live in `src/app/pages`, reusable UI lives in `src/app/components`, shared API/state logic lives in `src/app/services`, and typed data contracts live in `src/app/models`.

## Folder Overview

| Folder | Purpose |
| --- | --- |
| `public/` | Static public files copied directly by Angular, such as the favicon. |
| `src/` | Main Angular source code, global styles, app bootstrap, and assets. |
| `src/app/` | Root app component, app configuration, routes, guards, interceptors, services, models, pages, and components. |
| `src/app/components/` | Reusable UI components grouped by feature area. |
| `src/app/pages/` | Top-level routed screens. |
| `src/app/services/` | Injectable services for backend APIs, realtime chat, auth, filters, Supabase, and browser/location helpers. |
| `src/app/models/` | TypeScript interfaces and shared constants used across components and services. |
| `src/assets/` | Images, icons, logos, and other bundled frontend assets. |
| `src/environments/` | Environment-specific frontend configuration values. |
| `src/types/` | Project-specific TypeScript declaration files. |

## Root Files

| File | What it has and does |
| --- | --- |
| `README.md` | Default Angular project notes and commands. |
| `package.json` | Frontend dependencies, npm scripts, and project metadata. |
| `package-lock.json` | Locked dependency versions for reproducible installs. |
| `angular.json` | Angular CLI build, serve, asset, and style configuration. |
| `tsconfig.json` | Base TypeScript compiler configuration for the frontend. |
| `tsconfig.app.json` | TypeScript settings used for the Angular application build. |
| `tsconfig.spec.json` | TypeScript settings used for frontend tests. |

## Bootstrap And App Shell

| File | What it has and does |
| --- | --- |
| `public/favicon.ico` | Browser tab icon for the frontend app. |
| `src/index.html` | Root HTML document where Angular mounts the app. |
| `src/main.ts` | Bootstraps the standalone Angular application. |
| `src/styles.css` | Global CSS shared across the whole frontend. |
| `src/types/clerk.d.ts` | Type declarations for Clerk globals used by auth code. |
| `src/app/app.ts` | Root Angular app component class. |
| `src/app/app.html` | Root app template that hosts routed content. |
| `src/app/app.css` | Root app component styles. |
| `src/app/app.config.ts` | Global Angular providers, routing, HTTP, animations, and app-level configuration. |
| `src/app/app.routes.ts` | Frontend route definitions and route guards. |

## Environments

| File | What it has and does |
| --- | --- |
| `src/environments/environment.ts` | Production frontend URLs, API URL, and Supabase settings. |
| `src/environments/environment.development.ts` | Local development frontend URLs, API URL, and Supabase settings. |

## Guards And Interceptors

| File | What it has and does |
| --- | --- |
| `src/app/guards/auth.guard.ts` | Allows access only for authenticated users. |
| `src/app/guards/guest.guard.ts` | Redirects signed-in users away from guest-only pages. |
| `src/app/interceptors/auth.interceptor.ts` | Attaches auth tokens to outgoing backend API requests. |

## Models

| File | What it has and does |
| --- | --- |
| `src/app/models/auth.model.ts` | Auth request and response interfaces. |
| `src/app/models/available-locations.ts` | Shared list of selectable locations. |
| `src/app/models/bookings.model.ts` | Booking and booking history data shapes. |
| `src/app/models/category-option.model.ts` | Category option types used by filters and browse UI. |
| `src/app/models/cv-analysis.model.ts` | CV upload and analysis response interfaces. |
| `src/app/models/filter-criteria.model.ts` | Shared browse filter criteria shape. |
| `src/app/models/job.model.ts` | Job, bid, and job status interfaces. |
| `src/app/models/message.model.ts` | Conversation, chat message, chat contact, and offer interfaces. |
| `src/app/models/profile.model.ts` | User profile, portfolio, skill, and profile update shapes. |
| `src/app/models/review.model.ts` | Review data interfaces. |
| `src/app/models/user-card.model.ts` | Compact user card data used in browse results. |

## Services

| File | What it has and does |
| --- | --- |
| `src/app/services/auth.service.ts` | Handles Clerk auth state, backend user lookup, profile image state, tokens, and logout. |
| `src/app/services/chat.service.ts` | Handles conversation APIs and Supabase realtime message/offer subscriptions. |
| `src/app/services/cv-analyzer.service.ts` | Calls backend CV upload and analysis endpoints. |
| `src/app/services/favorites.service.ts` | Reads, adds, and removes favorite users. |
| `src/app/services/filter.service.ts` | Shares browse filter state between components. |
| `src/app/services/job.service.ts` | Calls job, bid, and bid status backend endpoints. |
| `src/app/services/location.service.ts` | Manages browser geolocation and location persistence. |
| `src/app/services/offer.service.ts` | Creates, reads, and updates chat job offers. |
| `src/app/services/profile.service.ts` | Reads and updates profiles, reviews, portfolio, skills, and profile images. |
| `src/app/services/supabase.service.ts` | Creates and exposes the Supabase client. |

## Pages

| File | What it has and does |
| --- | --- |
| `src/app/pages/auth/auth.ts` | Auth page component logic for sign-in/sign-up UI. |
| `src/app/pages/auth/auth.html` | Auth page template. |
| `src/app/pages/auth/auth.css` | Auth page styling. |
| `src/app/pages/bookings-history/bookings-history.ts` | Booking history page logic and state. |
| `src/app/pages/bookings-history/bookings-history.html` | Booking history page template. |
| `src/app/pages/bookings-history/bookings-history.css` | Booking history page styling. |
| `src/app/pages/browse/browse.ts` | Browse page logic for finding users with filters. |
| `src/app/pages/browse/browse.html` | Browse page template. |
| `src/app/pages/browse/browse.css` | Browse page styling. |
| `src/app/pages/cv-analyzer/cv-analyzer.ts` | CV analyzer page upload and analysis logic. |
| `src/app/pages/cv-analyzer/cv-analyzer.html` | CV analyzer page template. |
| `src/app/pages/cv-analyzer/cv-analyzer.css` | CV analyzer page styling. |
| `src/app/pages/home/home.ts` | Home page logic and composition of home sections. |
| `src/app/pages/home/home.html` | Home page template. |
| `src/app/pages/home/home.css` | Home page styling. |
| `src/app/pages/job-details/job-details.component.ts` | Job detail page logic for viewing jobs, bidding, and messaging bidders. |
| `src/app/pages/job-details/job-details.component.html` | Job detail page template. |
| `src/app/pages/job-details/job-details.component.css` | Job detail page styling. |
| `src/app/pages/jobs/jobs.component.ts` | Jobs listing page logic for browsing and posting jobs. |
| `src/app/pages/jobs/jobs.component.html` | Jobs listing page template. |
| `src/app/pages/jobs/jobs.component.css` | Jobs listing page styling. |
| `src/app/pages/messages/messages.ts` | Messages page logic for conversations, realtime messages, and offers. |
| `src/app/pages/messages/messages.html` | Messages page layout with sidebar, chat header, message list, and input. |
| `src/app/pages/messages/messages.css` | Messages page responsive layout and styling. |
| `src/app/pages/profile/profile.ts` | Profile page logic for viewing a user's public profile. |
| `src/app/pages/profile/profile.html` | Profile page template. |
| `src/app/pages/profile/profile.css` | Profile page styling. |
| `src/app/pages/setup-profile/setup-profile.ts` | Profile setup page logic for first-time profile creation. |
| `src/app/pages/setup-profile/setup-profile.html` | Profile setup page template. |
| `src/app/pages/setup-profile/setup-profile.css` | Profile setup page styling. |
| `src/app/pages/sso-callback/sso-callback.ts` | Handles SSO callback flow after external authentication. |

## Components - Common

| File | What it has and does |
| --- | --- |
| `src/app/components/common/top-bar/top-bar.component.ts` | Shared top navigation logic and auth/profile menu state. |
| `src/app/components/common/top-bar/top-bar.component.html` | Shared top navigation template. |
| `src/app/components/common/top-bar/top-bar.component.css` | Shared top navigation styling. |

## Components - Home

| File | What it has and does |
| --- | --- |
| `src/app/components/home/categories/categories.component.ts` | Home category section logic. |
| `src/app/components/home/categories/categories.component.html` | Home category section template. |
| `src/app/components/home/categories/categories.component.css` | Home category section styling. |
| `src/app/components/home/cta-footer/cta-footer.component.ts` | Home call-to-action footer logic. |
| `src/app/components/home/cta-footer/cta-footer.component.html` | Home call-to-action footer template. |
| `src/app/components/home/cta-footer/cta-footer.component.css` | Home call-to-action footer styling. |
| `src/app/components/home/hero/hero.component.ts` | Home hero section logic. |
| `src/app/components/home/hero/hero.component.html` | Home hero section template. |
| `src/app/components/home/hero/hero.component.css` | Home hero section styling. |
| `src/app/components/home/process/process.component.ts` | Home process section logic. |
| `src/app/components/home/process/process.component.html` | Home process section template. |
| `src/app/components/home/process/process.component.css` | Home process section styling. |

## Components - Browse

| File | What it has and does |
| --- | --- |
| `src/app/components/browse/side-bar/side-bar.component.ts` | Browse filter sidebar logic. |
| `src/app/components/browse/side-bar/side-bar.component.html` | Browse filter sidebar template. |
| `src/app/components/browse/side-bar/side-bar.component.css` | Browse filter sidebar styling. |
| `src/app/components/browse/side-bar/category-data.ts` | Static category data for browse filters. |
| `src/app/components/browse/user-card/user-card.component.ts` | Browse user result card logic. |
| `src/app/components/browse/user-card/user-card.component.html` | Browse user result card template. |
| `src/app/components/browse/user-card/user-card.component.css` | Browse user result card styling. |

## Components - Jobs

| File | What it has and does |
| --- | --- |
| `src/app/components/jobs/bid-modal/bid-modal.component.ts` | Bid modal form logic. |
| `src/app/components/jobs/bid-modal/bid-modal.component.html` | Bid modal template. |
| `src/app/components/jobs/bid-modal/bid-modal.component.css` | Bid modal styling. |
| `src/app/components/jobs/job-card/job-card.component.ts` | Job card display and action logic. |
| `src/app/components/jobs/job-card/job-card.component.html` | Job card template. |
| `src/app/components/jobs/job-card/job-card.component.css` | Job card styling. |
| `src/app/components/jobs/post-job-modal/post-job-modal.component.ts` | Post job modal form logic. |
| `src/app/components/jobs/post-job-modal/post-job-modal.component.html` | Post job modal template. |
| `src/app/components/jobs/post-job-modal/post-job-modal.component.css` | Post job modal styling. |

## Components - Messages

| File | What it has and does |
| --- | --- |
| `src/app/components/messages/chat-header/chat-header.component.ts` | Chat header logic for the active conversation contact. |
| `src/app/components/messages/chat-header/chat-header.component.html` | Chat header template. |
| `src/app/components/messages/chat-header/chat-header.component.css` | Chat header styling. |
| `src/app/components/messages/chat-messages/chat-messages.component.ts` | Chat message list rendering logic and offer actions. |
| `src/app/components/messages/chat-messages/chat-messages.component.html` | Chat message list template with normal and offer messages. |
| `src/app/components/messages/chat-messages/chat-messages.component.css` | Chat message list styling. |
| `src/app/components/messages/conversation-list/conversation-list.component.ts` | Conversation sidebar list logic and selection output. |
| `src/app/components/messages/conversation-list/conversation-list.component.html` | Conversation sidebar list template. |
| `src/app/components/messages/conversation-list/conversation-list.component.css` | Conversation sidebar list styling. |
| `src/app/components/messages/create-offer-modal/create-offer-modal.component.ts` | Create offer modal form logic. |
| `src/app/components/messages/create-offer-modal/create-offer-modal.component.html` | Create offer modal template. |
| `src/app/components/messages/create-offer-modal/create-offer-modal.component.css` | Create offer modal styling. |
| `src/app/components/messages/message-input/message-input.component.ts` | Chat input logic for text, emoji, and sending messages. |
| `src/app/components/messages/message-input/message-input.component.html` | Chat input template. |
| `src/app/components/messages/message-input/message-input.component.css` | Chat input styling. |

## Components - Profile

| File | What it has and does |
| --- | --- |
| `src/app/components/profile/about/profile-about.component.ts` | Profile about section logic. |
| `src/app/components/profile/about/profile-about.component.html` | Profile about section template. |
| `src/app/components/profile/about/profile-about.component.css` | Profile about section styling. |
| `src/app/components/profile/banner/profile-banner.component.ts` | Profile banner, cover image, and summary logic. |
| `src/app/components/profile/banner/profile-banner.component.html` | Profile banner template. |
| `src/app/components/profile/banner/profile-banner.component.css` | Profile banner styling. |
| `src/app/components/profile/edit-profile-dialog/edit-profile-dialog.component.ts` | Edit profile dialog form logic. |
| `src/app/components/profile/edit-profile-dialog/edit-profile-dialog.component.html` | Edit profile dialog template. |
| `src/app/components/profile/edit-profile-dialog/edit-profile-dialog.component.css` | Edit profile dialog styling. |
| `src/app/components/profile/favorites-dialog/favorite-users-dialog.component.ts` | Favorite users dialog logic. |
| `src/app/components/profile/favorites-dialog/favorite-users-dialog.component.html` | Favorite users dialog template. |
| `src/app/components/profile/favorites-dialog/favorite-users-dialog.component.css` | Favorite users dialog styling. |
| `src/app/components/profile/portfolio/profile-portfolio.component.ts` | Profile portfolio section logic. |
| `src/app/components/profile/portfolio/profile-portfolio.component.html` | Profile portfolio section template. |
| `src/app/components/profile/portfolio/profile-portfolio.component.css` | Profile portfolio section styling. |
| `src/app/components/profile/reviews/profile-reviews.component.ts` | Profile reviews section logic and review submission. |
| `src/app/components/profile/reviews/profile-reviews.component.html` | Profile reviews section template. |
| `src/app/components/profile/reviews/profile-reviews.component.css` | Profile reviews section styling. |
| `src/app/components/profile/sidebar/profile-sidebar.component.ts` | Profile sidebar logic for contact, favorites, and user info. |
| `src/app/components/profile/sidebar/profile-sidebar.component.html` | Profile sidebar template. |
| `src/app/components/profile/sidebar/profile-sidebar.component.css` | Profile sidebar styling. |
| `src/app/components/profile/skills-languages/profile-skills-languages.component.ts` | Profile skills and languages section logic. |
| `src/app/components/profile/skills-languages/profile-skills-languages.component.html` | Profile skills and languages section template. |
| `src/app/components/profile/skills-languages/profile-skills-languages.component.css` | Profile skills and languages section styling. |

## Components - Bookings History

| File | What it has and does |
| --- | --- |
| `src/app/components/bookings-history/booking-card/booking-card.component.ts` | Booking card display logic. |
| `src/app/components/bookings-history/booking-card/booking-card.component.html` | Booking card template. |
| `src/app/components/bookings-history/booking-card/booking-card.component.css` | Booking card styling. |
| `src/app/components/bookings-history/booking-tabs/booking-tabs.component.ts` | Booking status tabs logic. |
| `src/app/components/bookings-history/booking-tabs/booking-tabs.component.html` | Booking status tabs template. |
| `src/app/components/bookings-history/booking-tabs/booking-tabs.component.css` | Booking status tabs styling. |
| `src/app/components/bookings-history/help-banner/help-banner.component.ts` | Booking help banner logic. |
| `src/app/components/bookings-history/help-banner/help-banner.component.html` | Booking help banner template. |
| `src/app/components/bookings-history/help-banner/help-banner.component.css` | Booking help banner styling. |
| `src/app/components/bookings-history/stats-cards/stats-cards.component.ts` | Booking statistics card logic. |
| `src/app/components/bookings-history/stats-cards/stats-cards.component.html` | Booking statistics card template. |
| `src/app/components/bookings-history/stats-cards/stats-cards.component.css` | Booking statistics card styling. |

## Assets

| File | What it has and does |
| --- | --- |
| `src/assets/hero.png` | Home page hero image asset. |
| `src/assets/logo/logo.png` | Main Wazefne logo image. |
| `src/assets/login/login-image.png` | Auth page visual image. |
| `src/assets/icons/availability.svg` | Availability filter icon. |
| `src/assets/icons/category.svg` | Category filter icon. |
| `src/assets/icons/google-color.svg` | Google brand icon for auth UI. |
| `src/assets/icons/heart.svg` | Favorite or like icon. |
| `src/assets/icons/location.svg` | Location icon. |
| `src/assets/icons/microsoft-color.svg` | Microsoft brand icon for auth UI. |
| `src/assets/icons/price-range.svg` | Price range filter icon. |
| `src/assets/icons/profile.svg` | Profile icon. |
| `src/assets/icons/rating.svg` | Rating filter icon. |
| `src/assets/icons/search.svg` | Search icon. |
| `src/assets/icons/star.svg` | Star rating icon. |
| `src/assets/icons/wazefne.svg` | Wazefne icon asset. |
