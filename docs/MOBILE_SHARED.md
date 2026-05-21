# Mobile shared logic

Import from `@/lib/shared` in Expo / React Native:

```ts
import {
  deriveLiveRelationshipState,
  computeDailyReturnInsights,
  buildEmotionalNotifications,
  buildSyncShareMoment,
  analyzeRelationshipPatterns,
} from "@/lib/shared"
```

Rules:

- No React in `lib/shared/*`
- Persist with AsyncStorage mirroring `localStorage` keys (`ttm-daily-return`, `ttm-connections`)
- UI: reimplement `components/growth/*` in native with same data contracts
