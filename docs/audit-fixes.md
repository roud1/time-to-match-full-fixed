# Audit Fixes — Time to Match

Summary of changes implemented from the full repository audit (June 2025).

## Phase 1 — Critical blockers

| ID | Fix | Status |
|----|-----|--------|
| C1 | `profile_expires_at = now() + 72h` on register (`api/handlers/v1/auth/register`, `server/repositories/users`) | Done |
| C2 | Server profile life sync (`server/profile-life/service.ts`, `POST /api/profile/activity`, `client/lib/profile-life-store.ts`) | Done |
| C3/C5 | Premium rewind via `POST /api/discover/rewind` + `swipe-deck.tsx` API wiring | Done |
| C4 | Block `ttm_demo_session` when `NODE_ENV=production` or `DATABASE_URL` set | Done |
| C5 | Cron auth requires `CRON_SECRET` when DB configured (`server/cron-auth.ts`) | Done |
| H2 | `BOND_MESSAGES_PER_PROLONG = 5` | Done |
| H3 | Stripe webhook saves `currentPeriodEnd` from subscription on checkout | Done |
| H4 | Photo URL allowlist via `PHOTO_CDN_HOST` / `S3_PUBLIC_URL` | Done |
| H6 | E2E: `tests/e2e/discover-visibility.spec.ts` | Done |
| — | `scripts/db-migrate.mjs` loads `.env.local` | Already present |

## Phase 2 — Monetization

| Item | Status |
|------|--------|
| Premium $14.99 / VIP $29.99 (`config/stripe.ts`, env `STRIPE_*_CENTS`) | Done |
| VIP: super-likes (5/day), ranking boost, freeze grant on subscribe | Done |
| Super-like server semantics (`superLike` on like API, `is_super` column) | Done |
| Incoming likes: free teasers (blurred images) + count | Done |
| Analytics: `paywall_view`, `checkout_start`, `purchase` | Done |
| Boost: unchanged (premium still gets free boost activation) | Kept as-is |

## Phase 3 — UX conversion

| Item | Status |
|------|--------|
| Match celebration: primary CTA + 24h countdown | Done |
| Discover gate: photo + gender + city required | Done |
| Likes panel: blurred teaser cards from API | Done |
| First match guided templates | Already existed (`match-celebration-screen`) |

## Phase 4 — Backend scalability (subset)

| Item | Status |
|------|--------|
| Discover keyset pagination (`cursor`, `limit`, `nextCursor`) | Done |
| Upstash documented in `docs/mvp-launch.md` | Done |
| AI analysis cron → every 5 min (`vercel.json`) | Done |

## Phase 5 — Refactor (minimal)

| Item | Status |
|------|--------|
| Match ID dual model (`likes.id` vs `matches.id`) | **Deferred** — documented risk; full migration too large |
| Emotional OS behind `NEXT_PUBLIC_TTM_EMOTIONAL_OS=1` | Done |

## Deferred / next pass

- Unify client `matchId` on `matches.id` (DB migration + client sweep)
- `match_stats` FK → `matches.id`
- Upstash Redis enforcement at startup (warning only today)
- Consumable Stripe packs (super-like / freeze bundles)
- Annual plan / trial
- Remove legacy `conversations` / `messages` tables
- `social-store.ts` server-first refactor
- Email verification gate

## New env vars

| Variable | Purpose |
|----------|---------|
| `PHOTO_CDN_HOST` | Comma-separated allowed photo CDN host(s) |
| `STRIPE_PREMIUM_CENTS` | Override Premium price (default 1499) |
| `STRIPE_VIP_CENTS` | Override VIP price (default 2999) |
| `NEXT_PUBLIC_TTM_EMOTIONAL_OS` | Set `1` to enable emotional/reality UI layer |

## Migration

Run `npm run db:migrate` to apply `028_audit_fixes.sql` (`is_super`, `user_daily_super_likes`).
