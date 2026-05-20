import type { Locale } from "@/lib/i18n"
import type { GeoPosition } from "@/lib/geo"
import { buildDemoSwipeProfiles, type SwipeProfile } from "@/lib/demo-profiles"
import { filterProfilesForUser } from "@/lib/swipe-gender-filter"
import { getSocialState } from "@/lib/social-store"
import { demoPeerPresenceWeight } from "@/lib/profile-life"
import { getProfileLifeView } from "@/lib/profile-life-store"
import { isProfileBlocked } from "@/lib/trust-safety-store"

/** Profiles available in Discover — skips blocked and already swiped; recycles when exhausted (demo). */
export function getDiscoverDeckProfiles(
  locale: Locale,
  position: GeoPosition | null
): SwipeProfile[] {
  const raw = filterProfilesForUser(buildDemoSwipeProfiles(locale, position))
  if (raw.length === 0) return raw

  const unblocked = raw.filter((p) => !isProfileBlocked(p.id))
  const pool = unblocked.length > 0 ? unblocked : raw

  const { passed, yourLikes, matches } = getSocialState(locale, position)
  const seen = new Set([...passed, ...yourLikes, ...matches])
  const remaining = pool.filter((p) => !seen.has(p.id))
  const list = remaining.length > 0 ? remaining : pool

  const ownLife = typeof window !== "undefined" ? getProfileLifeView() : null
  const ownWeight = ownLife?.presenceWeight ?? 1

  return [...list].sort((a, b) => {
    const wa = demoPeerPresenceWeight(a.id) * ownWeight
    const wb = demoPeerPresenceWeight(b.id) * ownWeight
    return wb - wa
  })
}
