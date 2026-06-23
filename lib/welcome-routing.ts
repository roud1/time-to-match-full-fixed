import { PROFILE_READY_STRENGTH } from "@/lib/profile-completion-hints"
import { computeProfileStrength } from "@/lib/profile-completion"
import type { StoredUserProfile } from "@/lib/user-profile"
import { isWelcomeSeen } from "@/lib/welcome-seen"

/** Post-auth destination: skip welcome when already seen or profile is strong enough. */
export function postAuthPath(profile: StoredUserProfile | null): "/app" | "/welcome" {
  if (isWelcomeSeen()) return "/app"
  if (profile && computeProfileStrength(profile) >= PROFILE_READY_STRENGTH) return "/app"
  return "/welcome"
}

export function shouldSkipWelcome(profile: StoredUserProfile | null): boolean {
  if (!profile) return false
  if (isWelcomeSeen()) return true
  return computeProfileStrength(profile) >= PROFILE_READY_STRENGTH
}
