# Luvia — "Feel first. See later." Audit and technical plan

Status of this document: Phase 1 done (audit, architecture, database and API foundation).
Every later phase updates the "Status" column below.

## 1. Audit of the current project (November 2026)

| Area | What exists | Relevant for Blind Date |
|---|---|---|
| Stack | Next.js 16 (App Router, standalone build), React 19, TypeScript, Tailwind 4, `postgres` (postgres.js), zod, jose (JWT), Sentry. Deployed on Render (Frankfurt) from `main`; DB on Neon. | Keep. No new runtime dependencies needed for Phase 1. |
| Code layout | `app/` thin routes → `api/handlers/*` → `server/*` (repositories / services), `client/*` UI, `database/migrations/*.sql` applied in order by `scripts/db-migrate.mjs` (tracked in `schema_migrations`, run during the Render build). | New domain in `server/blind-date/*`, handlers in `api/handlers/blind-date/*`, migration `030_blind_dates.sql`. |
| Auth | JWT access cookie `ttm_session` + refresh cookie, `middleware.ts` protects every `/api/*` except a public allowlist; `getSessionFromRequest()` in handlers; CSRF origin check in `requireAuth`. Email verification; rate limits per IP from Cloudflare headers. | Reuse `requireAuth` for every endpoint. |
| Matching | `likes` (pair rows) + `matches` (engine rows, 24 h `expires_at`, freeze extends), `createMutualMatchLikes()` creates likes + match atomically and runs side effects (notifications, achievements, engines). Discover feed with filters (age, distance, purpose, gender from "looking for"). | A mutual **Continue** after a blind date calls `createMutualMatchLikes()` → the existing 24 h timer, chat, notifications and freezes apply unchanged. |
| Chat | `match_messages` per match, polling `/api/realtime/*` by default; Pusher/Ably optional (`server/realtime`). | Blind Date rooms use **server-authoritative state with a version counter** polled by the client (works without Pusher/Ably); managed realtime can push "version changed" later. |
| Timers / jobs | Match expiry, AI analysis and notifications via cron endpoints called from GitHub Actions every 5 min. | Room phases are computed from timestamps on every read (no cron needed); a cleanup cron closes stale rooms and queue entries. |
| Photos | `user_photos` rows / profile JSON `photoUrls`; S3-compatible storage with **public** URLs when configured, data URLs otherwise; demo portraits in `public/demo/people`. `sharp` is available (dev dependency, traced into the standalone build). | Progressive Reveal must never send the original URL before 100 %: a server endpoint renders a blurred/pixelated derivative with `sharp` after checking room membership and the mutual reveal level. |
| Safety | `user_blocks`, `reports` (+ admin queue `/admin`), photo verification, rate limits (Upstash or in-memory), account deletion `DELETE /api/me`, data export `GET /api/me/export`, explicit Art. 9 consent (`profile.sensitiveDataConsentAt`). | Blind Date requires the Art. 9 consent and age ≥ 18 from `birth_date` / `profile.birthdate`; report/block from inside the room; rooms are deleted with the account (`ON DELETE CASCADE`). |
| AI | OpenRouter client, Luvia AI assistant (`/api/pulse/chat`), connection analysis queue with local fallback, both-users consent (`profile.aiInsightsConsent`). | AI Connection builds on a provider interface (Phase 5) with the same consent rule and a free local fallback. |
| Analytics | `analytics_events` (server `trackServerEvent`, client beacon), admin panel `/admin` (reports, verification). | Blind Date funnel events + admin metrics (Phase 8). |
| i18n | 9 locales (ru, uk, en, de, es, pl, fr, it, tr), device language detection, English fallback. | Every new string in all 9 languages. |
| Mobile | Android: Capacitor shell loading the site (APK via GitHub Actions); iPhone: PWA. | No native changes needed; haptics via `navigator.vibrate` where available. |
| Tests | Playwright e2e against a real Postgres (CI job `e2e`), smoke tests. No unit test runner. | Blind Date API scenarios are added as Playwright API tests (two users in parallel). |

### Problems found during the audit (to fix with minimal risk)
1. **Photos are visible in the swipe feed.** "See later" conflicts with the existing feed where photos are public to everyone. Phase 1: pairs who already liked/passed each other are not matched for blind dates. Later (product decision): an optional "blind only" mode that hides a profile from the photo feed.
2. **S3 photo URLs are public.** Anyone with the URL sees the original. The reveal endpoint never exposes the URL before 100 %; for full privacy the bucket should become private with signed URLs (Phase 8).
3. **Age is not validated on the server** at sign-up (the birth date arrives later through the profile API). Blind Date checks age ≥ 18 itself; Phase 8 adds server-side validation for the profile API.
4. **Polling cost.** Rooms are polled every ~2 s by two clients; the state endpoint is a single indexed query and returns `304`-like `{ unchanged: true }` when the version did not change.

## 2. Architecture

```
client (Web / PWA / Android shell)
  ├─ BlindDate screens (Phase 2/7) ──poll──> GET  /api/blind-date/state            (queue or active room, reconnection)
  │                                    ──> POST /api/blind-date/queue              (join; may match immediately)
  │                                    ──> DELETE /api/blind-date/queue            (leave)
  │                                    ──> GET  /api/blind-date/rooms/:id?since=v  (room snapshot, version-gated)
  │                                    ──> POST /api/blind-date/rooms/:id/messages
  │                                    ──> POST /api/blind-date/rooms/:id/reveal   (consent on/off)
  │                                    ──> POST /api/blind-date/rooms/:id/decision (continue | pass)
  │                                    ──> POST /api/blind-date/rooms/:id/leave
  │                                    ──> POST /api/blind-date/rooms/:id/report   (report and/or block)
  │                                    ──> GET  /api/blind-date/rooms/:id/photo    (Phase 3: blurred derivative)
  │                                    ──> /api/blind-date/rooms/:id/games/*       (Phase 4)
  └─ existing match chat (after mutual Continue)
server/blind-date/
  ├─ rules.ts        pure rules: constants (10 min room, 2 min decision window, reveal stages),
  │                  phase from timestamps, mutual progress, visible reveal stage, outcome,
  │                  message checks (length, links / e-mails / phones / messenger handles), age
  └─ service.ts      eligibility (18+, Art. 9 consent, not blocked, daily limit with Premium hook),
                     matchmaking (gender/looking-for and age prefs both ways, shared language,
                     distance, purpose, common interests, no blocks / prior likes / passes /
                     recent dates), rooms + phase machine, messages (+ spam limits), reveal
                     consent, decisions → createMutualMatchLikes, leave, report + block, sweep
api/handlers/blind-date/  state.ts, queue.ts, room.ts, shared.ts (auth, CSRF, rate limits, errors)
database/migrations/030_blind_dates.sql
```

**Room phase machine** (computed from timestamps, persisted when it changes):
`active` (10 min) → `deciding` (decision window, 2 min) → `closed` (reason: `matched`, `no_match`, `left`, `reported`, `timeout`).
Every state change increments `rooms.version`; clients poll with `since=<version>`.

**Concurrency**: joining runs in a transaction guarded by `pg_advisory_xact_lock` so two users cannot be paired twice; partial unique indexes guarantee at most one open room per user; queue rows are unique per user.

**Privacy**: the room snapshot contains only first name, age, common interests and the reveal level — never e-mail, exact location, photo URLs or other interests. The peer's decision is hidden until both decided. Messages are deleted with the room data retention job (Phase 8 decides the period) and with account deletion.

## 3. Phases

| Phase | Scope | Status |
|---|---|---|
| 1 | Audit, architecture, migration `030_blind_dates.sql`, domain + API for queue, matchmaking, rooms, server timers, messages, reveal consent state, decisions → existing match, leave/report/block, Playwright API tests | **done** (API only, tested locally; not deployed) |
| 2 | Blind Date UI: start screen, search/waiting, room (chat, timer, progress), reconnection | planned |
| 3 | Progressive Reveal: server-rendered blurred derivatives (`sharp`), mutual consent UI, animations | planned |
| 4 | Game engine (registry of game definitions, synchronized moves, stored results) + 6 games + Compatibility Challenges | planned |
| 5 | AI Connection: provider interface (OpenRouter + local), consent, rate limits, cache, cost tracking, Connection Report | planned |
| 6 | Integration: match chat continuation, notifications, history of dates | planned |
| 7 | Design polish, animations, haptics, all screens on phones and desktop | planned |
| 8 | Security review, retention, admin metrics, analytics dashboard, full test pass, publishing checklist | planned |

### Phase 1 — what is tested
`tests/e2e/blind-date.spec.ts` (6 scenarios, run locally against Postgres 16, all passing):
pairing two users into one room and reconnection; the snapshot contains no e-mail or photo data;
version-gated polling; contact details rejected; mutual progress; one-sided reveal consent shows nothing;
decisions only after the date, the peer's choice hidden until both decided, both Continue → a match in
`/api/matches`, decisions cannot be changed, the pair is not matched again; one Pass → no match;
outsiders get 404; report + block closes the room, stores the report and the block, blocked pairs are
never re-matched; leaving ends the date for both; consent and 18+ are required; simultaneous joins
create exactly one room. Test users are deleted after the run.

Not covered yet: the UI (Phase 2), photo rendering (Phase 3), games (Phase 4), AI (Phase 5), load testing.

Premium hooks (no paywall now): daily free blind-date limit (`BLIND_DATE_FREE_DAILY`, default 10), extended report, extra game packs — checked through `isPremium()`; reveal and the basic date stay free.
