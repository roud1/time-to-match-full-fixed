# Phase 16 — Emotional Reality Layer

Relationships as **living digital space** — not metaverse, not games. Elegant, cinematic, premium.

## Principles

- Each connection has its own **environment** (calm, intense, night, resonance, fading)
- Atmosphere **evolves** from intelligence + companion signals (warm / steady / cool / surge)
- Energy is **visible** through waves, trails, particles, resonance — no chatbot UI
- UI is an **emotional medium** (CSS tokens, motion, depth)

## Library (`lib/reality/`)

| Module | Role |
|--------|------|
| `relationship-environment.ts` | Per-bond environment id + visual tokens |
| `atmosphere-evolution.ts` | AI-driven phase + warmth/intensity |
| `connection-energy.ts` | Wave / trail / particle / sync profile |
| `cinematic-moments.ts` | Sync peaks, chemistry, breakthrough bursts |
| `memory-cinema.ts` | AI-style summaries on archive entries |
| `reality-presence.ts` | Single ambient presence line |
| `analyze.ts` | `analyzeEmotionalReality()` bundle |

## Hooks

- `useEmotionalReality` — builds reality from intelligence + companion + sync

## UI (`components/reality/`)

| Component | Where |
|-----------|--------|
| `RelationshipRealitySpace` | Chat shared sync space — horizon, veil, energy, cinematic burst |
| `ConnectionEnergyField` | Energy waves + particles inside bond space |
| `CinematicMomentOverlay` | Peak / surge lighting burst |
| `RealityPresenceLine` | Subtle evolution observation |
| `RealityWorldAmbient` | `EmotionalWorldRoot` — platform live drift |
| `RealityMemoryCinema` | `/memories` cinematic archive |

## Integration

- **Chat:** `RelationshipRealitySpace` inside `SharedSyncSpace`; room attrs/styles merge reality tokens
- **World:** `RealityWorldAmbient` in `EmotionalWorldRoot`
- **Memories:** `RealityMemoryCinema` replaces flat archive list

## Styles

- `app/product-experience.css` — `.p16-*`

## i18n

- Keys prefixed `real*` (ru / uk / en)

## Stack

Builds on Phase 14 intelligence, Phase 15 companion — reality is the **immersive shell**.

## Verify

```bash
npm run build
```
