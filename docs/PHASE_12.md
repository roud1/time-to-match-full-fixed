# Phase 12 — Realtime Emotional World System

Time to Match as a **living emotional environment**, not a static website.

## Architecture

| Layer | Path | Role |
|-------|------|------|
| Presence | `lib/world/emotional-presence.ts` | Energy Active, Sync Tonight, etc. |
| Atmosphere | `lib/world/global-atmosphere.ts` | night / evening / day / morning tokens |
| Evolution | `lib/world/relationship-evolution.ts` | AI maturity + rhythm over time |
| World state | `lib/world/world-state.ts` | Global energy + pulse |
| Events | `lib/world/world-events.ts` | Client bus → future WebSocket |
| Hooks | `hooks/use-emotional-world.ts`, `use-global-atmosphere.ts` | Realtime ticks + events |
| UI | `components/world/*` | Field, atmosphere, presence, playback |
| Styles | `app/product-experience.css` (`.world-*`) | Immersion layers |

## Realtime today

- `ttm-connection-updated` / `ttm-social-updated` → `subscribeWorldPulse`
- 2.5s tick + `runConnectionTicks` for decay/sync
- `emitWorldPulse("sync")` on message send

## Production path

See `lib/server/realtime.ts` — authoritative messages in Postgres; Redis/pub-sub for typing; WS gateway for fan-out.

## Integration

- **App shell:** `EmotionalWorldRoot` (ambient field + global atmosphere)
- **Chat:** emotional presence badge, `ConnectionPulseLayer`, `RelationshipEvolutionPanel`
- **Memories:** tap card → `MemoryPlaybackOverlay` (blur, glow, stage)

## Not in scope

Social feeds, gamification, binary online-only UX.
