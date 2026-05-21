# Phase 10 — Launch & Growth

## Pillars

| # | Feature | Implementation |
|---|---------|----------------|
| 1 | Daily return | `lib/shared/daily-return.ts`, `DailyReturnBanner`, `useGrowthSession` |
| 2 | Connection decay | Existing `tickConnection` + `p10-chat-atmosphere` + fading badges |
| 3 | Live states | `RelationshipLiveState`, `RelationshipStateBadge`, CSS tokens |
| 4 | Emotional notifications | `buildEmotionalNotifications`, `/notifications` |
| 5 | Social virality | `ShareSyncCard`, Web Share API + clipboard |
| 6 | Connection memories | `CinematicMemoryArchive`, `/memories` |
| 7 | AI personality | `analyzeRelationshipPatterns`, `RelationshipInsightPanel` |
| 8 | UX polish | `growth-experience.css`, chat atmosphere attrs |
| 9 | Launch prep | Sitemap, analytics events, docs |
| 10 | Mobile foundation | `lib/shared/index.ts` — pure TS exports |

## Analytics events

- `daily_return_shown`
- `share_moment` / `share_moment_copy`
- `share_moment_png`
- `push_enabled` / `push_disabled`
- `connection_sync_pull`

## Phase 10+ launch extras

| Feature | Path |
|---------|------|
| PWA + emotional push | `public/sw.js`, `lib/push-notifications.ts`, Settings toggle |
| Cloud connection sync | `PUT/GET /api/v1/connections/sync`, `db/migrations/003_user_app_state.sql` |
| Instagram PNG | `lib/share-card-image.ts` (1080×1920 story) |

## Routes

- `/notifications` — live emotional feed
- `/memories` — cinematic archive
