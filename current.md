# Current Feature: Favorites (Saved Freelancers)

## Goal
Implement saved freelancers so a logged-in user can:
- Favorite/unfavorite users from browse cards (heart button).
- Open a Favorites section from profile page.
- View favorited users inside a scrollable Angular Material modal.

## Execution Plan
- [x] Add backend DB support (`user_favorites` migration).
- [x] Add backend API routes/controllers for favorites list/add/remove.
- [x] Include `isFavorited` in browse users API for authenticated user.
- [x] Add frontend favorites service for API calls.
- [x] Wire browse card heart button to add/remove favorites.
- [x] Add profile sidebar action to open favorites modal.
- [x] Build scrollable Angular Material favorites modal with user cards.
- [x] Verify backend TypeScript build passes.
- [x] Verify frontend build passes (development config).

## Verification Checklist
- [ ] Heart toggle persists after page refresh.
- [ ] Favorites modal opens from profile page.
- [ ] Modal lists only favorited users.
- [ ] Unfavorite from modal updates list immediately.
- [ ] No regression in browse/profile navigation.

## Build Notes
- `Backend`: `npm run build` passes.
- `Frontend`: `ng build --configuration development` passes.
- `Frontend`: production `npm run build` still fails due existing bundle budget limits unrelated to this feature.

## Notes
- Keep Angular Material usage where it reduces custom UI work (dialog/buttons/spinner).
- This file will be updated for each future feature cycle.
- Scope for this cycle: saved freelancers (user cards). Saved jobs can be added in the next cycle.
