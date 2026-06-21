# Match engine API

Server-authoritative 24h match lifecycle. API `:id` is the **likes row id** for the current user (backward compatible).

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/matches` | Active matches (non-expired) |
| GET | `/api/matches/:id` | Match detail + `status` + messages |
| POST | `/api/matches/:id/message` | Send message, transition state, bond |
| POST | `/api/matches/:id/message-sent` | Bond-only ping (legacy clients) |
| POST | `/api/v1/cron/expire-matches` | Cron: expire due matches (every minute) |

## Status machine

`new_match` → (first message) → `waiting_reply` → (other user replies) → `active_chat` → (time) → `expired`

## Cron

Call every minute with `Authorization: Bearer $CRON_SECRET` or header `x-cron-secret`.

```bash
curl -X POST https://your-app/api/v1/cron/expire-matches \
  -H "Authorization: Bearer $CRON_SECRET"
```

## Migration

```bash
npm run db:migrate
```

Applies `db/migrations/015_match_engine.sql` (`matches`, `match_messages`, `likes.match_id`).
