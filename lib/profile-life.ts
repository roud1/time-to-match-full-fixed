export type ProfileLifeState = "active" | "fading" | "sleeping" | "archived"

export type ProfileLifeView = {
  state: ProfileLifeState
  lastActiveAt: number
  idleMs: number
  /** 0–1 within fading window (higher = closer to sleep). */
  fadeProgress: number
  glowTier: 0 | 1 | 2 | 3
  discoverable: boolean
  presenceWeight: number
}

export const LIFE_ACTIVE_MS = 48 * 60 * 60 * 1000
export const LIFE_SLEEPING_MS = 7 * 24 * 60 * 60 * 1000
export const LIFE_ARCHIVED_MS = 30 * 24 * 60 * 60 * 1000

export function computeProfileLife(lastActiveAt: number, now = Date.now()): ProfileLifeView {
  const idleMs = Math.max(0, now - lastActiveAt)

  let state: ProfileLifeState = "active"
  if (idleMs >= LIFE_ARCHIVED_MS) state = "archived"
  else if (idleMs >= LIFE_SLEEPING_MS) state = "sleeping"
  else if (idleMs >= LIFE_ACTIVE_MS) state = "fading"

  const fadingSpan = LIFE_SLEEPING_MS - LIFE_ACTIVE_MS
  const fadeProgress =
    state === "fading"
      ? Math.min(1, (idleMs - LIFE_ACTIVE_MS) / fadingSpan)
      : state === "sleeping" || state === "archived"
        ? 1
        : 0

  let glowTier: ProfileLifeView["glowTier"] = 3
  if (state === "archived") glowTier = 0
  else if (state === "sleeping") glowTier = 0
  else if (state === "fading") glowTier = fadeProgress > 0.66 ? 1 : 2
  else glowTier = 3

  const discoverable = state === "active" || state === "fading"
  const presenceWeight =
    state === "active" ? 1 : state === "fading" ? 0.55 - fadeProgress * 0.35 : 0.12

  return {
    state,
    lastActiveAt,
    idleMs,
    fadeProgress,
    glowTier,
    discoverable,
    presenceWeight,
  }
}

export type DemoPeerPresence = "active" | "recent" | "fading"

/** Demo presence tier for discover / swipe cards. */
export function demoPeerPresence(profileId: number): DemoPeerPresence {
  const n = profileId % 5
  if (n <= 2) return "active"
  if (n === 3) return "recent"
  return "fading"
}

export function demoPeerPresenceWeight(profileId: number): number {
  const p = demoPeerPresence(profileId)
  if (p === "active") return 1
  if (p === "recent") return 0.65
  return 0.35
}
