# Mobile shared layer (`lib/shared`)

Phase 3 documents the shared module; a full **React Native / Expo** app is planned post–Phase 3.

## Purpose

`lib/shared` holds **framework-agnostic** relationship logic importable from:

- Next.js web app (current)
- Future Expo / React Native client

Keep modules free of React DOM APIs and `window` where possible.

## Exports (`lib/shared/index.ts`)

| Module | Description |
|--------|-------------|
| `relationship-live-state` | Live relationship state tokens + data attrs |
| `daily-return` | Daily visit insights |
| `emotional-notifications` | Notification copy builders |
| `share-moments` | Share card text / native share helpers |
| `relationship-insights` | Pattern analysis |

## Using from React Native (future)

```ts
import { deriveLiveRelationshipState, buildEmotionalNotifications } from "@/lib/shared"
```

Configure Metro/Expo `tsconfig` paths to resolve `@/lib/shared` from a monorepo or git submodule.

## Not in scope (Phase 3)

- Expo project scaffold
- Push notifications on native (web push exists)
- Native navigation / swipe deck

Track mobile app work after Phase 3 billing + realtime are stable in production.
