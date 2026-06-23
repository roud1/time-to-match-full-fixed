import type { DiscoverFilters } from "@/client/lib/discover/types"

export function hasActiveDiscoverFilters(filters: DiscoverFilters): boolean {
  return (
    Boolean(filters.gender) ||
    filters.minAge != null ||
    filters.maxAge != null ||
    filters.ageMin != null ||
    filters.ageMax != null ||
    filters.maxDistance != null ||
    Boolean(filters.purpose)
  )
}

export function clearDiscoverFilters(): DiscoverFilters {
  return {}
}
