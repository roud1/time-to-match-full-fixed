# Phase 18 — Emotional Presence System

Presence **without messages** — soft, atmospheric, premium. Not online/offline dots.

## Principles

- **Emotional presence kinds** (not binary online): energy active, nearby, emotionally present, sync tonight, **deep night**, quiet, distant
- **Emotional distance** shapes atmosphere (close → aligned → steady → fading → disconnected)
- **Shared presence** when both feel near + sync is strong — “you are in the same field”
- **Silent interactions** — resonance pulse, quiet field, sync echo (not typing spam)
- **Presence insights** — rare whispers (3h cooldown), dismissible
- **Connection resonance** — waves, pulse alignment, aura merge
- **Late night layer** — deeper cinematic darkness when 22:00–05:00
- **Immersive atmosphere pass** — depth, blur, particles, adaptive motion

## Library (`lib/presence/`)

| Module | Role |
|--------|------|
| `emotional-distance.ts` | Proximity + atmosphere dim + motion scale |
| `shared-presence.ts` | Together glow boost |
| `silent-interaction.ts` | Non-message signals |
| `presence-insights.ts` | Reflection cooldown |
| `connection-resonance.ts` | Resonance visualization tokens |
| `late-night-presence.ts` | Night intimacy tokens |
| `realtime-presence.ts` | Client bus `ttm-presence-updated` |
| `analyze.ts` | `analyzeEmotionalPresenceSystem()` |

World: `lib/world/emotional-presence.ts` — `resolveEmotionalPresence()`, `deep_night_energy`

## Hooks

| Hook | Role |
|------|------|
| `usePresenceRealtime` | Events + visibility-aware 12s/30s ticks |
| `useEmotionalPresenceSystem` | Full system bundle for chat |

## UI (`components/presence/`)

| Component | Where |
|-----------|--------|
| `EmotionalPresenceShell` | Chat stack wrapper |
| `PresenceImmersiveField` | Depth / blur / particles |
| `PresenceAvatarAura` | Avatar glow |
| `PresenceEmotionalPill` | Discover swipe + labels |
| `SharedPresenceField` | “Together” ambient label |
| `ConnectionResonanceLayer` | Bond space waves + merge |
| `SilentPresencePulse` | Message area quiet signal |
| `PresenceInsightWhisper` | Rare insight |
| `LateNightPresenceLayer` | Night depth veil + glow |
| `PresencePlatformAmbient` | App shell late-night whisper |

## Integration

| Surface | Behavior |
|---------|----------|
| **Chat room** | Full system; header badge + avatar aura + silent pulse + insight |
| **Inbox** | `resolveEmotionalPresence` + aura + emotional label line |
| **Discover swipe** | `PresenceEmotionalPill` (replaces green online pill) |
| **App shell** | `PresencePlatformAmbient` when late night |
| CSS | `.p18-*` in `app/product-experience.css`; merges with Phase 16–17 on `.ttm-chat-room` |

## i18n

- `presenceDeepNight`, `presenceEnergyActive`, `presenceEmotionallyPresent`, …
- `presDist*`, `presShared*`, `presSilent*`, `presInsight*`, `presLateNight*`

## Realtime

- **Client:** `broadcastPresenceUpdate()` on social/connection changes; `usePresenceRealtime` subscribes
- **Server types:** `PresenceRealtimeFrame` in `lib/server/realtime.ts`
- **Production:** bridge WebSocket frames → `ttm-presence-updated` (Supabase / Socket.IO / Ably)

## Verify

```bash
npm run build
```

Open `/app?tab=chat&with=3` — SYNC rail left (md+), presence aura on avatar, optional shared-field whisper at top of bond space.
