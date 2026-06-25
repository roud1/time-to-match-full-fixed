import type { DiscoverFilters, DiscoverProfile } from "@/client/lib/discover/types"
import type { Interest } from "@/client/lib/interests/types"

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
  coords?: { lat: number; lng: number } | null,
  pagination?: { cursor?: string | null; limit?: number }
): Promise<{ profiles: DiscoverProfile[]; nextCursor: string | null }> {
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
  if (pagination?.cursor) params.set("cursor", pagination.cursor)
  if (pagination?.limit != null) params.set("limit", String(pagination.limit))

  const qs = params.toString()
  const res = await fetch(`/api/discover${qs ? `?${qs}` : ""}`, { credentials: "include" })
  if (!res.ok) return { profiles: [], nextCursor: null }
  const data = (await res.json()) as { profiles?: DiscoverProfile[]; nextCursor?: string | null }
  return {
    profiles: data.profiles ?? [],
    nextCursor: data.nextCursor ?? null,
  }
}

export type DiscoverLikeResponse =
  | { ok: true; liked: true; matched: false }
  | { ok: true; liked: true; matched: true; matchId: string }
  | { ok: false; demoFallback: true }
  | { ok: false; likeLimitReached: true }
  | { ok: false; status: number; serverError: true }

export type DiscoverPassResponse =
  | { ok: true; passed: true }
  | { ok: false; demoFallback: true }
  | { ok: false; status: number; serverError: true }

export async function postDiscoverLike(
  targetUserId: string,
  options?: { superLike?: boolean }
): Promise<DiscoverLikeResponse> {
  const res = await fetch("/api/discover/like", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ targetUserId, superLike: options?.superLike }),
  })

  if (res.status === 503) {
    return { ok: false, demoFallback: true }
  }

  const data = (await res.json().catch(() => ({}))) as {
    liked?: boolean
    matched?: boolean
    matchId?: string
    error?: string
    code?: string
  }

  if (!res.ok) {
    if (res.status === 429 && (data.code === "LIKE_LIMIT_REACHED" || data.error === "LIKE_LIMIT_REACHED")) {
      return { ok: false, likeLimitReached: true }
    }
    return { ok: false, status: res.status, serverError: true }
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
    return { ok: false, status: res.status, serverError: true }
  }

  return { ok: true, passed: true }
}

export type DiscoverRewindResponse =
  | { ok: true; rewound: true }
  | { ok: false; premiumRequired: true }
  | { ok: false; status: number; serverError: true }

export async function postDiscoverRewind(targetUserId: string): Promise<DiscoverRewindResponse> {
  const res = await fetch("/api/discover/rewind", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ targetUserId }),
  })

  if (res.status === 403) {
    const data = (await res.json().catch(() => ({}))) as { code?: string }
    if (data.code === "premium_required") return { ok: false, premiumRequired: true }
  }

  if (!res.ok) {
    return { ok: false, status: res.status, serverError: true }
  }

  return { ok: true, rewound: true }
}
