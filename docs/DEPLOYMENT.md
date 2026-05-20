# Time to Match — production deployment

Monorepo: **Next.js 16** (App Router) + optional **PostgreSQL** + API routes under `/api`.

## 1. Environment variables

Copy `.env.example` to `.env.local` (dev) or configure in the host dashboard (prod).

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_APP_URL` | **Production** | Canonical site URL for metadata, OG tags, sitemap, robots (`https://…`). |
| `DATABASE_URL` | For server auth / DB | PostgreSQL connection string. |
| `AUTH_SECRET` | With `DATABASE_URL` | JWT signing secret for `ttm_session` cookie (≥32 chars recommended). |
| `CORS_ORIGINS` | Optional | Comma-separated allowed browser origins for credentialed `/api/v1` calls. |
| `NEXT_PUBLIC_ANALYTICS_DISABLED` | Optional | Set to `1` to silence client analytics beacons in dev. |

## 2. Vercel (frontend + API routes)

1. Import the repo, framework **Next.js**.
2. Set **Root** if needed; build `npm run build`, output default.
3. Add env vars; set **`NEXT_PUBLIC_APP_URL`** to the production URL (e.g. `https://app.example.com`).
4. Attach **Vercel Postgres** or external DB → `DATABASE_URL`; set `AUTH_SECRET`.
5. **Domains**: project → Settings → Domains → add custom domain (HTTPS automatic).
6. **Cron** (optional): schedule `npm run db:cleanup` weekly via Vercel Cron hitting a **protected** route or run cleanup from a worker — do not expose cleanup publicly without auth.

`@vercel/analytics` and `@vercel/speed-insights` are enabled in production in `app/layout.tsx`.

## 3. Render (Node web service)

Use `render.yaml` as a blueprint or create a **Web Service**:

- **Build:** `npm ci && npm run build`
- **Start:** `npm run start` (listens on `0.0.0.0`, see `package.json`)
- **Health check path:** `/api/health`
- **Readiness:** `/api/ready` (includes DB check when `DATABASE_URL` is set)

Create a **PostgreSQL** instance on Render, copy **Internal Database URL** into `DATABASE_URL` for the web service, then run migrations once (Render shell or one-off job):

```bash
npm run db:migrate
```

Schedule **Cron Job** on Render: `npm run db:cleanup` (same repo, `DATABASE_URL` set).

## 4. Railway

`railway.toml` defines build/start and health check. Connect **Railway Postgres** plugin, set `DATABASE_URL` and `AUTH_SECRET`, deploy.

## 5. Docker (VPS / Fly.io / any registry)

```bash
docker build -t time-to-match \
  --build-arg NEXT_PUBLIC_APP_URL=https://your.domain \
  .

docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e AUTH_SECRET="..." \
  -e NEXT_PUBLIC_APP_URL="https://your.domain" \
  time-to-match
```

Image uses **Next standalone** output (`output: "standalone"` in `next.config.mjs`).

## 6. PostgreSQL production

- Use **managed** Postgres (Neon, Supabase, Render, RDS, etc.).
- **TLS**: prefer providers that enforce TLS on connection strings.
- **Pooling**: `DATABASE_POOL_MAX` (see `.env.example`); adjust for serverless vs long-lived Node.
- **Migrations:** `npm run db:migrate` on each release (CI or host shell).
- **Backups:** enable automated backups in the provider; test restore quarterly.
- **Cleanup:** `npm run db:cleanup` on a schedule (expired profiles / messages per `db/migrations/001_core.sql`).

## 7. HTTPS, cookies, security

- Production cookies for auth use **`Secure`** when `NODE_ENV=production` or `VERCEL=1` (see `lib/server/auth/jwt.ts`).
- **HSTS** is set in `middleware.ts` when the request is served over HTTPS (`x-forwarded-proto: https`).
- Security headers: `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-Content-Type-Options` (see `middleware.ts`).
- **`public/.well-known/security.txt`** — update contact before public launch.

## 8. Realtime

WebSockets are **not** embedded in this Next process. Use a managed realtime layer (Ably, Pusher, Supabase Realtime, Liveblocks) or a separate Node **ws** / **Socket.IO** service behind Redis — see `lib/server/realtime.ts`.

## 9. Monitoring & logs

- **Vercel:** Analytics + Speed Insights (already integrated).
- **Structured logs:** API routes use `lib/server/log.ts` (JSON lines) — ship stdout to Datadog / Axiom / Grafana Loki.
- **Errors:** add Sentry (`@sentry/nextjs`) in a follow-up; keep DSN in env only.

## 10. Analytics events

- Client helper: `lib/analytics-client.ts` → `trackProductEvent`.
- Server endpoint: `POST /api/v1/analytics/event` (rate-limited, **no PII** in payloads — use coarse flags only).

## 11. SEO & PWA

- **Metadata / Open Graph / Twitter:** `app/layout.tsx` + `metadataBase` from `NEXT_PUBLIC_APP_URL`.
- **`app/robots.ts`**, **`app/sitemap.ts`**, **`app/manifest.ts`** for indexing and installability (standalone display, theme colors).

## 12. Performance

- `next.config.mjs`: `compress`, `poweredByHeader: false`, `optimizePackageImports` for `lucide-react`, `images` AVIF/WebP.

---

Before public launch: set real URLs, rotate secrets, fill `security.txt`, enable DB backups, and wire a proper error tracker.
