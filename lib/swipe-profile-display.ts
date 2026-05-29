import type { SwipeProfile } from "@/lib/demo-profiles"
import { computeDiscoverCompatibility } from "@/lib/discover-compatibility"
import { getRelationshipPersonalityLabel } from "@/lib/relationship-identity"
import type { TranslationKey } from "@/lib/i18n"

const SEEKING_SNIPPETS: Record<string, TranslationKey> = {
  warm: "discoverSeekingWarm",
  deep: "discoverSeekingDeep",
  playful: "discoverSeekingPlayful",
}

export function getProfileDisplayAbout(profile: SwipeProfile): string {
  if (profile.about?.trim()) return profile.about.trim()
  return profile.bio
}

export function getProfileSeekingLabel(
  profile: SwipeProfile,
  t: (key: TranslationKey) => string
): string {
  const compatibility = computeDiscoverCompatibility(profile)
  const personality = getRelationshipPersonalityLabel(compatibility.previewPersonality, t)
  const moodKey = SEEKING_SNIPPETS[compatibility.atmosphere === "calm" ? "warm" : compatibility.atmosphere === "intense" ? "deep" : "playful"]
  const mood = moodKey ? t(moodKey) : ""
  return mood ? `${personality} · ${mood}` : personality
}
