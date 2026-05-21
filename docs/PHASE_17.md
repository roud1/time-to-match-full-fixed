# Phase 17 — Emotional Time System

Time is a **first-class dimension** of every bond — not countdown pressure, not streak gamification.

## Principles

- Live **time flow** (morning / day / evening / night) affects glow, motion, intimacy
- Bonds **evolve**: depth from consistency & night talks; dim from idle time
- **Visual time states**: fresh → growing → stable → night → fading → echo
- **Rhythm engine**: hour overlap, daily cadence, pacing (no toxic timers)
- **Time memories** as emotional fragments, not notifications
- **Offline presence**: subtle glow when away — bond continues emotionally

## Library (`lib/time/`)

| Module | Role |
|--------|------|
| `time-flow.ts` | Clock-of-day tokens |
| `relationship-time-state.ts` | Visual state id + copy |
| `time-evolution.ts` | deepening / steady / cooling / dormant |
| `connection-rhythm-engine.ts` | Overlap, consistency, pacing |
| `time-memories.ts` | Fragment headlines (night, stable days, rhythm shift) |
| `emotional-timeline.ts` | Living timeline entries |
| `offline-presence.ts` | Away-state glow |
| `temporal-atmosphere.ts` | Merge flow + evolution + rhythm |
| `analyze.ts` | `analyzeEmotionalTime()` |

## Hooks

- `useEmotionalTime` — per chat connection (60s clock tick)
- `useEmotionalTimeline` — `/memories` aggregate timeline

## UI (`components/time/`)

| Component | Where |
|-----------|--------|
| `TemporalAtmosphereLayer` | Chat wrapper — gradients + fades |
| `RelationshipTimeStateRibbon` | Time state label |
| `ConnectionRhythmStrip` | Rhythm insight |
| `TimeMemoryWhisper` | Top time memory fragment |
| `OfflinePresenceGlow` | Scroll area when idle |
| `EmotionalTimeTimeline` | `/memories` breathing timeline |
| `TimeFlowAmbient` | `EmotionalWorldRoot` |

## Integration

- Chat: `TemporalAtmosphereLayer` → companion → intelligence → reality stack; room CSS merges time tokens
- World: `TimeFlowAmbient` alongside reality/world ambient
- Memories: `EmotionalTimeTimeline` replaces legacy timeline

## Styles

- `app/product-experience.css` — `.p17-*`

## i18n

- Keys prefixed `time*` (ru / uk / en)

## Performance

- `useMemo` analysis bundles
- Hour refresh interval: **60s** (not per-frame)
- CSS variables for rendering — no layout thrash

## Verify

```bash
npm run build
```
