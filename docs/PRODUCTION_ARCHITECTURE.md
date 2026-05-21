# Production Architecture — Time to Match

## Stack (current)

- **Web:** Next.js 16 (App Router), client state in `localStorage`
- **API:** `/api/v1/*` — auth, connections sync, analytics
- **DB:** PostgreSQL migrations (`db/migrations/`)
- **Realtime (client today):** `ttm-connection-updated`, `ttm-world-pulse`, `ttm-evolution-event`

## Target production

```
[Next.js] ── REST ──► [API + Postgres]
     │                      │
     └── WebSocket ──► [Realtime service]
                              │
                         [Redis pub/sub]
```

- **Authoritative state:** connections, messages, users in Postgres
- **Ephemeral:** typing, presence, atmosphere ticks via Redis
- **AI:** `/api/analyze-connection` → queue workers for heavy psychology / evolution scoring
- **Analytics:** `lib/analytics-client.ts` → `/api/v1/analytics/event` (no PII)

## Deploy

- Vercel / Railway / Render configs in repo (`vercel.json`, `railway.toml`, `render.yaml`)
- Env: `DATABASE_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`
- Health: `/api/health`, `/api/ready`

## Mobile

Import `lib/world`, `lib/network`, `lib/ecosystem`, `lib/shared` from React Native — no React in core modules.
