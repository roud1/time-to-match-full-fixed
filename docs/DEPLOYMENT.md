# Time to Match — production deployment

Monorepo: **Next.js 16** (App Router) + optional **PostgreSQL** + API routes under `/api`.

**Modes:** Without `DATABASE_URL`, the app runs in **demo mode** (localStorage only). With `DATABASE_URL` + `AUTH_SECRET`, it runs in **production/server mode** (real auth, matches, chat, cron).

---

## Quick checklist — production env vars

Set these on **Vercel**, **Render**, **Railway**, or your host before going live:

| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE_URL` | **Yes** | PostgreSQL connection string (TLS preferred). |
| `AUTH_SECRET` | **Yes** | Session JWT secret — `openssl rand -base64 32`, ≥32 chars. |
| `NEXT_PUBLIC_APP_URL` | **Yes** | Canonical `https://your-domain.example` (OG, sitemap, PWA). |
| `CRON_SECRET` | **Yes** (if using crons) | Protects `/api/v1/cron/*`; Vercel Cron sends `Authorization: Bearer …`. |
| `SENTRY_DSN` | No | Error tracking via `@sentry/nextjs` (no-op if unset). |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | No | Shared rate limiting across instances; in-memory fallback otherwise. |
| `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY` | No | Presigned photo uploads (R2/S3). `S3_ENDPOINT` for R2; `S3_PUBLIC_URL` for CDN. |

**Validate locally before deploy:**

```bash
DATABASE_URL=... AUTH_SECRET=... NEXT_PUBLIC_APP_URL=https://... CRON_SECRET=... \
  NODE_ENV=production npm run check:env:strict
```

**Readiness:** `GET /api/ready` returns `mode: "production"`, `database: "ok"`, `auth: "ok"` when configured correctly.

**Smoke test after deploy:**

```bash
BASE_URL=https://your-domain.example node scripts/smoke-test.mjs
```

Checks: `/api/ready`, homepage, register page, optional register→discover flow when `DATABASE_URL` is set, photo upload config.

Manual curl (minimal):

```bash
curl -s https://your-domain.example/api/ready | jq
curl -sI https://your-domain.example/ | head -1
curl -sI https://your-domain.example/register | head -1
```

---

## Step-by-step: demo → production

### 1. Set environment variables on the host

Copy `.env.example` and fill required vars (see table above). Optional vars are documented in `.env.example`.

On **Vercel**: Project → Settings → Environment Variables (Production + Preview as needed).

On **Render/Railway**: Service → Environment → add secrets.

Set `TTM_STRICT_ENV=1` in CI or Docker if you want the process to **exit** on missing required vars at startup.

### 2. Run database migrations

Migrations live in `database/migrations/` (17+ files). The runner tracks applied files in **`schema_migrations`** (`filename`, `applied_at`) and skips already-applied SQL.

```bash
npm run db:migrate
```

**Existing DB migrated before tracking was added?** One-time bootstrap (marks all files applied without re-running SQL):

```bash
npm run db:migrate -- --bootstrap
```

**Fresh DB:** Just run `npm run db:migrate` — safe to run repeatedly; only new files execute.

Run migrations on **every release** when schema changes, or rely on host automation below.

### 3. Deploy the app

Build: `npm run build` · Start: `npm run start` (listens on `0.0.0.0`).

Verify after deploy:

```bash
curl -s https://your-domain.example/api/ready | jq
```

---

## Platform-specific notes

### Vercel (frontend + API routes + Cron)

1. Import repo, framework **Next.js** (`vercel.json` configures crons in `fra1`).
2. Set env vars (see checklist). **`NEXT_PUBLIC_APP_URL`** must match your production domain.
3. Attach **Vercel Postgres** or external DB → `DATABASE_URL`; set `AUTH_SECRET` and **`CRON_SECRET`** (required for cron routes in `vercel.json`).
4. **Migrations — Vercel does not run them automatically.** Choose one:
   - **Build step** (if `DATABASE_URL` is available at build time): override Build Command to  
     `npm run db:migrate && npm run build`
   - **Post-deploy** (recommended): run from your machine or CI after each release:  
     `DATABASE_URL=... npm run db:migrate`
   - **External Postgres** (Neon/Supabase): use their SQL console or a GitHub Action with `npm run db:migrate`
5. **Domains**: Settings → Domains → add custom domain (HTTPS automatic).

`@vercel/analytics` and `@vercel/speed-insights` are enabled in production in `app/layout.tsx`.

### Render (Node web service)

`render.yaml` blueprint:

- **Build:** `npm ci && npm run build`
- **Pre-deploy:** `npm run db:migrate` (runs before each deploy when `DATABASE_URL` is set on the service)
- **Start:** `npm run start`
- **Health:** `/api/health` · **Readiness:** `/api/ready`

1. Create **PostgreSQL** on Render; copy **Internal Database URL** → web service `DATABASE_URL`.
2. Set `AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`, `CRON_SECRET` in the dashboard.
3. Deploy — migrations run via `preDeployCommand`.

**External cron** (Render has no built-in scheduler): hit every minute / 15 min:

```bash
curl -X POST https://<your-service>/api/v1/cron/expire-matches \
  -H "Authorization: Bearer $CRON_SECRET"
curl -X POST https://<your-service>/api/v1/cron/notify \
  -H "Authorization: Bearer $CRON_SECRET"
curl -X POST https://<your-service>/api/v1/cron/cleanup \
  -H "Authorization: Bearer $CRON_SECRET"
```

Schedule **cleanup:** Render Cron Job → `npm run db:cleanup` (same repo, `DATABASE_URL` set).

### Railway

`railway.toml` defines build/start. Connect **Railway Postgres**, set env vars, deploy.

**Migrations:** run manually after deploy or add a **Pre-deploy** / one-off command:

```bash
railway run npm run db:migrate
```

### Docker (VPS / Fly.io / any registry)

```bash
docker build -t time-to-match \
  --build-arg NEXT_PUBLIC_APP_URL=https://your.domain \
  .

# Recommended: migrate once before or between deploys
docker run --rm \
  -e DATABASE_URL="postgresql://..." \
  time-to-match node scripts/db-migrate.mjs

docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e AUTH_SECRET="..." \
  -e NEXT_PUBLIC_APP_URL="https://your.domain" \
  -e CRON_SECRET="..." \
  time-to-match
```

**Init-container pattern (migrate on start):** set `RUN_MIGRATIONS=1` — entrypoint runs `db:migrate` then `server.js`:

```bash
docker run -p 3000:3000 \
  -e RUN_MIGRATIONS=1 \
  -e DATABASE_URL="..." \
  -e AUTH_SECRET="..." \
  time-to-match
```

Image uses **Next standalone** output (`output: "standalone"` in `next.config.mjs`).

---

## Local development (Postgres)

**One command** (Docker Postgres + `.env.local` + migrate):

```bash
npm run db:setup
npm run dev
```

**Manual:**

```bash
docker compose up -d
cp .env.example .env.local
# Edit .env.local: DATABASE_URL=postgresql://ttm:ttm_dev_password@127.0.0.1:5432/timetomatch
#                  AUTH_SECRET=dev-local-auth-secret-min-32-chars!!
npm run db:migrate
npm run dev
curl http://localhost:3000/api/ready
```

Leave `DATABASE_URL` empty in `.env.local` to stay in **demo mode**.

---

## PostgreSQL production

- Use **managed** Postgres (Neon, Supabase, Render, RDS, etc.).
- **TLS**: prefer providers that enforce TLS on connection strings.
- **Pooling**: `DATABASE_POOL_MAX` (see `.env.example`); adjust for serverless vs long-lived Node.
- **Migrations:** `npm run db:migrate` on each release; tracked in `schema_migrations`.
- **Backups:** enable automated backups in the provider; test restore quarterly.
- **Cleanup:** `npm run db:cleanup` on a schedule (expired profiles / messages per `db/migrations/001_core.sql`).

---

## Optional environment variables

| Variable | Purpose |
|----------|---------|
| `DATABASE_POOL_MAX` | Postgres pool size (default 10). |
| `CORS_ORIGINS` | Comma-separated origins for credentialed `/api/v1`. |
| `ADMIN_API_KEY` | Photo verification admin API. |
| `OPENROUTER_*` | Server AI (connection analysis, Pulse chat). |
| `VAPID_*` / `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Web Push. |
| `RESEND_*` | Expiry email notifications. |
| `NEXT_PUBLIC_ANALYTICS_DISABLED` | Set `1` to silence client analytics in dev. |
| `TTM_STRICT_ENV` | Set `1` to exit on missing required env at startup. |
| `S3_*` / `AWS_*` | Presigned profile photo uploads (`POST /api/user/photos/upload-url`). |

---

## HTTPS, cookies, security

- Production cookies for auth use **`Secure`** when `NODE_ENV=production` or `VERCEL=1` (see `lib/server/auth/jwt.ts`).
- **HSTS** is set in `middleware.ts` when the request is served over HTTPS (`x-forwarded-proto: https`).
- Security headers: `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-Content-Type-Options` (see `middleware.ts`).
- **`public/.well-known/security.txt`** — update contact before public launch.

---

## Realtime

WebSockets are **not** embedded in this Next process. Use a managed realtime layer (Ably, Pusher, Supabase Realtime, Liveblocks) or a separate Node **ws** / **Socket.IO** service behind Redis — see `lib/server/realtime.ts`.

---

## Monitoring & logs

- **Vercel:** Analytics + Speed Insights (already integrated).
- **Structured logs:** API routes use `lib/server/log.ts` (JSON lines) — ship stdout to Datadog / Axiom / Grafana Loki.
- **Errors:** `@sentry/nextjs` when `SENTRY_DSN` is set (see `.env.example`).

---

## Analytics events

- Client helper: `lib/analytics-client.ts` → `trackProductEvent`.
- Server endpoint: `POST /api/v1/analytics/event` (rate-limited, **no PII** in payloads — use coarse flags only).

---

## SEO & PWA

- **Metadata / Open Graph / Twitter:** `app/layout.tsx` + `metadataBase` from `NEXT_PUBLIC_APP_URL`.
- **`app/robots.ts`**, **`app/sitemap.ts`**, **`app/manifest.ts`** for indexing and installability.

---

## Performance

- `next.config.mjs`: `compress`, `poweredByHeader: false`, `optimizePackageImports` for `lucide-react`, `images` AVIF/WebP.

---

Before public launch: set real URLs, rotate secrets, fill `security.txt`, enable DB backups, run `npm run check:env:strict`, and wire a proper error tracker.
