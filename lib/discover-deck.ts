import type { Locale } from "@/lib/i18n"
import type { GeoPosition } from "@/lib/geo"
import { buildDemoSwipeProfiles, type SwipeProfile } from "@/lib/demo-profiles"
import { filterProfilesForUser } from "@/lib/swipe-gender-filter"
import { getSocialState } from "@/lib/social-store"
import { isProfileBlocked } from "@/lib/trust-safety-store"
import { smartSortDiscoverProfiles } from "@/lib/discover-compatibility"
import type { DiscoverFilters } from "@/lib/discover/types"
import { applyDiscoverFilters } from "@/lib/discover/apply-filters"
import { hasActiveDiscoverFilters } from "@/lib/discover/filter-utils"
import { computeInterestOverlapForProfile } from "@/lib/discover/interest-overlap"

function enrichCompatibility(profiles: SwipeProfile[]): SwipeProfile[] {
  return profiles.map((p) => {
    const { compatibility, commonInterests } = computeInterestOverlapForProfile(p)
    return { ...p, compatibility, commonInterests }
  })
}

/** Profiles available in Discover — skips blocked and already swiped; recycles when exhausted (demo). */
export function getDiscoverDeckProfiles(
  locale: Locale,
  position: GeoPosition | null,
  filters?: DiscoverFilters
): SwipeProfile[] {
  let raw = filterProfilesForUser(buildDemoSwipeProfiles(locale, position))
  if (filters && Object.keys(filters).length > 0) {
    raw = applyDiscoverFilters(raw, filters, position)
  }
  raw = enrichCompatibility(raw)
  if (raw.length === 0) return raw

  const unblocked = raw.filter((p) => !isProfileBlocked(p.id))
  const pool = unblocked.length > 0 ? unblocked : raw

  const { passed, yourLikes, matches } = getSocialState(locale, position)
  const seen = new Set([...passed, ...yourLikes, ...matches])
  const remaining = pool.filter((p) => !seen.has(p.id))

  return smartSortDiscoverProfiles(enrichCompatibility(remaining))
}

/** True when active filters remove every profile from the demo pool. */
export function isDiscoverFilteredEmpty(
  locale: Locale,
  position: GeoPosition | null,
  filters?: DiscoverFilters
): boolean {
  if (!filters || !hasActiveDiscoverFilters(filters)) return false

  let raw = filterProfilesForUser(buildDemoSwipeProfiles(locale, position))
  const beforeCount = raw.length
  raw = applyDiscoverFilters(raw, filters, position)
  return beforeCount > 0 && raw.length === 0
}
