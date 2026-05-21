# Phase 13 — Emotional Network Effect

Turn attachment into **connection experience** — not content addiction.

## Pillars

| # | System | Implementation |
|---|--------|----------------|
| 1 | Emotional retention | `lib/network/emotional-retention.ts`, `EmotionalRetentionStrip` |
| 2 | Evolution events | `connection-evolution-events.ts`, `EvolutionEventCelebration` |
| 3 | Cinematic invite | `cinematic-invite-flow.tsx`, Settings → Account |
| 4 | Shareable moments | `emotional-share-card.tsx`, `share-cards.ts` |
| 5 | Energy feed | `energy-feed.ts`, `EnergyFeedWhisper` (one line, not a feed) |
| 6 | AI emotional model | `ai-emotional-model.ts` |
| 7 | Global atmosphere | Phase 12 `world/` + evening/night whispers |
| 8 | Connection legacy | `connection-legacy.ts`, timeline on `/memories` |
| 9 | Immersion | `p13-*` CSS, celebration glow, premium share wrap |

## Rare events

- Sync Peak, Emotional Resonance, Stable Bond Week, Night Energy Surge, Deep Compatibility
- Stored in `ttm-evolution-events`, deduped per 6–24h per kind
- Scanner: `useEvolutionEventScanner` in App Shell

## Brand

**Emotional relationship platform** — not Tinder, not messenger, not social network.

## Production

See `docs/PRODUCTION_ARCHITECTURE.md`.
