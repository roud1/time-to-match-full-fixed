# Phase 20 — Emotional Operating System Layer

Time to Match as an **emotional operating system** — not a dating app UI.

## Principles

- **Single organism** — connection hub, atmosphere, orchestration, motion, memory, continuity react together
- **Universal connection engine** — all surfaces derive from sync, chemistry, rhythm, evolution
- **AI emotional director** — pacing, lighting, UI density, whispers (not a chatbot)
- **Global atmosphere network** — platform mood waves, cinematic night
- **Relationship reality fields** — per-chat resonance depth
- **Emotional continuity** — bonds breathe while user is away
- **Immersive UX** — invisible layers, adaptive transparency, minimal noise

## Library (`lib/emotional-os/`)

| Module | Role |
|--------|------|
| `connection-hub.ts` | Platform-wide bond pulse from all active connections |
| `orchestrator.ts` | AI director — pacing, lighting, transitions |
| `atmosphere-network.ts` | Living platform mood + waves |
| `relationship-reality.ts` | Per-profile resonance field |
| `memory-engine.ts` | Archive atmosphere recall |
| `continuity.ts` | Offline breath + presence remain |
| `motion-light.ts` | Final cinematic motion/light tokens |
| `analyze.ts` | `analyzeEmotionalOperatingSystem()` |

## Hooks

- `useEmotionalOperatingSystem` — realtime ticks + world state + optional chat context
- `touchEmotionalOsActivity` — refresh continuity anchor

## UI (`components/emotional-os/`)

| Component | Role |
|-----------|------|
| `EmotionalOsRoot` | Replaces world shell — OS + legacy ambient layers |
| `AtmosphereNetworkLayer` | Global emotional waves |
| `OrchestratorVeil` | Director lighting pass |
| `ContinuityBreath` | Slow platform pulse |
| `EmotionalOsWhisper` | Rare platform status line |
| `MemoryAtmosphere` | Memories page storytelling veil |
| `ImmersionFrame` | Optional per-surface OS attrs |

## Integration

| Surface | Integration |
|---------|-------------|
| **App shell** | `EmotionalWorldRoot` → `EmotionalOsRoot` + `EmotionalOsWhisper` |
| **Chat room** | Merges `emotionalOs` attrs/style on `.ttm-chat-room` |
| **Memories** | `MemoryAtmosphere` |
| **Discover** | Inherits global `eo-root` tokens |

## CSS

- `app/emotional-os-experience.css` — `.eo-*` tokens
- CSS variables: `--eo-platform-sync`, `--eo-pacing`, `--eo-wave-amp`, `--eo-continuity-breath`, …

## i18n

- `eoWorldEnter`, `eoOrchestrator*`, `eoNetworkMood*`, `eoMemory*`, `eoContinuityWhisper`

## Architecture note

`EmotionalWorldRoot` is a thin wrapper over `EmotionalOsRoot` for backward compatibility. Phases 12–18 layers remain; Phase 20 orchestrates them at the root.

## Verify

```bash
npm run build
```

Open `/app` — subtle platform whisper under header; chat inherits resonance tier; `/memories` shows memory atmosphere line.
