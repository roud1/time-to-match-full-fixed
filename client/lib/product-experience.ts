import type { StoredUserProfile } from "@/client/lib/user-profile"

const FIRST_MATCH_KEY = "ttm-first-match-celebrated"

export function isFirstMatchPending(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem(FIRST_MATCH_KEY) !== "1"
}

export function markFirstMatchCelebrated(): void {
  if (typeof window === "undefined") return
  localStorage.setItem(FIRST_MATCH_KEY, "1")
}

export type ProfileAura = {
  hue: number
  saturation: number
  glow: string
  gradient: string
}

const VIBE_HUES: Record<string, number> = {
  warm: 32,
  curious: 210,
  bold: 280,
  calm: 200,
  playful: 45,
  deep: 265,
  social: 175,
  minimal: 240,
}

export function getProfileAura(profile: Pick<StoredUserProfile, "vibeIds" | "mood" | "energyTagIds">): ProfileAura {
  const vibes = profile.vibeIds ?? []
  const primary = vibes[0] ?? "calm"
  const hue = VIBE_HUES[primary] ?? 250
  const moodBoost = profile.mood === "charged" || profile.mood === "wild" ? 0.12 : 0
  const energyCount = profile.energyTagIds?.length ?? 0
  const sat = Math.min(0.55, 0.28 + vibes.length * 0.04 + moodBoost + energyCount * 0.02)
  return {
    hue,
    saturation: sat,
    glow: `hsla(${hue}, 72%, 62%, 0.35)`,
    gradient: `linear-gradient(135deg, hsla(${hue}, 65%, 58%, 0.45), hsla(${(hue + 40) % 360}, 55%, 52%, 0.2))`,
  }
}
