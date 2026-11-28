import type { StoredUserProfile } from "@/client/lib/user-profile"
import type { InterestId } from "@/client/lib/interests"
import { getCityCoords } from "@/client/lib/cities"
import {
  fetchInterests,
  saveUserInterests,
  updateUserDiscoveryProfile,
} from "@/client/lib/discover/api"
import { shareInflight } from "@/client/lib/inflight"
import { interestIdsFromSlugs, slugsFromInterestIds } from "@/client/lib/discover/interest-overlap"

export type AppMode = "demo" | "production"

export type AuthUser = {
  id: string
  email: string
  name: string
}

type AuthResult =
  | { ok: true; user: AuthUser }
  | { ok: false; status: number; message?: string; demoFallback?: boolean; errorCode?: string }

let cachedMode: { mode: AppMode; at: number } | null = null
/** The deployment mode never changes while the page is open; re-check rarely. */
const MODE_TTL_MS = 10 * 60_000
const MODE_STORAGE_KEY = "ttm-app-mode"

function readStoredMode(): { mode: AppMode; at: number } | null {
  try {
    const raw = sessionStorage.getItem(MODE_STORAGE_KEY)
    if (!raw) return null
    const v = JSON.parse(raw) as { mode?: string; at?: number }
    if ((v.mode === "demo" || v.mode === "production") && typeof v.at === "number") {
      return { mode: v.mode, at: v.at }
    }
  } catch {
    /* storage blocked */
  }
  return null
}

export async function getAppMode(): Promise<AppMode> {
  if (!cachedMode && typeof window !== "undefined") cachedMode = readStoredMode()
  if (cachedMode && Date.now() - cachedMode.at < MODE_TTL_MS) return cachedMode.mode
  return shareInflight("app-mode", async () => {
    try {
      const res = await fetch("/api/ready", { cache: "no-store" })
      const data = (await res.json()) as { mode?: string }
      const mode: AppMode = data.mode === "demo" ? "demo" : "production"
      cachedMode = { mode, at: Date.now() }
      try {
        sessionStorage.setItem(MODE_STORAGE_KEY, JSON.stringify(cachedMode))
      } catch {
        /* storage blocked */
      }
      return mode
    } catch {
      return "demo"
    }
  })
}

async function parseAuthResponse(res: Response): Promise<AuthResult> {
  const body = (await res.json().catch(() => ({}))) as {
    user?: AuthUser
    message?: string
    error?: string
  }

  if (res.status === 503) {
    return { ok: false, status: 503, demoFallback: true, message: body.message }
  }

  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      errorCode: body.error,
      message: body.message ?? body.error ?? "Request failed",
    }
  }

  if (!body.user?.id) {
    return { ok: false, status: res.status, message: "Invalid server response" }
  }

  return { ok: true, user: body.user }
}

export async function registerOnServer(input: {
  email: string
  password: string
  name: string
}): Promise<AuthResult> {
  const res = await fetch("/api/v1/auth/register", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  return parseAuthResponse(res)
}

export async function loginOnServer(input: {
  email: string
  password: string
}): Promise<AuthResult> {
  const res = await fetch("/api/v1/auth/login", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  return parseAuthResponse(res)
}

export async function logoutOnServer(): Promise<void> {
  try {
    await fetch("/api/v1/auth/logout", { method: "POST", credentials: "include" })
  } catch {
    /* ignore */
  }
}

export async function refreshSessionOnServer(): Promise<boolean> {
  try {
    const res = await fetch("/api/v1/auth/refresh", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
    return res.ok
  } catch {
    return false
  }
}

export async function requestPasswordReset(email: string): Promise<
  | { ok: true; message?: string }
  | { ok: false; status: number; message?: string; demoFallback?: boolean }
> {
  const res = await fetch("/api/v1/auth/forgot-password", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  })
  const body = (await res.json().catch(() => ({}))) as { message?: string; error?: string }

  if (res.status === 503) {
    return { ok: false, status: 503, demoFallback: true, message: body.message }
  }
  if (!res.ok) {
    return { ok: false, status: res.status, message: body.message ?? body.error }
  }
  return { ok: true, message: body.message }
}

export async function resetPasswordOnServer(input: {
  token: string
  password: string
}): Promise<{ ok: true; message?: string } | { ok: false; status: number; message?: string }> {
  const res = await fetch("/api/v1/auth/reset-password", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  const body = (await res.json().catch(() => ({}))) as { message?: string; error?: string }
  if (!res.ok) {
    return { ok: false, status: res.status, message: body.message ?? body.error }
  }
  return { ok: true, message: body.message }
}

function profileCoords(profile: StoredUserProfile): { lat: number; lng: number } | null {
  if (profile.cityId) {
    return getCityCoords(profile.cityId)
  }
  return null
}

export async function syncRegistrationProfile(profile: StoredUserProfile): Promise<void> {
  const catalog = await fetchInterests()
  const slugs = slugsFromInterestIds((profile.interests ?? []) as InterestId[])
  const dbIds = interestIdsFromSlugs(slugs, catalog)
  const coords = profileCoords(profile)

  const serverGender =
    profile.gender === "male" || profile.gender === "female" ? profile.gender : null

  await updateUserDiscoveryProfile({
    gender: serverGender,
    latitude: coords?.lat ?? null,
    longitude: coords?.lng ?? null,
    profile: {
      bio: profile.bio,
      birthdate: profile.birthdate,
      lookingFor: profile.lookingFor,
      gender: profile.gender,
      cityId: profile.cityId,
      customCity: profile.customCity,
      vibeIds: profile.vibeIds,
      energyTagIds: profile.energyTagIds,
      intention: profile.intention,
      mood: profile.mood,
      communicationStyle: profile.communicationStyle,
      connectionPref: profile.connectionPref,
      promptFavorite: profile.promptFavorite,
      photoUrls: profile.photoUrls,
      ...(profile.sensitiveDataConsentAt ? { sensitiveDataConsentAt: profile.sensitiveDataConsentAt } : {}),
    },
  })

  if (dbIds.length > 0) {
    await saveUserInterests(dbIds)
  }
}

export function localProfileFromAuthUser(
  user: AuthUser,
  patch: Partial<StoredUserProfile> = {}
): StoredUserProfile {
  return {
    name: user.name,
    email: user.email,
    bio: patch.bio ?? "",
    gender: patch.gender ?? "male",
    lookingFor: patch.lookingFor ?? "all",
    registeredAt: patch.registeredAt ?? Date.now(),
    ...patch,
  }
}

/** Resend email verification. Rate-limited server-side (3 per 15 min). */
export async function resendVerificationEmail(input: {
  email: string
  password: string
}): Promise<{ ok: boolean; message?: string }> {
  try {
    const res = await fetch("/api/v1/auth/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })
    if (res.status === 429) {
      return { ok: false, message: "rate_limited" }
    }
    if (!res.ok) return { ok: false }
    return { ok: true }
  } catch {
    return { ok: false }
  }
}
