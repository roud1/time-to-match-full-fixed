import type { StoredUserProfile } from "@/lib/user-profile"
import { getProfilePhotos } from "@/lib/profile-photos"
import { MIN_INTERESTS } from "@/lib/interests"
import { MIN_VIBES } from "@/lib/profile-identity"

/** 0–100 weighted “profile strength” for UI only. */
export function computeProfileStrength(p: StoredUserProfile): number {
  let score = 0
  if (p.name?.trim()) score += 8
  if (p.email?.trim()) score += 4
  const photos = getProfilePhotos(p)
  score += Math.min(22, photos.length * 11)
  if ((p.bio?.length ?? 0) >= 40) score += 18
  else if ((p.bio?.length ?? 0) >= 12) score += 10
  if ((p.interests?.length ?? 0) >= MIN_INTERESTS) score += 14
  else score += Math.min(14, (p.interests?.length ?? 0) * 3)
  if ((p.vibeIds?.length ?? 0) >= MIN_VIBES) score += 12
  else score += Math.min(12, (p.vibeIds?.length ?? 0) * 4)
  if (p.intention) score += 10
  if (p.mood) score += 6
  if ((p.promptFavorite?.length ?? 0) >= 8) score += 6
  if (p.voiceIntroRecorded) score += 10
  return Math.min(100, Math.round(score))
}
