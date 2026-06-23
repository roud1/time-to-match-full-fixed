# Socket.io realtime server

Standalone WebSocket server for match chat. Next.js on Vercel cannot host persistent WebSocket connections on serverless functions — run this process separately in development and production (Railway, Render, Fly.io, Docker).

## Quick start

```bash
# Terminal 1 — Next.js
npm run dev

# Terminal 2 — Socket.io (port 3001)
npm run dev:socket

# Or both:
npm run dev:all
```

Set in `.env.local`:

```env
SOCKET_PORT=3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

## Events

| Direction | Event | Payload |
|-----------|-------|---------|
| C→S | `join:match` | `{ matchId }` |
| C→S | `message:send` | `{ matchId, text }` → ack with bond/gamification |
| C→S | `typing:start` / `typing:stop` | `{ matchId }` |
| S→C | `message:new` | `{ message }` |
| S→C | `typing:start` / `typing:stop` | `{ matchId, userId }` |
| S→C | `presence:online` / `presence:offline` | `{ matchId, userId }` |

Rooms: `match:{matchId}` where `matchId` is the canonical `likes.id` from `/api/matches`.

## Auth

- **Same origin** (dev): `withCredentials: true` sends `ttm_session` cookie on handshake.
- **Cross origin**: `GET /api/realtime/socket-token` returns a short-lived JWT; pass as `auth: { token }` to `io()`.

## Fallback

When `NEXT_PUBLIC_SOCKET_URL` is unset, the client uses **Pusher** (if configured) or **HTTP polling** (`/api/realtime/state`, `/api/realtime/pulse`). Message persistence always remains in PostgreSQL via REST or socket `message:send`.

## Production

Deploy this module as a long-running Node process:

```bash
npx tsx scripts/socket-server.ts
```

Set `DATABASE_URL`, `AUTH_SECRET`, `SOCKET_PORT`, and `NEXT_PUBLIC_SOCKET_URL` to the public WS URL. Point the Next.js app at the same database.
