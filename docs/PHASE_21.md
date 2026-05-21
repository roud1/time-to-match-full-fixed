# Phase 21 — Emotional Reality Expansion

Platform becomes part of the user's **emotional life** — not a dating app UI.

## Principles

- **Life rhythm** — active hours, silence, night intimacy from real message patterns
- **Relationship weather** — cinematic metaphor (calm, storm, quiet night, warm glow, fading light)
- **Cinematic states** — quiet intimacy, gravity, slow resonance, stable orbit, deep silence
- **Adaptive world atmosphere** — lighting, motion, glow follow rhythm + weather + OS
- **Presence immersion** — proximity fields, aura, resonance pulses
- **AI narrative** — emotional interpretations (4h cooldown), not stories
- **Memory world** — fragments and atmosphere remnants
- **Platform soul** — atmospheric presence, not mascot

## Library (`lib/reality-expansion/`)

| Module | Role |
|--------|------|
| `life-rhythm.ts` | User emotional life cycle |
| `relationship-weather.ts` | Metaphorical weather |
| `cinematic-states.ts` | Deep atmosphere states |
| `adaptive-atmosphere.ts` | Unified lighting/motion tokens |
| `presence-immersion.ts` | Physical proximity feel |
| `relationship-narrative.ts` | Rare interpretation whispers |
| `memory-world.ts` | Archive fragments |
| `platform-soul.ts` | Platform soul presence |
| `analyze.ts` | `analyzeEmotionalRealityExpansion(os, …)` |

Builds on Phase 20 `EmotionalOperatingSystem`.

## Hook

`useEmotionalRealityExpansion` — OS + expansion bundle, realtime ticks

## UI (`components/reality-expansion/`)

| Component | Where |
|-----------|--------|
| `WeatherLayer` | `EmotionalOsRoot` |
| `CinematicStateVeil` | Root |
| `LivingUiVeil` | Root |
| `PlatformSoulField` | Root + app shell |
| `PresenceProximityLayer` | Chat room |
| `RelationshipNarrativeWhisper` | Shell + chat |
| `MemoryFragmentField` | `/memories` |

## Integration

- `EmotionalOsRoot` → class `er-reality-root`, merges `data-emotional-reality`
- **Chat** — expansion attrs + proximity + connection narrative
- **Memories** — memory world fragments
- **Shell** — soul line + platform narrative

## CSS

`app/reality-expansion-experience.css` — `.er-*`

## i18n

`erRhythm*`, `erWeather*`, `erCine*`, `erNarrative*`, `erSoul*`, `erMemory*`

## Verify

```bash
npm run build
```
