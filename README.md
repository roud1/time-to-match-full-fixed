# Time to Match

A cinematic dating app built with **Next.js 16** (App Router), optional **PostgreSQL**, and real-time match/chat mechanics. Matches expire in 24 hours — use them or lose them.

## Modes

| Mode | When | Behavior |
|------|------|----------|
| **Demo** | `DATABASE_URL` empty | localStorage-only auth, discover deck, and chat — no server persistence |
| **Production** | `DATABASE_URL` + `AUTH_SECRET` set | Real auth, likes/matches, chat, cron jobs, notifications |

Check mode anytime: `GET /api/ready` → `{ mode: "demo" \| "production", database, auth }`.

## Quick start

### Demo (no database)

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production locally

```bash
npm install
npm run db:setup    # Docker Postgres + .env.local + migrations
npm run dev
curl http://localhost:3000/api/ready
```

Or manually: `docker compose up -d`, copy `.env.example` → `.env.local`, set `DATABASE_URL` and `AUTH_SECRET`, then `npm run db:migrate`.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm run format` | Prettier write |
| `npm run typecheck` | TypeScript (`tsc --noEmit`) |
| `npm run test:e2e` | Playwright smoke tests |
| `npm run db:migrate` | Apply SQL migrations |
| `npm run db:setup` | Docker Postgres + migrate + `.env.local` |
| `npm run db:cleanup` | Delete expired profiles/messages |
| `npm run check:env` | Validate env vars |
| `npm run check:env:strict` | Fail on missing required production vars |
| `node scripts/smoke-test.mjs` | Post-deploy smoke test (register, discover, APIs) |

## Environment variables

Copy `.env.example` to `.env.local`. Required for production:

- `DATABASE_URL` — PostgreSQL connection string
- `AUTH_SECRET` — session JWT secret (≥32 chars)
- `NEXT_PUBLIC_APP_URL` — canonical public URL
- `CRON_SECRET` — protects `/api/v1/cron/*` routes
- `ADMIN_API_KEY` — protects admin APIs and the `/admin` reports UI (≥8 chars; sent as `x-admin-key` header)

Optional integrations (see `.env.example` for full list):

- **Sentry** — `SENTRY_DSN` for error tracking (no-op if unset)
- **Upstash Redis** — `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` for shared rate limits
- **Resend** — `RESEND_API_KEY` for expiry emails and password reset
- **Web Push** — `VAPID_*` keys for push notifications (generate via `node scripts/generate-vapid-keys.mjs`)

## Deployment

See **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** for Vercel, Render, Railway, and Docker deploy steps.

### Production env checklist

Run **`npm run check:env:strict`** with production env (`NODE_ENV=production` or hosted flags) before every deploy. It fails on missing required vars and warns on weak secrets.

| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE_URL` | **Yes** | PostgreSQL connection string (pooled URL on serverless). Without it the app runs in **demo mode**. |
| `AUTH_SECRET` | **Yes** | Session JWT secret — `openssl rand -base64 32`, ≥32 chars when `DATABASE_URL` is set. |
| `NEXT_PUBLIC_APP_URL` | **Yes** (hosted) | Canonical `https://your-domain` for OG, sitemap, PWA, and Stripe redirects. |
| `CRON_SECRET` | **Yes** (hosted) | Protects `/api/v1/cron/*`; Vercel Cron sends `Authorization: Bearer …`. |
| `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` | **Yes** (Vercel prod) | Shared rate limits and realtime state across instances. |
| `ADMIN_API_KEY` | Recommended | Protects `/admin` and admin APIs (`x-admin-key` header). |
| `SENTRY_DSN` | Optional | Error tracking via `@sentry/nextjs` (no-op if unset). |
| `RESEND_API_KEY` + `RESEND_FROM_EMAIL` | Optional | Match-expiry email and password reset. |
| `VAPID_*` / `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Optional | Web Push notifications (`node scripts/generate-vapid-keys.mjs`). |
| `S3_*` | Optional | Presigned photo uploads (R2/S3); base64 fallback in demo. |
| `STRIPE_*` | Optional | Premium/VIP billing when keys are set. |
| `OPENROUTER_API_KEY` | Optional | Server-only AI (connection analysis, Pulse chat). |

**Deploy steps:**

1. Copy `.env.example` → set required vars on your host (Production + Preview as needed).
2. `NODE_ENV=production npm run check:env:strict` — fix all errors before shipping.
3. `npm run db:migrate` against production Postgres (safe to re-run; tracks applied files).
4. `npm run build` (CI also runs lint, typecheck, Playwright `@db` tests when Postgres is available).
5. Verify `curl https://your-domain/api/ready` → `mode: "production"`, `database: "ok"`, `auth: "ok"`.
6. `BASE_URL=https://your-domain node scripts/smoke-test.mjs` — register, discover, core APIs.

Cron routes (protected by `CRON_SECRET`):

- `POST /api/v1/cron/expire-matches` — every minute
- `POST /api/v1/cron/notify` — every 15 minutes (email + push expiry alerts)
- `POST /api/v1/cron/cleanup` — weekly DB cleanup (expired profiles/messages)

## Notifications

Expiry and new-match notifications are handled by `/api/v1/cron/notify`:

1. **Email** — requires `RESEND_API_KEY` + `RESEND_FROM_EMAIL` (match expiry + new match)
2. **Web Push** — requires `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, and user push subscriptions

New matches enqueue immediate `new_match` notifications for both users when a mutual like occurs (production DB).

Without these env vars, the cron still runs but skips unconfigured channels (logged, not fatal). Demo mode without keys is a no-op.

## Moderation

- **Report** — `POST /api/v1/report` (production DB; localStorage fallback in demo)
- **Block** — `GET/POST /api/v1/block` — hides user from discover, expires active match
- **Unmatch** — `POST /api/matches/:id/unmatch` — expire match without blocking (chat safety menu)
- **Admin** — `GET /api/admin/reports` and `PUT /api/admin/verification/:id` with `x-admin-key` when `ADMIN_API_KEY` is set
- Reports are stored in the `reports` table for admin review
- **Admin UI** — open [`/admin`](http://localhost:3000/admin), enter your `ADMIN_API_KEY` (stored in `sessionStorage` for the tab only; never bundled in client code)

## Analytics funnel

Client events fire to `POST /api/v1/analytics/event` via `trackEvent()` (server logs + Vercel Analytics in production):

**Core funnel:** `register`, `login`, `swipe_like`, `swipe_pass`, `match_created`, `message_sent`, `match_expired`

**Once-per-user milestones:** `register_complete`, `profile_complete`, `first_swipe`, `first_match`, `first_message`

Set `NEXT_PUBLIC_ANALYTICS_DISABLED=1` to silence beacons in local dev.

## Phase 3 (scale)

- **Realtime** — polling `/api/realtime/*` for typing + presence; optional Ably/Pusher env (see `.env.example`)
- **Billing** — Stripe Checkout for Premium/VIP when `STRIPE_*` keys are set; **Customer Portal** (`POST /api/billing/portal`) lets subscribers manage/cancel from Settings; demo shows “Coming soon”

### Stripe billing (test mode)

1. Set `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, and `STRIPE_WEBHOOK_SECRET` in `.env.local`.
2. In [Stripe Dashboard → Settings → Billing → Customer portal](https://dashboard.stripe.com/test/settings/billing/portal), enable the portal (cancel subscriptions, update payment method).
3. Forward webhooks locally: `stripe listen --forward-to localhost:3000/api/billing/webhook` (copy `whsec_…` into `STRIPE_WEBHOOK_SECRET`).
4. Subscribe via landing pricing → complete Checkout with test card `4242 4242 4242 4242`.
5. Open **Settings** → **Manage subscription** → redirects to Stripe Customer Portal.

| Endpoint | Method | Auth | Response |
|----------|--------|------|----------|
| `/api/billing/checkout` | POST | session cookie | `{ url, sessionId }` |
| `/api/billing/portal` | POST | session cookie | `{ url }` |
| `/api/billing/subscription` | GET | session cookie | `{ plan, status, currentPeriodEnd }` |
| `/api/billing/webhook` | POST | Stripe signature | `{ received: true }` |

Webhook events handled: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`.
- **Mobile** — shared types in `lib/shared`; Expo app post–Phase 3 ([docs/MOBILE_SHARED.md](docs/MOBILE_SHARED.md))

## Performance

Key images use `next/image` with lazy loading below the fold. Heavy app shell is dynamically imported on `/app`.

**Lighthouse targets (mobile, production build on 4G):**

| Metric | Target |
|--------|--------|
| Performance | ≥ 80 |
| Accessibility | ≥ 90 |
| Best Practices | ≥ 90 |
| SEO | ≥ 90 |
| LCP | < 2.5 s |
| CLS | < 0.1 |

Run `npm run build && npm run start`, then audit with Chrome DevTools → Lighthouse (or PageSpeed Insights against your deploy URL).

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs on push/PR to `main`: install → lint → typecheck → build → Playwright smoke tests.

## Post-P1 roadmap

- **S3/R2 photo uploads** — implemented via `POST /api/user/photos/upload-url` when `S3_*` env is set; base64 fallback in demo mode

## License

Private — see repository owner.
