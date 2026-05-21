# Phase 22 — Emotional Consciousness Layer

Time to Match moves from *reacting* to user actions toward *sensing* relationship atmosphere: silence, tension, pacing, and memory echoes.

## Architecture

```
useEmotionalConsciousness
  ├── analyzeEmotionalOperatingSystem (Phase 20)
  ├── analyzeEmotionalRealityExpansion (Phase 21)
  └── analyzeEmotionalConsciousness (Phase 22)
```

`useEmotionalRealityExpansion` wraps the same bundle and exposes `consciousness` for backward compatibility.

## Lib (`lib/emotional-consciousness/`)

| Module | Role |
|--------|------|
| `consciousness-engine.ts` | Communication rhythm, pacing, consistency, attachment, depth |
| `silence-understanding.ts` | calm / distant / pause / stable / fading silence |
| `reflections-v2.ts` | Cinematic AI reflections (5h cooldown, separate from Phase 21 narrative) |
| `relationship-tension.ts` | Tension kinds → motion, glow, gradients |
| `space-evolution.ts` | Shared chat space maturity (connection-scoped) |
| `atmospheric-ai.ts` | Visual silence, stillness, ambient movement orchestration |
| `memory-echoes.ts` | Atmosphere remnants from memory world |
| `analyze.ts` | Composes layer + CSS variables |

## UI (`components/emotional-consciousness/`)

- `SilenceField`, `TensionVeil`, `ConsciousnessAtmosphereVeil`, `DigitalRealismVeil`
- `SpaceEvolutionLayer` (chat)
- `ReflectionV2Whisper`
- `MemoryEchoLayer` (global + `/memories`)

Integrated in `EmotionalOsRoot`, `ChatRoomScreen`, `AppShell` (platform reflection), `MemoriesPage`.

## CSS

`app/emotional-consciousness-experience.css` — imported in `globals.css`.

## i18n

Keys prefixed with `ec*` (ru / uk / en).

## Principles

- No pseudo-psychology spam; whispers are sparse and dismissible.
- Minimal, mature, atmospheric — tension and silence drive *light/motion*, not alerts.
- Respects `prefers-reduced-motion`.
