import type { SwipeProfile } from "@/lib/demo-profiles"
import type { RelationshipPersonality } from "@/lib/relationship-identity/types"
import { normalizePersonality } from "@/lib/relationship-identity/personality"
import { demoPeerPresenceWeight } from "@/lib/profile-life"
import type { TranslationKey } from "@/lib/i18n"
import { getUserProfile } from "@/lib/user-profile"
import { INTERESTS } from "@/lib/interests"

export type ProfileAtmosphere =
  | "warm"
  | "mysterious"
  | "intense"
  | "calm"
  | "cinematic"
  | "minimal"

export type CompatibilityHintId =
  | "high_night_energy"
  | "calm_connection"
  | "strong_conversation"
  | "deep_chemistry"
  | "magnetic_pull"
  | "slow_burn_resonance"
  | "stable_rhythm"

export type DiscoverCompatibility = {
  resonancePercent: number
  energyLevel: number
  conversationPotential: number
  chemistryHint: CompatibilityHintId
  previewPersonality: RelationshipPersonality
  atmosphere: ProfileAtmosphere
}

const HINT_I18N: Record<CompatibilityHintId, TranslationKey> = {
  high_night_energy: "discoverHintNightEnergy",
  calm_connection: "discoverHintCalmConnection",
  strong_conversation: "discoverHintStrongConversation",
  deep_chemistry: "discoverHintDeepChemistry",
  magnetic_pull: "discoverHintMagneticPull",
  slow_burn_resonance: "discoverHintSlowBurn",
  stable_rhythm: "discoverHintStableRhythm",
}

const ATMOSPHERE_I18N: Record<ProfileAtmosphere, TranslationKey> = {
  warm: "discoverAtmosphereWarm",
  mysterious: "discoverAtmosphereMysterious",
  intense: "discoverAtmosphereIntense",
  calm: "discoverAtmosphereCalm",
  cinematic: "discoverAtmosphereCinematic",
  minimal: "discoverAtmosphereMinimal",
}

function hash(id: number, salt = 0) {
  return ((id * 7919 + salt * 104729) % 997) / 997
}

export function getCompatibilityHintLabel(
  hint: CompatibilityHintId,
  t: (key: TranslationKey) => string
): string {
  return t(HINT_I18N[hint])
}

export function getProfileAtmosphereLabel(
  atmosphere: ProfileAtmosphere,
  t: (key: TranslationKey) => string
): string {
  return t(ATMOSPHERE_I18N[atmosphere])
}

export function deriveProfileAtmosphere(profile: SwipeProfile): ProfileAtmosphere {
  const h = hash(profile.id)
  if (profile.interests.some((i) => /музык|music|кино|cinema|art|искусств/i.test(i))) {
    return h > 0.55 ? "cinematic" : "intense"
  }
  if (profile.interests.some((i) => /йога|yoga|книг|book|кофе|coffee/i.test(i))) {
    return "calm"
  }
  if (profile.bio.length > 42) return "mysterious"
  if (h < 0.25) return "minimal"
  if (h < 0.5) return "warm"
  return "intense"
}

function deriveHint(
  profile: SwipeProfile,
  resonance: number,
  personality: RelationshipPersonality
): CompatibilityHintId {
  if (personality === "night_energy") return "high_night_energy"
  if (personality === "calm_connection" || personality === "stable_bond") return "calm_connection"
  if (personality === "deep_sync") return "deep_chemistry"
  if (personality === "magnetic_chemistry" || personality === "intense_attraction")
    return "magnetic_pull"
  if (personality === "slow_burn") return "slow_burn_resonance"
  if (resonance >= 78) return "strong_conversation"
  return "stable_rhythm"
}

/** AI-style resonance scoring from profile + viewer signals (demo). */
export function computeDiscoverCompatibility(profile: SwipeProfile): DiscoverCompatibility {
  const me = getUserProfile()
  const presence = demoPeerPresenceWeight(profile.id)
  const h = hash(profile.id, 3)

  let resonance = 58 + Math.round(h * 34) + Math.round(presence * 12)
  if (profile.age >= 24 && profile.age <= 32) resonance += 4
  if (profile.bio.length >= 28) resonance += 3

  if (me?.interests?.length) {
    const myLabels = new Set<string>(
      me.interests.flatMap((id) => {
        const item = INTERESTS.find((i) => i.id === id)
        return item ? [item.ru, item.uk, item.en] : []
      })
    )
    const overlap = profile.interests.filter((label) => myLabels.has(label)).length
    resonance += overlap * 5
  }

  resonance = Math.min(97, Math.max(52, resonance))

  const energyLevel = Math.min(100, Math.round(40 + presence * 35 + h * 25))
  const conversationPotential = Math.min(
    100,
    Math.round(resonance * 0.55 + (profile.interests.length >= 3 ? 18 : 8))
  )

  let previewPersonality: RelationshipPersonality = "slow_burn"
  if (h > 0.72) previewPersonality = "magnetic_chemistry"
  else if (h > 0.58) previewPersonality = "deep_sync"
  else if (presence > 0.85) previewPersonality = "night_energy"
  else if (profile.interests.includes("Йога") || profile.interests.includes("Yoga"))
    previewPersonality = "calm_connection"
  else if (h < 0.35) previewPersonality = "emotional_chaos"

  previewPersonality = normalizePersonality(previewPersonality)

  const atmosphere = deriveProfileAtmosphere(profile)
  const chemistryHint = deriveHint(profile, resonance, previewPersonality)

  return {
    resonancePercent: resonance,
    energyLevel,
    conversationPotential,
    chemistryHint,
    previewPersonality,
    atmosphere,
  }
}

export function smartSortDiscoverProfiles(profiles: SwipeProfile[]): SwipeProfile[] {
  return [...profiles].sort((a, b) => {
    const ca = computeDiscoverCompatibility(a)
    const cb = computeDiscoverCompatibility(b)
    const scoreA = ca.resonancePercent * 0.5 + ca.energyLevel * 0.3 + demoPeerPresenceWeight(a.id) * 20
    const scoreB = cb.resonancePercent * 0.5 + cb.energyLevel * 0.3 + demoPeerPresenceWeight(b.id) * 20
    return scoreB - scoreA
  })
}

export const ATMOSPHERE_AURA: Record<
  ProfileAtmosphere,
  { glow: string; gradient: string; accent: string }
> = {
  warm: {
    glow: "rgba(220, 170, 120, 0.2)",
    gradient: "linear-gradient(165deg, rgba(180,120,80,0.14) 0%, transparent 55%)",
    accent: "rgba(251, 191, 140, 0.35)",
  },
  mysterious: {
    glow: "rgba(120, 100, 180, 0.22)",
    gradient: "linear-gradient(200deg, rgba(80,60,120,0.18) 0%, transparent 60%)",
    accent: "rgba(167, 139, 250, 0.3)",
  },
  intense: {
    glow: "rgba(255, 140, 160, 0.22)",
    gradient: "linear-gradient(140deg, rgba(200,80,120,0.16) 0%, transparent 50%)",
    accent: "rgba(244, 114, 182, 0.35)",
  },
  calm: {
    glow: "rgba(140, 180, 200, 0.16)",
    gradient: "linear-gradient(180deg, rgba(100,140,160,0.1) 0%, transparent 55%)",
    accent: "rgba(148, 163, 184, 0.28)",
  },
  cinematic: {
    glow: "rgba(200, 195, 255, 0.24)",
    gradient: "linear-gradient(160deg, rgba(140,130,220,0.15) 0%, transparent 58%)",
    accent: "rgba(199, 210, 254, 0.38)",
  },
  minimal: {
    glow: "rgba(255, 255, 255, 0.1)",
    gradient: "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 50%)",
    accent: "rgba(255, 255, 255, 0.2)",
  },
}
