# Phase 9 — Launch-Ready Product Experience

## Layers

| Layer | Path |
|-------|------|
| Styles | `app/product-experience.css` |
| Identity extensions | `lib/profile-identity.ts`, `lib/user-profile.ts` |
| Product logic | `lib/product-experience.ts`, `lib/product-notifications.ts` |
| Motion presets | `lib/product-motion.ts` |
| UI primitives | `components/product/*` |

## Flows

- **Onboarding**: `OnboardingFlow` — 4 cinematic slides + `OnboardingSyncVisual`
- **Register**: step 3 adds energy tags, communication style, connection preferences
- **Welcome** (`/welcome`): cinematic ritual, sync visual, `ProfileIdentitySummary`, avatar ring
- **Profile edit**: same identity pickers + `ProfileAura` + atmosphere block
- **Settings** (`/settings`): emotional copy per section, link to notifications
- **First match**: `isFirstMatchPending()` → enhanced `MatchCelebrationScreen`
- **Empty states**: `EmotionalEmptyState` in discover, likes, chat, notifications
- **Notifications**: `/notifications` — i18n-driven emotional copy
- **Social atmosphere**: `LiveActivityFeed` in `AppShell`

## Mobile prep

- Reuse `lib/product-motion.ts` and `lib/motion-system.ts` in native shell
- Product components are self-contained under `components/product/`
