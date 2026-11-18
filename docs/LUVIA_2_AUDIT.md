# Luvia 2.0 — audit and implementation plan

Branch: `luvia-2` (from `main` @ `1b0bbfb`, after PR #20). Reference: `Luvia_2_0_Claude_Package.zip`
(`CLAUDE_TASK.md`, `assets/design_reference.png`, `assets/tokens.css`, `assets/luvia-logo.svg`).
The reference is concept artwork: profiles, messages, voice notes and premium claims in it are illustrative.

## 1. Stack and structure (verified)

| Area | What the repo has |
|---|---|
| Framework | Next.js 16.4.3 (App Router, Turbopack dev), React 19, TypeScript, Tailwind CSS 4, `motion` |
| Styling | Global CSS layers in `app/*.css` + Tailwind utilities. App-only styles are scoped to `html[data-ttm-app]` (set in `app/layout.tsx` for the Capacitor UA `TTMApp`, iOS `navigator.standalone` and `display-mode: standalone`) |
| Mobile | `mobile/` — Capacitor 7 Android shell loading the hosted site (`appId com.timetomatch.app`, UA suffix `TTMApp/1`). iPhone = installed PWA. No native code beyond the shell |
| Auth | Own JWT session cookie (`/api/v1/auth/*`: register, login, logout, refresh, verify-email, resend, forgot/reset password). `AUTO_VERIFY_EMAIL=1` on Render while Resend is not set |
| Database | Postgres (`postgres` driver), 29 SQL migrations in `database/migrations`. Seed: `scripts/db-seed-demo.mjs` (12 test profiles, flagged `demo`) |
| i18n | 9 locales (`client/lib/i18n/locales/{ru,uk,en,de,es,pl,fr,it,tr}.json`), typed keys (`TranslationKey`) |
| Deploy | Render (`render.yaml`, builds `main`, runs migrations + seed in build) |
| Tests | Playwright e2e (`tests/e2e`: auth, discover visibility, match flow, smoke) — need Postgres |

Routes: `/`, `/welcome`, `/login`, `/register`, `/forgot-password`, `/reset-password`, `/app` (tabs `discover`, `likes`, `chat`, `map`; chat room `?tab=chat&with=`), `/profile` (+ `?tab=premium`, `?edit=1`), `/settings`, `/notifications`, `/memories`, `/story`, `/about`, `/privacy`, `/terms`, `/billing/success|cancel`, `/admin`.

API (selection): `discover`, `discover/like|pass|rewind`, `likes/incoming`, `matches`, `matches/[id]/message|message-sent|freeze|unmatch|connection-score`, `profile`, `profile/photos`, `profile/location`, `me` (GET, DELETE = account deletion), `subscription`, `subscription/boost|checkout`, `billing/*` (Stripe), `push/*`, `notifications`, `pulse/chat`, `v1/block`, `v1/report`, `verification/*`, `realtime/*`, `v1/cron/*`.

## 2. Baseline checks (before any change)

| Check | Result |
|---|---|
| `npm ci` | OK (lockfile in sync since PR #14) |
| `tsc --noEmit` | 0 errors |
| `eslint .` | 0 errors, 17 warnings (pre-existing, react-hooks deps) |
| `next build` | Compiles all 87 pages. In this sandbox the first run stops with Next's own "known security vulnerability, upgrade Next.js" notice; the second run exits 0. Not caused by app code — see §6 |
| e2e (CI) | Already failing on `main` since #14: register 429 rate limit and login 401 (email verification) in the CI job. Pre-existing, not touched |

## 3. Which features are real

| Feature | Status | Notes |
|---|---|---|
| Discovery / swipes | Real | Server feed with filters (age, distance, goal, gender from "Ищу"); like / pass / rewind (rewind = Premium) |
| Match | Real | Created server-side on mutual like; match screen is shown only when the server says `matched` |
| Chats | Real | `match_messages` via API; socket realtime only if `NEXT_PUBLIC_SOCKET_URL` is set; match lifetime 24 h, +6 h per message threshold |
| Voice messages | **Fake** | `ChatVoiceNoteDemo` in the composer and in profile "voice intro" draws a random waveform; nothing is recorded or sent |
| Photo in chat | **Fake** | Composer shows an image preview but only the text is sent; the image is dropped |
| AI compatibility | Real only with `OPENROUTER_API_KEY` | Not set on Render → app shows "AI-анализ недоступен" (PR #20). A local heuristic exists but is not shown as AI in the app |
| Pulse | Real feature, label | AI guide chat (`/api/pulse/chat`): OpenRouter when configured, otherwise canned local replies. "Pulse" is used as an identifier in code (`pulse/*` routes, `isPulseProfileId`) — only the visible label may change |
| Geolocation / map | Real | Browser geolocation or profile city; app map uses real server profiles (PR #20). Test profiles have no coordinates |
| Expiring profiles | Real, **72 h** | `PROFILE_LIFE_HOURS = 72` (`server/profile-life/service.ts`) — matches the mockup's "72 часа" |
| Payments | Real code, needs keys | Stripe checkout/portal/webhook; prices come from Stripe/env. No hardcoded 249 RUB will be added |
| Push notifications | Real code, needs VAPID keys | Web push |
| Photo upload | Needs S3/R2 keys | `server/photos/storage.ts`; not configured in `render.yaml` |
| Blocking / reporting | Real | `v1/block`, `v1/report`, safety hub dialog |
| Account deletion | Real | `DELETE /api/me` with password |
| Verification badge | Real | `photo_verified` from server; test profiles 1,3,5… are seeded as verified — **test data only** |

## 4. Gap vs. the Luvia 2.0 reference

- Palette: current app uses violet `#a855f7/#7c3aed` + a full-screen illustrated background → reference uses solid `#0D0A17`, surfaces `#171222/#241B31`, gradient `#F35CA8 → #9B4DFF`, light glows, no images behind text.
- Logo: current Luvia mark (two ribbons) → reference outline gradient heart (`luvia-logo.svg`).
- Tab bar: 4 tabs with labels → icons only (flame / pin / chat / user); accessible names kept.
- Discover: add rewind + super-like around pass / like, interest chips and info button on the card, centered logo header with filters.
- Match screen: two photos in a heart, "Написать сообщение" / "Продолжить знакомства".
- Chat: bubbles (incoming surface, outgoing purple), header with avatar, composer with "+" — **no voice notes / calls** (not implemented).
- Onboarding: welcome with image + logo + slogan, interest picker grid with icons.

## 5. Plan (small reviewable commits, one stage = one review)

1. **Tokens, logo, background, navigation** — Luvia 2.0 tokens (from `tokens.css`), new logo files, plain dark background (image only on the welcome screen), icon tab bar, calmer header.
2. **Welcome + auth** — welcome, login, register (incl. interests step), forgot/reset password; existing validation/errors kept.
3. **Discover + match** — card, actions (rewind, pass, like, super-like), empty state, match screen.
4. **Chats** — list + conversation restyle; hide the fake voice-note and image-attach controls in the app (they do nothing); Pulse label → "Luvia AI" (label only).
5. **Profile, settings, likes, map, AI Connection, profile card** — move to tokens/components.
6. **Subscription / extension screens** — show backend prices only.
7. **QA** — before/after at 375 and 390, safe areas, keyboard, focus, reduced motion; e2e locally; Render deploy instructions. No production deploy without approval.

Scope rule used so far: design changes only inside the app (`html[data-ttm-app]`); the website keeps its design unless approved otherwise.

## 6. Notes / risks

- Next.js 16.4.3 is flagged by Next itself as affected by a known vulnerability (build/dev print an upgrade notice). Upgrading changes the stack → needs owner approval; not done.
- Real photos for test profiles: only AI-generated faces or consenting people (`public/demo/people/README.md`).
- The CI e2e job needs fixing separately (rate limit + email verification in CI).
