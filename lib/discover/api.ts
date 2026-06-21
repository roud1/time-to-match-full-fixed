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
    body: JSON.stringify({ interestIds, interests: interestIds }),
  })
  return res.ok
}

export async function updateUserDiscoveryProfile(body: {
  purpose?: string
  gender?: "male" | "female" | null
  ageMin?: number | null
  ageMax?: number | null
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
  const ageMin = filters.ageMin ?? filters.minAge
  const ageMax = filters.ageMax ?? filters.maxAge
  if (ageMin != null) params.set("ageMin", String(ageMin))
  if (ageMax != null) params.set("ageMax", String(ageMax))
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

export type DiscoverLikeResponse =
  | { ok: true; liked: true; matched: false }
  | { ok: true; liked: true; matched: true; matchId: string }
  | { ok: false; demoFallback: true }
  | { ok: false; status: number }

export type DiscoverPassResponse =
  | { ok: true; passed: true }
  | { ok: false; demoFallback: true }
  | { ok: false; status: number }

export async function postDiscoverLike(targetUserId: string): Promise<DiscoverLikeResponse> {
  const res = await fetch("/api/discover/like", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ targetUserId }),
  })

  if (res.status === 503) {
    return { ok: false, demoFallback: true }
  }

  const data = (await res.json().catch(() => ({}))) as {
    liked?: boolean
    matched?: boolean
    matchId?: string
  }

  if (!res.ok) {
    return { ok: false, status: res.status }
  }

  if (data.matched && data.matchId) {
    return { ok: true, liked: true, matched: true, matchId: data.matchId }
  }

  return { ok: true, liked: true, matched: false }
}

export async function postDiscoverPass(targetUserId: string): Promise<DiscoverPassResponse> {
  const res = await fetch("/api/discover/pass", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ targetUserId }),
  })

  if (res.status === 503) {
    return { ok: false, demoFallback: true }
  }

  if (!res.ok) {
    return { ok: false, status: res.status }
  }

  return { ok: true, passed: true }
}
