# Mobile: guest vs login access

Guests can browse everything public. An account is required only where the app stores
personal data, accepts a contribution, or acts for a business. The single source of truth in
code is `FEATURES` in `apps/mobile/src/features/catalogue.ts`; login-only screens are wrapped
in `LoginGate` (`apps/mobile/src/session/LoginGate.tsx`), which also covers deep links. Guests
who hit a login-only action go to login and come back to the same screen afterwards.

The UI rules are a convenience only: the backend must enforce the same rules on every
endpoint (authorization is never trusted to the client).

## Rules

| Feature                                 | Guest | Logged in | Why                                       |
| --------------------------------------- | ----- | --------- | ----------------------------------------- |
| Search, categories, listing details     | Yes   | Yes       | Public discovery                          |
| Emergency contacts                      | Yes   | Yes       | Safety: **never** gated behind login      |
| Tourist places                          | Yes   | Yes       | Public discovery                          |
| Map view (coming soon)                  | Yes   | Yes       | Public discovery                          |
| AI assistant (coming soon)              | Yes   | Yes       | Rate limits stricter for guests (backend) |
| Trip planner (coming soon)              | View  | Save      | Saved plans are personal data             |
| Recently viewed                         | Yes   | Yes       | Stored on the device only                 |
| Favourites (save a place)               | No    | Yes       | Synced across devices to the account      |
| Write a review                          | No    | Yes       | Accountability, spam control              |
| Report wrong information                | No    | Yes       | Abuse control, follow-up                  |
| Register a business                     | No    | Yes       | Owner identity, verification              |
| Business dashboard (views, call clicks) | No    | Yes       | Owner-only analytics                      |
| Profile, edit profile                   | No    | Yes       | Personal data                             |
| Language, theme, text size settings     | Yes   | Yes       | Device preferences                        |

## Suggested later login features

- Claim an existing listing (owner verification).
- Notifications: listing approved, reply to your review, saved place changed hours.
- Contribution history (my reviews, my reports and their status).
- Saved trip plans and offline download of saved places.
