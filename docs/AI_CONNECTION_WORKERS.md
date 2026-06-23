# AI connection analysis workers

Phase 3 wires a **lightweight in-process stub**; production should use a proper queue.

## Current flow

1. **Client** — `useConnectionAnalysis` debounces and calls `POST /api/analyze-connection` (OpenRouter when configured, local heuristics otherwise).
2. **Server** — `lib/server/connection-ai-service.ts` runs analysis synchronously in the API route (rate-limited).
3. **Message threshold** — `POST /api/matches/:id/message-sent` calls `maybeQueueConnectionAnalysis()` every 5 messages when `OPENROUTER_API_KEY` is set (`lib/server/connection-ai-worker.ts`).

## Environment

| Variable | Purpose |
|----------|---------|
| `OPENROUTER_API_KEY` | Server-only AI (required for OpenRouter provider) |
| `OPENROUTER_MODEL` | Optional model override (default `openai/gpt-oss-120b:free`) |
| `OPENROUTER_BASE_URL` | Optional API base |

## Production queue (recommended)

Replace the stub with:

- **BullMQ** + Redis — `analyze-connection` jobs keyed by `matchId`
- Worker loads recent `match_messages`, builds signals, persists scores to `match_stats` / connection memory tables
- Trigger: message-sent webhook, cron, or pub/sub from match engine

See also `docs/PRODUCTION_ARCHITECTURE.md` and `lib/ai-connection-engine/`.
