import type { CityId } from "@/client/lib/cities"
import type { InterestId } from "@/client/lib/interests"
import type { DatingPurpose } from "@/client/lib/interests/types"
import { DEFAULT_MAX_DISTANCE_KM } from "@/client/lib/interests/types"
import { getProfilePhotos } from "@/client/lib/profile-photos"
import { markLocationSettled } from "@/client/lib/location-settled"

function profileHasCity(profile: StoredUserProfile): boolean {
  if (profile.cityId) return true
  return Boolean(profile.customCity?.trim())
}

const PROFILE_KEY = "ttm-user-profile"
const CREDENTIALS_KEY = "ttm-user-credentials"
const SESSION_KEY = "ttm-session"
export const DEMO_SESSION_COOKIE = "ttm_demo_session"

const DEMO_SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 7

export function syncDemoSessionCookie() {
  if (typeof document === "undefined") return
  document.cookie = `${DEMO_SESSION_COOKIE}=1; path=/; max-age=${DEMO_SESSION_MAX_AGE_SEC}; SameSite=Lax`
}

function clearDemoSessionCookie() {
  if (typeof document === "undefined") return
  document.cookie = `${DEMO_SESSION_COOKIE}=; path=/; max-age=0; SameSite=Lax`
}

export type StoredUserProfile = {
  name: string
  email: string
  cityId?: CityId
  customCity?: string
  bio: string
  interests?: InterestId[]
  gender: "male" | "female" | "other"
  lookingFor: "men" | "women" | "all"
  birthdate?: string
  /** @deprecated use photoUrls */
  photoUrl?: string
  photoUrls?: string[]
  registeredAt: number
  /** Optional personality layer (saved with profile). */
  vibeIds?: string[]
  intention?: string
  mood?: string
  /** Short answer to a “favorite” prompt. */
  promptFavorite?: string
  /** Emotional energy tags (Phase 9). */
  energyTagIds?: string[]
  /** How user prefers to communicate. */
  communicationStyle?: string
  /** Connection rhythm preference. */
  connectionPref?: string
  /** Demo flag: user engaged with voice intro UI. */
  voiceIntroRecorded?: boolean
  /** Unix ms — demo premium expiry */
  premiumUntil?: number
  /** Purchased +24h extensions (demo), added to base 72h window */
  profileExtraTimeMs?: number
  /** Dating goal synced with server */
  purpose?: DatingPurpose
  /** Preferred age range for discover feed (stored on server). */
  ageMin?: number | null
  ageMax?: number | null
  latitude?: number | null
  longitude?: number | null
  maxDistance?: number
  /** DB interest ids (catalog) */
  dbInterestIds?: number[]
}

type StoredCredentials = {
  email: string
  password: string
}

type Session = {
  email: string
  remember: boolean
  loggedInAt: number
}

export function clearCredentials() {
  if (typeof window === "undefined") return
  localStorage.removeItem(CREDENTIALS_KEY)
}

/** Persist profile locally. Pass password only for demo-mode credential storage. */
export function saveUserProfile(profile: StoredUserProfile, password?: string) {
  if (typeof window === "undefined") return
  const stored = { ...profile }
  if (stored.photoUrls?.length) delete stored.photoUrl
  localStorage.setItem(PROFILE_KEY, JSON.stringify(stored))
  if (password !== undefined) {
    localStorage.setItem(
      CREDENTIALS_KEY,
      JSON.stringify({
        email: profile.email.toLowerCase(),
        password,
      } satisfies StoredCredentials)
    )
  }
  if (profileHasCity(profile)) markLocationSettled()
  window.dispatchEvent(new CustomEvent("ttm-auth-changed"))
}

export function applyServerUserToLocalProfile(
  patch: Partial<StoredUserProfile> & Pick<StoredUserProfile, "name" | "email">
): StoredUserProfile {
  const existing = getUserProfile()
  const next: StoredUserProfile = {
    ...existing,
    ...patch,
    name: patch.name,
    email: patch.email,
    bio: patch.bio ?? existing?.bio ?? "",
    gender: patch.gender ?? existing?.gender ?? "male",
    lookingFor: patch.lookingFor ?? existing?.lookingFor ?? "all",
    registeredAt: patch.registeredAt ?? existing?.registeredAt ?? Date.now(),
  }
  if (next.photoUrls?.length) delete next.photoUrl
  if (typeof window !== "undefined") {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(next))
    window.dispatchEvent(new CustomEvent("ttm-auth-changed"))
  }
  if (profileHasCity(next)) markLocationSettled()
  return next
}

export function updateUserProfile(
  patch: Partial<Omit<StoredUserProfile, "email" | "registeredAt">>
) {
  if (typeof window === "undefined") return null
  const current = getUserProfile()
  if (!current) return null
  const next = { ...current, ...patch } as StoredUserProfile
  if (patch.photoUrls !== undefined) {
    next.photoUrls = patch.photoUrls
    delete next.photoUrl
  }
  localStorage.setItem(PROFILE_KEY, JSON.stringify(next))
  if (profileHasCity(next)) markLocationSettled()
  return next
}

export function getAgeFromBirthdate(birthdate?: string): number | null {
  if (!birthdate) return null
  const birth = new Date(birthdate)
  if (Number.isNaN(birth.getTime())) return null
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age >= 0 ? age : null
}

export function getUserProfile(): StoredUserProfile | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    if (!raw) return null
    const profile = JSON.parse(raw) as StoredUserProfile
    const photos = getProfilePhotos(profile)
    if (photos.length > 0 && !profile.photoUrls?.length) {
      return { ...profile, photoUrls: photos }
    }
    return profile
  } catch {
    return null
  }
}

function getCredentials(): StoredCredentials | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(CREDENTIALS_KEY)
    if (!raw) return null
    return JSON.parse(raw) as StoredCredentials
  } catch {
    return null
  }
}

export function hasRegisteredAccount(): boolean {
  return getUserProfile() !== null && getCredentials() !== null
}

export function verifyLogin(email: string, password: string): boolean {
  const profile = getUserProfile()
  const credentials = getCredentials()
  if (!profile || !credentials) return false

  return (
    profile.email.toLowerCase() === email.trim().toLowerCase() &&
    credentials.email === email.trim().toLowerCase() &&
    credentials.password === password
  )
}

export function setSession(email: string, remember: boolean) {
  if (typeof window === "undefined") return
  const session: Session = {
    email: email.trim().toLowerCase(),
    remember,
    loggedInAt: Date.now(),
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  syncDemoSessionCookie()
  window.dispatchEvent(new CustomEvent("ttm-auth-changed"))
}

export function getSession(): Session | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw) as Session
  } catch {
    return null
  }
}

export function isLoggedIn(): boolean {
  const session = getSession()
  const profile = getUserProfile()
  if (!session || !profile) return false
  return session.email === profile.email.toLowerCase()
}

export function clearSession() {
  if (typeof window === "undefined") return
  localStorage.removeItem(SESSION_KEY)
  clearDemoSessionCookie()
  window.dispatchEvent(new CustomEvent("ttm-auth-changed"))
}

export const PROFILE_DURATION_MS = 72 * 60 * 60 * 1000
export const PROFILE_EXTENSION_MS = 24 * 60 * 60 * 1000
export const PREMIUM_DURATION_MS = 14 * 24 * 60 * 60 * 1000

export type ProfileTimerSource = Pick<StoredUserProfile, "registeredAt" | "profileExtraTimeMs">

export function getProfileEndsAt(source: ProfileTimerSource) {
  return source.registeredAt + PROFILE_DURATION_MS + (source.profileExtraTimeMs ?? 0)
}

export function getProfileTotalDurationMs(source: ProfileTimerSource) {
  return PROFILE_DURATION_MS + (source.profileExtraTimeMs ?? 0)
}

export function isPremiumActive(profile: StoredUserProfile): boolean {
  return typeof profile.premiumUntil === "number" && profile.premiumUntil > Date.now()
}

export function activatePremium(profile: StoredUserProfile, durationMs = PREMIUM_DURATION_MS) {
  const next = updateUserProfile({ premiumUntil: Date.now() + durationMs })
  if (typeof window !== "undefined" && next) {
    window.dispatchEvent(new CustomEvent("ttm-user-profile-changed"))
  }
  return next
}

export function getPremiumTimeLeft(premiumUntil: number) {
  const remaining = Math.max(0, premiumUntil - Date.now())
  const days = Math.floor(remaining / (1000 * 60 * 60 * 24))
  const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  return { days, hours, remaining }
}

export function getProfileTimeLeft(source: ProfileTimerSource) {
  const endsAt = getProfileEndsAt(source)
  const remaining = Math.max(0, endsAt - Date.now())
  const hours = Math.floor(remaining / (1000 * 60 * 60))
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((remaining % (1000 * 60)) / 1000)
  return { hours, minutes, seconds, remaining, endsAt }
}

export function isProfileExpired(source: ProfileTimerSource): boolean {
  return getProfileTimeLeft(source).remaining <= 0
}

/** Demo purchase: extend profile visibility by 24 hours (stackable). */
export function extendProfile24Hours() {
  const current = getUserProfile()
  if (!current) return null
  const next = updateUserProfile({
    profileExtraTimeMs: (current.profileExtraTimeMs ?? 0) + PROFILE_EXTENSION_MS,
  })
  if (typeof window !== "undefined" && next) {
    window.dispatchEvent(new CustomEvent("ttm-user-profile-changed"))
  }
  return next
}

export function getProfileExtensionCount(profile: StoredUserProfile) {
  const extra = profile.profileExtraTimeMs ?? 0
  if (extra <= 0) return 0
  return Math.round(extra / PROFILE_EXTENSION_MS)
}
