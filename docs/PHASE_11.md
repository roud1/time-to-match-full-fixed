# Phase 11 — Real Relationship Ecosystem

Time to Match as an **emotional operating system** for relationships — not a social feed.

## Layers

| Layer | Location | Role |
|-------|----------|------|
| Stages | `lib/ecosystem/relationship-stages.ts` | 6 user-facing stages (new → high sync), atmosphere multipliers |
| Ecology | `lib/ecosystem/relationship-ecology.ts` | Rhythm, attachment pattern, evolution trend, AI pattern bridge |
| Identity + Aura | `lib/relationship-identity/` | Personality, evolution stage, per-connection aura (Phase 8+) |
| Hook | `hooks/use-relationship-ecosystem.ts` | Composes identity + ecology + CSS vars |
| UI | `components/ecosystem/*`, `app/chat-experience.css` (eco-* block) | Shared sync space, stage ribbon, world field |
| Chat | `components/chat/chat-room-screen.tsx` | Immersive pair environment |

## Relationship stages

1. **New Connection** — minimal atmosphere
2. **Growing Energy** — faster motion, rising glow
3. **Stable Bond** — steady warmth
4. **Deep Chemistry** — cinematic particles
5. **Emotional Resonance** — deep gradients
6. **High Sync** — peak aura, strongest blur and waves

Stages derive from `ConnectionView`, sync %, and `ConnectionEvolutionStage`.

## Shared Sync Space

Not a standard chat layout: blur depth, connection waves, stage ribbon, and ecology strip wrap the dialogue.

## Dynamic world

`ConnectionWorldField` in `AppShell` — ambient orbs driven by aggregate active connection energy.

## Future-ready

- `lib/ecosystem/index.ts` — barrel for web + mobile
- Ecology reuses `analyzeRelationshipPatterns` from Phase 10
- Cloud sync / realtime hooks unchanged; stages are client-derived today

## Out of scope (by design)

- Public feeds, likes farming, streak gamification UI
- Noisy notification spam

## i18n

Keys prefixed with `eco*` in `lib/i18n.tsx` (ru / uk / en).
