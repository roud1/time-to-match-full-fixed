# Time to Match — Core Engines Architecture

Three cooperating services drive time-pressure retention:

```
┌─────────────────┐     events      ┌──────────────────┐
│ Behavior Engine │◄────────────────│ match_messages,  │
│ (real-time score)│                 │ matches, events  │
└────────┬────────┘                 └────────┬─────────┘
         │ score/tier                         │
         ▼                                    ▼
┌─────────────────┐                 ┌──────────────────┐
│ Ranking Engine  │                 │ Expiration Engine │
│ discover + pool │                 │ 6h/12h/24h ladder │
└─────────────────┘                 └────────┬─────────┘
                                           │ cron / min
                                           ▼
                                    notifications
```

## 1. Behavior Engine

**Module:** `lib/server/engines/behavior/`

| Signal | Source | Normalized |
|--------|--------|------------|
| `response_time_avg_ms` | Reply latency vs peer message | `fast_replies` 0–1 |
| `ignore_rate` | Expired as `non_responder` / matches | `low_ignore_rate` |
| `activity_score` | Messages last 7d | 0–1 |
| `conversation_depth` | Avg messages per match | 0–1 |

**Formula:**

```
user_score =
  fast_replies * 0.4 +
  low_ignore_rate * 0.3 +
  activity_score * 0.2 +
  conversation_depth * 0.1
```

Stored on `users` (0–100). Updated on every server message + ghost expire + manual recompute.

**Tiers:** `hot` ≥75 · `normal` ≥45 · `low` &lt;45

## 2. Ranking Engine

**Module:** `lib/server/engines/ranking/`

- **Discover:** `rankDiscoverProfiles()` sorts by compatibility + tier affinity + viewer visibility.
- **Cap:** `applyVisibilityCap()` — low visibility users see fewer profiles (shadow limit).
- **Pools:** `hot` / `normal` / `low_activity` via `poolLabel()`.
- **Match priority:** `assignMatchPriority()` sets `matches.priority_level` 1–5 from pair scores (high↔high).

## 3. Expiration Engine

**Module:** `lib/server/engines/expiration/`

| Age (since match) | State | Action |
|-------------------|-------|--------|
| 0–6h | `normal` | Base 24h timer |
| 6h+ no reply | `low_visibility` | `discover_visibility` cap for ghost |
| 12h+ | `warning` | Push `match_urgency_warning` to non-responder |
| 23h+ | `critical` | Final urgency notification |
| 24h | `expired` | Hard expire + ghost penalty |

**Worker:** `runEnginesCron()` — `/api/v1/cron/expire-matches` every minute.

## Database

Migration: `016_behavior_ranking_expiration_engines.sql`

**users:** `behavior_score`, `response_time_avg_ms`, `ignore_rate`, `activity_score`, `conversation_depth`, `ranking_tier`, `discover_visibility`

**matches:** `priority_level`, `urgency_level`, `non_responder_id`, `first_message_at`

**user_behavior_events:** audit trail

## Integration hooks

`lib/server/engines/integration.ts`

- `integrateMatchCreated()` — after mutual like
- `integrateMessageSent()` — after `POST /api/matches/:id/message`

## API

| Endpoint | Behavior data |
|----------|----------------|
| `GET /api/me` | `user.behavior { score, tier, ... }` |
| `GET /api/discover` | Ranked + visibility-capped deck |
| `GET /api/matches` | `priorityLevel`, `urgencyLevel` when joined |
