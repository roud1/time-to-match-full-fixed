# Phase 15 — AI Emotional Companion Layer

Invisible emotional presence. **No** chatbot, assistant window, or AI avatar.

## Principles

- Platform **accompanies** — it does not converse
- Signals via atmosphere, sync, whispers, reflections, motion
- Reflections are **rare** (4h cooldown per connection, `localStorage`)
- Intelligence from Phase 14 powers copy and tokens; Phase 15 is the **presentation layer**

## Library (`lib/companion/`)

| Module | Role |
|--------|------|
| `emotional-presence.ts` | Atmospheric observations (calmer, stronger energy, stable rhythm, …) |
| `relationship-reflections.ts` | Rare relationship reflections + cooldown |
| `emotional-moments.ts` | Peaks, turning points, sync surge detection |
| `storytelling.ts` | Weekly / evening narrative whispers |
| `atmosphere.ts` | Breathing, pulse, blur, warmth tokens |
| `analyze.ts` | `analyzeEmotionalCompanion()` bundle |
| `platform-presence.ts` | Shell-level ambient line by time of day |

## Hooks

- `useEmotionalCompanion` — per-connection bundle from intelligence + analysis

## UI (`components/companion/`)

| Component | Surface |
|-----------|---------|
| `CompanionSilentLayer` | Breathing field + CSS vars (no input) |
| `CompanionPresenceStrip` | Chat header: state ribbon + observation + optional reflection/story |
| `CompanionMomentHalo` | Highlight emotional peaks in message area |
| `CompanionPlatformWhisper` | App shell — one ambient line |

## Integration

- **Chat** (`chat-room-screen.tsx`): `CompanionSilentLayer` → `IntelligentSpaceLayer` → `SharedSyncSpace`; replaces verbose `IntelligenceInsightStack`
- **App shell**: `CompanionPlatformWhisper` under energy feed whisper

## Styles

- `app/product-experience.css` — `.p15-*` tokens

## i18n

- Keys prefixed `comp*` (ru / uk / en)

## Verify

```bash
npm run build
```
