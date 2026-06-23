import type { DiscoverFilters } from "@/client/lib/discover/types"

const KEY = "ttm-discover-filters"

export function loadDiscoverFilters(): DiscoverFilters {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return {}
    return JSON.parse(raw) as DiscoverFilters
  } catch {
    return {}
  }
}

export function saveDiscoverFilters(filters: DiscoverFilters) {
  if (typeof window === "undefined") return
  localStorage.setItem(KEY, JSON.stringify(filters))
}
