# AI connection analysis workers

Production uses a **Postgres-backed job queue** (no Redis/BullMQ required). Upstash in this repo is REST-only for rate limits and ephemeral flags — not suitable for BullMQ workers on Vercel serverless.

## Flow

1. **Message threshold** — `POST /api/matches/:id/message-sent` calls `maybeQueueConnectionAnalysis()` every **5 messages** when `DATABASE_URL` and `OPENROUTER_API_KEY` are set (`lib/server/connection-ai-worker.ts`).
2. **Enqueue** — Row inserted into `ai_analysis_jobs` (deduped per match + message count while pending/processing). HTTP returns immediately; `analysisQueued: true` in the response.
3. **Worker** — `processConnectionAnalysisJobs()` in `lib/server/connection-ai-processor.ts`:
   - Claims pending jobs with `FOR UPDATE SKIP LOCKED`
   - Loads recent `match_messages` via the match engine
   - Builds signals (`lib/server/connection-ai-request.ts`) and calls OpenRouter through `analyzeConnectionOnServer`
   - Persists to `connection_scores` and clears the ephemeral analyzing flag
4. **Triggers** — Inline kick after enqueue (fire-and-forget) + cron `POST /api/v1/cron/ai-analysis` every minute (`vercel.json`). Dev: `startDevAiAnalysisCron()` in `instrumentation.ts`.
5. **Client** — `usePersistedConnectionScore` polls `GET /api/matches/:id/connection-score`. Chat shows the persisted insight card and analyzing badge from DB/ephemeral state.

## Tables (migration `021_ai_connection_workers.sql`)

| Table | Purpose |
|-------|---------|
| `ai_analysis_jobs` | Queue: `match_id`, `message_count`, `status`, `result` |
| `connection_scores` | Latest persisted analysis per run (sync, insight, memories, …) |

## Environment

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Required for queue + persisted scores |
| `OPENROUTER_API_KEY` | Server-only AI (required to enqueue; without it, client uses local heuristics) |
| `OPENROUTER_MODEL` | Optional model override (default `openai/gpt-oss-120b:free`) |
| `OPENROUTER_BASE_URL` | Optional API base |
| `CRON_SECRET` | Protects `/api/v1/cron/ai-analysis` |
| `UPSTASH_REDIS_REST_*` | Optional shared `ttm:rt:analyzing:*` flag across instances |

## Graceful degradation

| Mode | Behavior |
|------|----------|
| No `OPENROUTER_API_KEY` | Queue skipped; `POST /api/analyze-connection` + client heuristics / demo insight |
| No `DATABASE_URL` | Demo mode — in-process stub behavior, localStorage chat |
| OpenRouter failure | Worker falls back to local analysis in `connection-ai-service.ts` |

## APIs

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/analyze-connection` | On-demand analysis (rate-limited; still used by client debounce) |
| GET | `/api/matches/:id/connection-score` | Latest persisted score + `analyzing` flag |
| POST | `/api/v1/cron/ai-analysis` | Drain pending jobs (cron) |

## Local testing with OpenRouter

1. Set in `.env.local`:
   ```
   DATABASE_URL=postgresql://...
   OPENROUTER_API_KEY=sk-or-v1-...
   OPENROUTER_MODEL=openai/gpt-oss-120b:free
   ```
2. Run `npm run db:migrate`
3. `npm run dev` — send 5+ messages in a server-backed match
4. Watch logs for `[ttm/ai-worker] connection analysis queued` and `ai_analysis_job_done`
5. `GET /api/matches/<like-id>/connection-score` should return `score.insight` with `source: "openrouter"`

Manual cron drain:

```bash
curl -X POST http://localhost:3000/api/v1/cron/ai-analysis \
  -H "x-cron-secret: $CRON_SECRET"
```

See also `lib/ai-connection-engine/` and `docs/PRODUCTION_ARCHITECTURE.md`.
