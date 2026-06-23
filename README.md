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

Optional integrations (see `.env.example` for full list):

- **Sentry** — `SENTRY_DSN` for error tracking (no-op if unset)
- **Upstash Redis** — `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` for shared rate limits
- **Resend** — `RESEND_API_KEY` for expiry emails and password reset
- **Web Push** — `VAPID_*` keys for push notifications (generate via `node scripts/generate-vapid-keys.mjs`)

## Deployment

See **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** for Vercel, Render, Railway, and Docker deploy steps.

### Deploy checklist

1. Copy `.env.example` → set `DATABASE_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`, `CRON_SECRET`
2. Run `npm run check:env:strict` with production env (or `NODE_ENV=production`)
3. Run `npm run db:migrate` against production Postgres
4. Deploy (`npm run build` passes; CI runs lint, typecheck, e2e)
5. Verify `curl https://your-domain/api/ready`
6. Run `BASE_URL=https://your-domain node scripts/smoke-test.mjs`
7. Optional: configure `S3_*` for presigned photo uploads (see `.env.example`)

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
- **Admin** — `GET /api/admin/reports` and `PUT /api/admin/verification/:id` with `x-admin-key` when `ADMIN_API_KEY` is set
- Reports are stored in the `reports` table for admin review

## Analytics funnel

Client events fire to `POST /api/v1/analytics/event` via `trackEvent()` (server logs + Vercel Analytics in production):

**Core funnel:** `register`, `login`, `swipe_like`, `swipe_pass`, `match_created`, `message_sent`, `match_expired`

**Once-per-user milestones:** `register_complete`, `profile_complete`, `first_swipe`, `first_match`, `first_message`

Set `NEXT_PUBLIC_ANALYTICS_DISABLED=1` to silence beacons in local dev.

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
