import type { SwipeProfile } from "@/lib/demo-profiles"
import type { StoredUserProfile } from "@/lib/user-profile"
import { getUserProfile } from "@/lib/user-profile"

export type ProfileGender = SwipeProfile["gender"]

/** Demo deck: even indices are women, odd indices are men. */
export function demoProfileGenderFromIndex(index: number): ProfileGender {
  return index % 2 === 0 ? "female" : "male"
}

export function getSwipeGenderPreferences(
  user: Pick<StoredUserProfile, "gender" | "lookingFor"> | null
): ProfileGender[] | null {
  if (!user) return null

  if (user.lookingFor === "women") return ["female"]
  if (user.lookingFor === "men") return ["male"]
  if (user.lookingFor === "all") return null

  if (user.gender === "male") return ["female"]
  if (user.gender === "female") return ["male"]
  return null
}

export function filterProfilesForUser<T extends Pick<SwipeProfile, "gender">>(
  profiles: T[],
  user: Pick<StoredUserProfile, "gender" | "lookingFor"> | null = getUserProfile()
): T[] {
  const allowed = getSwipeGenderPreferences(user)
  if (!allowed) return profiles
  const set = new Set(allowed)
  return profiles.filter((p) => set.has(p.gender))
}
