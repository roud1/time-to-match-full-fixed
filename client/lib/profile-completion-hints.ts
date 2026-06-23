import { MIN_INTERESTS } from "@/client/lib/interests"
import { MIN_VIBES } from "@/client/lib/profile-identity"
import { getProfilePhotos } from "@/client/lib/profile-photos"
import type { StoredUserProfile } from "@/client/lib/user-profile"

export type ProfileCompletionHintId = "photo" | "bio" | "interests" | "vibe" | "verify" | "voice"

export function getPendingProfileHints(
  profile: StoredUserProfile,
  photoVerified: boolean
): ProfileCompletionHintId[] {
  const hints: ProfileCompletionHintId[] = []
  if (getProfilePhotos(profile).length === 0) hints.push("photo")
  if ((profile.bio?.trim().length ?? 0) < 12) hints.push("bio")
  if ((profile.interests?.length ?? 0) < MIN_INTERESTS) hints.push("interests")
  if ((profile.vibeIds?.length ?? 0) < MIN_VIBES && (profile.energyTagIds?.length ?? 0) === 0) {
    hints.push("vibe")
  }
  if (!photoVerified) hints.push("verify")
  if (!profile.voiceIntroRecorded) hints.push("voice")
  return hints
}

/** Profile strong enough to prioritize discover over edit prompts. */
export const PROFILE_READY_STRENGTH = 75
