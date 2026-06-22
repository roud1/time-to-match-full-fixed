import type { StoredUserProfile } from "@/lib/user-profile"
import type { InterestId } from "@/lib/interests"
import { getCityCoords } from "@/lib/cities"
import {
  fetchInterests,
  saveUserInterests,
  updateUserDiscoveryProfile,
} from "@/lib/discover/api"
import { interestIdsFromSlugs, slugsFromInterestIds } from "@/lib/discover/interest-overlap"

export type AppMode = "demo" | "production"

export type AuthUser = {
  id: string
  email: string
  name: string
}

type AuthResult =
  | { ok: true; user: AuthUser }
  | { ok: false; status: number; message?: string; demoFallback?: boolean }

let cachedMode: { mode: AppMode; at: number } | null = null

export async function getAppMode(): Promise<AppMode> {
  if (cachedMode && Date.now() - cachedMode.at < 60_000) return cachedMode.mode
  try {
    const res = await fetch("/api/ready", { cache: "no-store" })
    const data = (await res.json()) as { mode?: string }
    const mode: AppMode = data.mode === "demo" ? "demo" : "production"
    cachedMode = { mode, at: Date.now() }
    return mode
  } catch {
    return "demo"
  }
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
