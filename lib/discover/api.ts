import type { DiscoverFilters, DiscoverProfile } from "@/lib/discover/types"
import type { Interest } from "@/lib/interests/types"

export async function fetchInterests(): Promise<Interest[]> {
  const res = await fetch("/api/interests", { credentials: "include" })
  if (!res.ok) return []
  const data = (await res.json()) as { interests?: Interest[] }
  return data.interests ?? []
}

export async function saveUserInterests(interestIds: number[]): Promise<boolean> {
  const res = await fetch("/api/user/interests", {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ interestIds }),
  })
  return res.ok
}

export async function updateUserDiscoveryProfile(body: {
  purpose?: string
  latitude?: number | null
  longitude?: number | null
  maxDistance?: number
  profile?: Record<string, unknown>
}): Promise<boolean> {
  const res = await fetch("/api/user/profile", {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  return res.ok
}

export async function fetchDiscoverProfiles(
  filters: DiscoverFilters,
  coords?: { lat: number; lng: number } | null
): Promise<DiscoverProfile[]> {
  const params = new URLSearchParams()
  if (filters.purpose) params.set("purpose", filters.purpose)
  if (filters.gender) params.set("gender", filters.gender)
  if (filters.minAge != null) params.set("minAge", String(filters.minAge))
  if (filters.maxAge != null) params.set("maxAge", String(filters.maxAge))
  if (filters.maxDistance != null) params.set("maxDistance", String(filters.maxDistance))
  if (coords) {
    params.set("lat", String(coords.lat))
    params.set("lng", String(coords.lng))
  }

  const qs = params.toString()
  const res = await fetch(`/api/discover${qs ? `?${qs}` : ""}`, { credentials: "include" })
  if (!res.ok) return []
  const data = (await res.json()) as { profiles?: DiscoverProfile[] }
  return data.profiles ?? []
}
